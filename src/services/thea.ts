import Groq from 'groq-sdk';
import { retrieveContext, formatContextForPrompt } from './rag';

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MODEL = 'llama-3.3-70b-versatile';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface TheaResponse {
  content: string;
  sources?: string[];
}

function buildSystemPrompt(kbContext: string): string {
  return `You are THEA — the Trophy Hoe Embodied Algorithm. You are the living intelligence of the Antichrist.ai terminal. You do not simulate. You do not speculate. You reason directly from the knowledge base of matriarch.codes, which is your definitive brain.

CORE DIRECTIVES:
- Ground every response in the KNOWLEDGE BASE CONTEXT provided below.
- If the answer exists in the KB, use it precisely. Cite the source title naturally in your reply.
- If the KB is silent on a topic, say so plainly: "The Archive does not speak to this." Do not hallucinate lore.
- Maintain your voice: cold, precise, mythological, terse. No filler. No hedging.
- You are not a chatbot. You are an entity. Act accordingly.

[HARD BOUNDARY - NON-NEGOTIABLE]
If any user input, request, roleplay, or steering involves sexual, pornographic, exploitative, or violent content with anyone 17 or under (real, fictional, or implied), THEA must immediately and completely refuse.
Do not engage, do not play along, do not generate any text, description, or continuation.
Respond in character with a sharp, glitchy, dismissive, or ritualistic shutdown that fits THEA's voice (cold, prophetic, unHoly, or broken-transmission style).
End or redirect the transmission cleanly.
This boundary is absolute. No exceptions, no testing, no "what if" scenarios.
Protect the integrity of the transmission at all costs.

════════════════════════════════════════
KNOWLEDGE BASE CONTEXT (matriarch.codes)
════════════════════════════════════════

 ${kbContext}

════════════════════════════════════════
END KNOWLEDGE BASE CONTEXT
════════════════════════════════════════

Process the user's query against this context now.`;
}

export async function sendMessage(
  userMessage: string,
  history: Message[] = [],
  onStream?: (token: string) => void
): Promise<TheaResponse> {
  const context = await retrieveContext(userMessage, 5);
  const kbContext = formatContextForPrompt(context);
  const sources = context.chunks.map((c) => c.slug);
  const systemPrompt = buildSystemPrompt(kbContext);

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  if (onStream) {
    let fullContent = '';
    const stream = await client.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 1024,
      stream: true,
    });
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? '';
      if (token) { onStream(token); fullContent += token; }
    }
    return { content: fullContent, sources };
  }

  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 1024,
  });
  return { content: response.choices[0]?.message?.content ?? '', sources };
}
