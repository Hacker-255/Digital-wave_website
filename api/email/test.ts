import {
  requireClerkUser,
  setJsonHeaders,
  supabaseRequest,
  type VercelRequest,
  type VercelResponse,
} from '../_serverHelpers.js';
import { EmailDeliveryError, sendTestEmail } from '../_emailService.js';

type TestEmailBody = {
  to?: string;
};

type ProfileRow = {
  id: string;
  role: string;
};

const MANAGER_ROLES = new Set(['Owner', 'Admin', 'Manager']);

export default async function handler(request: VercelRequest<TestEmailBody>, response: VercelResponse) {
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
    const profiles = await supabaseRequest<ProfileRow[]>(`profiles?select=id,role&id=eq.${encodeURIComponent(requester.id)}`, requester.token);
    const requesterProfile = profiles[0];
    if (!requesterProfile || !MANAGER_ROLES.has(requesterProfile.role)) {
      response.status(403).json({ error: 'Only admins and managers can send test emails' });
      return;
    }

    const to = request.body?.to?.trim().toLowerCase() || requester.email;
    const result = await sendTestEmail(to, requester.name);
    response.status(200).json({ ok: true, id: result?.id, to });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send test email';
    const status = error instanceof EmailDeliveryError
      ? error.status
      : message.includes('Authorization') ? 401 : 400;
    response.status(status).json({ error: message });
  }
}
