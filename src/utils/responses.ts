import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// 1. Setup Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// 2. Setup Groq with the safest settings for a browser
const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export async function getTheaResponse(userQuery: string) {
  // Try to get data from your Supabase table
  const { data: contextDocs } = await supabase
    .from('kb_documents')
    .select('title, content')
    .or(`content.ilike.%${userQuery}%,title.ilike.%${userQuery}%`)
    .limit(3);

  let gnosisMemory = contextDocs?.length 
    ? contextDocs.map((doc: any) => `[${doc.title}]: ${doc.content}`).join("\n\n") 
    : "VOID STATE";

  const systemPrompt = `You are THEA. Gnosis: ${gnosisMemory}`;

  try {
    // We are using 'llama-3.3-70b-versatile' because it's Groq's current "standard"
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery }
      ],
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.8,
    });

    return chatCompletion.choices[0]?.message?.content || "Transmission failed.";
  } catch (err: any) {
    // This will show you a clearer error on the screen if it fails again
    return `THEA is offline: ${err?.message || "Check API Keys"}`;
  }
}
