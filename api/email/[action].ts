import {
  requireClerkUser,
  setJsonHeaders,
  supabaseServiceRequest,
  type VercelRequest,
  type VercelResponse,
} from '../_serverHelpers.js';
import {
  EmailDeliveryError,
  sendCrmNotificationEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
  sendTestEmail,
  sendWelcomeEmail,
} from '../_emailService.js';

type EmailBody = {
  type?: 'password-reset' | 'crm-notification' | 'payment-confirmation';
  to?: string;
  message?: string;
  resetLink?: string;
  actionUrl?: string;
  planName?: string;
  amount?: string;
};

type EmailRequest = VercelRequest<EmailBody> & {
  query?: Record<string, string | string[] | undefined>;
};

type ProfileRow = {
  id: string;
  role: string;
};

const MANAGER_ROLES = new Set(['Owner', 'Admin', 'Manager']);

function actionName(request: EmailRequest) {
  const value = request.query?.action;
  return Array.isArray(value) ? value[0] : value;
}

async function requireManager(userId: string) {
  const profiles = await supabaseServiceRequest<ProfileRow[]>(`profiles?select=id,role&id=eq.${encodeURIComponent(userId)}`);
  const requesterProfile = profiles[0];
  return Boolean(requesterProfile && MANAGER_ROLES.has(requesterProfile.role));
}

export default async function handler(request: EmailRequest, response: VercelResponse) {
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
    const action = actionName(request);

    if (action === 'welcome') {
      const result = await sendWelcomeEmail(requester.email, requester.name);
      response.status(200).json({ ok: true, id: result?.id, to: requester.email });
      return;
    }

    if (!await requireManager(requester.id)) {
      response.status(403).json({ error: 'Only admins and managers can send CRM emails' });
      return;
    }

    if (action === 'test') {
      const to = request.body?.to?.trim().toLowerCase() || requester.email;
      const result = await sendTestEmail(to, requester.name);
      response.status(200).json({ ok: true, id: result?.id, to });
      return;
    }

    if (action === 'send') {
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
      return;
    }

    response.status(404).json({ error: 'Email action not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    const status = error instanceof EmailDeliveryError
      ? error.status
      : message.includes('Authorization') ? 401 : message.includes('environment') || message.includes('configured') ? 500 : 400;
    response.status(status).json({ error: message });
  }
}
