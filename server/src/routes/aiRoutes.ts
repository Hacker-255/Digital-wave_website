import { Router } from 'express';
import { GeminiServiceError, generateGeminiAnswer } from '../services/geminiService';

export const aiRoutes = Router();

aiRoutes.post('/ask', async (request, response) => {
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

  try {
    const answer = await generateGeminiAnswer({
      prompt,
      context,
      maxOutputTokens: 700,
    });
    return response.json({ answer });
  } catch (error) {
    console.error('[AI] Gemini request failed:', error instanceof Error ? error.message : error);
    const message = error instanceof GeminiServiceError ? error.publicMessage : 'AI service failed. Please try again.';
    const status = error instanceof GeminiServiceError ? error.status : 502;
    return response.status(status).json({ error: message });
  }
});
