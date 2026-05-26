import { Router } from 'express';

export const aiRoutes = Router();

aiRoutes.post('/ask', async (request, response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = String(request.body.prompt ?? '');
  const context = String(request.body.context ?? '');

  if (!prompt.trim()) {
    return response.status(400).json({ error: 'Prompt is required' });
  }

  if (!apiKey) {
    return response.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  }

  try {
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
            content: 'You are a concise CRM assistant for Digital Wave CRM. Give practical sales and workflow recommendations.',
          },
          {
            role: 'user',
            content: `CRM context:\n${context}\n\nUser request:\n${prompt}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(await aiResponse.text());
    }

    const data = await aiResponse.json() as { output_text?: string };
    return response.json({ answer: data.output_text ?? 'AI completed the request, but returned an empty answer.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed';
    return response.status(502).json({ error: message });
  }
});
