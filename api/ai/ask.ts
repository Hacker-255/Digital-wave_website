import { generateGeminiAnswer } from '../_geminiService.js';

type AskRequest = {
  prompt?: string;
  context?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(
  request: { method?: string; body?: AskRequest },
  response: VercelResponse,
) {
  response.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Content-Type', 'application/json');

  if (request.method === 'OPTIONS') {
    response.status(204).json({});
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const prompt = request.body?.prompt?.trim();
  if (!prompt) {
    response.status(400).json({ error: 'Prompt is required.' });
    return;
  }

  try {
    const answer = await generateGeminiAnswer({
      prompt,
      context: request.body?.context,
      maxOutputTokens: 700,
    });
    response.status(200).json({
      answer,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed.';
    response.status(message.includes('GEMINI_API_KEY') ? 500 : 502).json({ error: message });
  }
}
