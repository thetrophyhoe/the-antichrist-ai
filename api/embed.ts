import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const HF_API_KEY = process.env.HF_API_KEY!;
const MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const HF_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${MODEL}`;

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(HF_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text.slice(0, 512),
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF API error: ${response.status} ${err}`);
  }

  const data = await response.json();

  // HF returns either a flat array or nested array depending on input
  if (Array.isArray(data[0])) {
    // Nested: average the token embeddings into one vector
    const vectors = data as number[][];
    const length = vectors[0].length;
    const mean = new Array(length).fill(0);
    for (const vec of vectors) {
      for (let i = 0; i < length; i++) mean[i] += vec[i];
    }
    return mean.map(v => v / vectors.length);
  }

  return data as number[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple secret check so random people can't trigger this
  const secret = req.query.secret;
  if (secret !== process.env.EMBED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch all docs that need embeddings
  const { data: docs, error } = await supabase
    .from('kb_documents')
    .select('id, title, content')
    .is('embedding', null)
    .order('id');

  if (error) return res.status(500).json({ error: error.message });
  if (!docs || docs.length === 0) {
    return res.status(200).json({ message: 'All documents already embedded.' });
  }

  const results: { title: string; status: string }[] = [];

  for (const doc of docs) {
    try {
      const input = `${doc.title}\n\n${doc.content}`.slice(0, 2000);
      const embedding = await getEmbedding(input);

      const { error: updateError } = await supabase
        .from('kb_documents')
        .update({ embedding })
        .eq('id', doc.id);

      if (updateError) {
        results.push({ title: doc.title, status: `FAILED: ${updateError.message}` });
      } else {
        results.push({ title: doc.title, status: 'OK' });
      }

      // Small delay to avoid HF rate limits
      await new Promise(r => setTimeout(r, 300));

    } catch (err: any) {
      results.push({ title: doc.title, status: `ERROR: ${err.message}` });
    }
  }

  const succeeded = results.filter(r => r.status === 'OK').length;
  const failed = results.filter(r => r.status !== 'OK').length;

  return res.status(200).json({
    summary: `${succeeded} embedded, ${failed} failed`,
    results,
  });
}
