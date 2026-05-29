import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY;
const EMBED_MODEL = 'embed-english-light-v3.0';

export interface KBDocument {
  id: string;
  title: string;
  slug: string;
  content: string;
  similarity?: number;
}

export interface RAGContext {
  chunks: KBDocument[];
  query: string;
}

async function embedQuery(query: string): Promise<number[] | null> {
  try {
    const resp = await fetch('https://api.cohere.com/v2/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [query],
        model: EMBED_MODEL,
        input_type: 'search_query',
        embedding_types: ['float'],
      }),
    });

    if (!resp.ok) {
      console.error('[RAG] Cohere embed error:', resp.status, await resp.text());
      return null;
    }

    const data = await resp.json();
    return data.embeddings.float[0];
  } catch (err) {
    console.error('[RAG] embed error:', err);
    return null;
  }
}

export async function retrieveContext(query: string, topK = 5): Promise<RAGContext> {
  const embedding = await embedQuery(query);
  let chunks: KBDocument[] = [];

  if (embedding) {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: topK,
    });
    if (!error && data?.length) chunks = data as KBDocument[];
  }

  if (chunks.length < topK) {
    const needed = topK - chunks.length;
    const existingIds = new Set(chunks.map((c) => c.id));
    const { data, error } = await supabase
      .from('kb_documents')
      .select('id, title, slug, content')
      .textSearch('fts', query, { type: 'websearch', config: 'english' })
      .limit(needed * 2);
    if (!error && data?.length) {
      const deduped = (data as KBDocument[]).filter((r) => !existingIds.has(r.id));
      chunks = [...chunks, ...deduped.slice(0, needed)];
    }
  }

  return { chunks, query };
}

export function formatContextForPrompt(context: RAGContext): string {
  if (!context.chunks.length) return '[No relevant knowledge base entries found.]';
  return context.chunks.map((chunk, i) => {
    const sim = chunk.similarity != null
      ? ` (relevance: ${(chunk.similarity * 100).toFixed(0)}%)`
      : '';
    return `--- SOURCE ${i + 1}: ${chunk.title} [/${chunk.slug}]${sim} ---\n${chunk.content.trim()}\n`;
  }).join('\n');
}
