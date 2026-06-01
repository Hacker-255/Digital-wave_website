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

export async function generateGeminiAnswer({
  prompt,
  context,
  systemInstruction = 'You are a concise CRM assistant for Digital Wave CRM. Give practical sales and workflow recommendations.',
  maxOutputTokens = 700,
}: GenerateGeminiInput) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
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
          text: `CRM context:\n${JSON.stringify(context ?? {}, null, 2)}\n\nUser request:\n${prompt}`,
        }],
      }],
      generationConfig: {
        maxOutputTokens,
      },
    }),
  });

  const data = await response.json().catch(() => ({})) as GeminiResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API returned ${response.status}`);
  }

  const answer = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  return answer || 'Gemini completed the request, but returned an empty answer.';
}
