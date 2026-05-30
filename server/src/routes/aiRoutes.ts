import { Router } from 'express';

export const aiRoutes = Router();

aiRoutes.post('/ask', async (request, response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = String(request.body?.prompt ?? '').trim();
  const context = typeof request.body?.context === 'string'
    ? request.body.context.trim()
    : JSON.stringify(request.body?.context ?? {}, null, 2);

  if (!prompt) {
    return response.status(400).json({ error: 'Prompt is required and cannot be empty' });
  }

  if (prompt.length > 2000) {
    return response.status(400).json({ error: 'Prompt is too long (max 2000 characters)' });
  }

  if (!apiKey) {
    return response.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  }

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a concise CRM assistant for Digital Wave CRM. Give practical sales and workflow recommendations.',
          },
          {
            role: 'user',
            content: `CRM context:\n${context}\n\nUser request:\n${prompt}`,
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API returned ${aiResponse.status}`);
    }

    const data = await aiResponse.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = data.choices?.[0]?.message?.content ?? 'AI completed the request, but returned an empty answer.';
    return response.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed';
    return response.status(502).json({ error: message });
  }
});
