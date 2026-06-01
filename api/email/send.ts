import {
  requireClerkUser,
  setJsonHeaders,
  supabaseRequest,
  type VercelRequest,
  type VercelResponse,
} from '../_serverHelpers';
import {
  EmailDeliveryError,
  sendCrmNotificationEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
} from '../_emailService';

type EmailType = 'password-reset' | 'crm-notification' | 'payment-confirmation';

type SendBody = {
  type?: EmailType;
  to?: string;
  message?: string;
  resetLink?: string;
  actionUrl?: string;
  planName?: string;
  amount?: string;
};

type ProfileRow = {
  id: string;
  role: string;
};

const MANAGER_ROLES = new Set(['Owner', 'Admin', 'Manager']);

export default async function handler(request: VercelRequest<SendBody>, response: VercelResponse) {
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
      response.status(403).json({ error: 'Only admins and managers can send CRM emails' });
      return;
    }

    const to = request.body?.to?.trim().toLowerCase() || '';
    const type = request.body?.type;
    let result: { id?: string } | null | undefined;

    if (type === 'password-reset') {
      if (!request.body?.resetLink) throw new EmailDeliveryError('Password reset email requires resetLink.', 400);
      result = await sendPasswordResetEmail(to, request.body.resetLink);
    } else if (type === 'crm-notification') {
      if (!request.body?.message) throw new EmailDeliveryError('CRM notification email requires message.', 400);
      result = await sendCrmNotificationEmail(to, request.body.message, request.body.actionUrl);
    } else if (type === 'payment-confirmation') {
      result = await sendPaymentConfirmationEmail(to, request.body?.planName || 'Digital Wave CRM', request.body?.amount || 'Confirmed');
    } else {
      throw new EmailDeliveryError('Unsupported email type.', 400);
    }

    response.status(200).json({ ok: true, id: result?.id, to, type });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    const status = error instanceof EmailDeliveryError
      ? error.status
      : message.includes('Authorization') ? 401 : 400;
    response.status(status).json({ error: message });
  }
}
