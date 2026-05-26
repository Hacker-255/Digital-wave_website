type AskRequest = {
  prompt?: string;
  context?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(request: { method?: string; body?: AskRequest }, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).json({});
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    response.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    return;
  }

  const prompt = request.body?.prompt?.trim();
  if (!prompt) {
    response.status(400).json({ error: 'Prompt is required.' });
    return;
  }

  const aiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: 'You are Digital Wave CRM AI. Give concise CRM advice, prioritize next actions, and use the provided CRM context.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nCRM context:\n${JSON.stringify(request.body?.context ?? {}, null, 2)}`,
        },
      ],
    }),
  });

  const data = await aiResponse.json() as { output_text?: string; error?: { message?: string } };

  if (!aiResponse.ok) {
    response.status(aiResponse.status).json({ error: data.error?.message || 'OpenAI request failed.' });
    return;
  }

  response.status(200).json({ answer: data.output_text || 'No answer returned.' });
}
