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
    return response.json({
      answer: 'AI is ready, but OPENAI_API_KEY is not configured on the server. Suggested next steps: prioritize hot leads, follow up on proposal-stage opportunities, and automate follow-up tasks.',
    });
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
  } catch {
    return response.json({
      answer: 'AI fallback: focus on Acme Cloud follow-up, Northstar AI security review, and Blue Ridge Labs contract completion. Add a workflow that creates a task when an opportunity enters proposal.',
    });
  }
});
