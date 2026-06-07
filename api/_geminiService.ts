type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type GenerateGeminiInput = {
  prompt: string;
  context?: unknown;
  systemInstruction?: string;
  maxOutputTokens?: number;
};

export class GeminiServiceError extends Error {
  status: number;
  publicMessage: string;

  constructor(publicMessage: string, status = 502, logMessage?: string) {
    super(logMessage || publicMessage);
    this.name = 'GeminiServiceError';
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

export async function generateGeminiAnswer({
  prompt,
  context,
  systemInstruction = 'You are Digital Wave CRM AI. Give concise, practical CRM and workflow automation help.',
  maxOutputTokens = 700,
}: GenerateGeminiInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiServiceError('AI service is not configured.', 500, 'GEMINI_API_KEY is not configured on the server.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  console.info(`[AI] Gemini configured for model ${model}.`);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [{
        role: 'user',
        parts: [{
          text: `${prompt}\n\nCRM context:\n${JSON.stringify(context ?? {}, null, 2)}`,
        }],
      }],
      generationConfig: {
        maxOutputTokens,
      },
    }),
  });

  const data = await response.json().catch(() => ({})) as GeminiResponse;
  if (!response.ok) {
    const providerMessage = data.error?.message || `Gemini API returned ${response.status}`;
    const publicMessage = response.status === 400 || response.status === 401 || response.status === 403
      ? 'AI service key is invalid or not allowed for this model.'
      : 'AI service failed. Please try again.';
    throw new GeminiServiceError(publicMessage, response.status === 401 || response.status === 403 ? 500 : 502, providerMessage);
  }

  const answer = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  return answer || 'Gemini completed the request, but returned an empty answer.';
}
