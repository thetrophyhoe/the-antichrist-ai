export async function getTheaResponse(
  userQuery: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: userQuery, history }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server request failed: ${text}`);
  }

  const data = await response.json();
  return data.text as string;
}
