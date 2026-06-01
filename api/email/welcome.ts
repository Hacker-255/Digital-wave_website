import {
  requireClerkUser,
  setJsonHeaders,
  type VercelRequest,
  type VercelResponse,
} from '../_serverHelpers.js';
import { EmailDeliveryError, sendWelcomeEmail } from '../_emailService.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setJsonHeaders(response);

  if (request.method === 'OPTIONS') {
    response.status(204).json({});
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const requester = await requireClerkUser(request);
    const result = await sendWelcomeEmail(requester.email, requester.name);
    response.status(200).json({ ok: true, id: result?.id, to: requester.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send welcome email';
    const status = error instanceof EmailDeliveryError
      ? error.status
      : message.includes('Authorization') ? 401 : 400;
    response.status(status).json({ error: message });
  }
}
