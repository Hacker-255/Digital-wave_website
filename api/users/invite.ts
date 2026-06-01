import {
  createInvitationToken,
  getOrigin,
  hashToken,
  requireClerkUser,
  setJsonHeaders,
  supabaseRequest,
  type VercelRequest,
  type VercelResponse,
} from '../_serverHelpers.js';
import { sendInvitationEmail } from '../_emailService.js';

type InviteBody = {
  email?: string;
  role?: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
};

type InvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
};

const ALLOWED_ROLES = new Set(['Admin', 'Manager', 'Employee', 'Viewer']);
const MANAGER_ROLES = new Set(['Owner', 'Admin', 'Manager']);

function resendWarning(message?: string) {
  return message || 'Resend could not send the email. Copy and send the invitation link manually.';
}

export default async function handler(request: VercelRequest<InviteBody>, response: VercelResponse) {
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
    const profiles = await supabaseRequest<ProfileRow[]>(`profiles?select=id,full_name,email,role&id=eq.${encodeURIComponent(requester.id)}`, requester.token);
    const requesterProfile = profiles[0];
    if (!requesterProfile || !MANAGER_ROLES.has(requesterProfile.role)) {
      response.status(403).json({ error: 'Only admins and managers can invite users' });
      return;
    }

    const email = request.body?.email?.trim().toLowerCase();
    const role = request.body?.role && ALLOWED_ROLES.has(request.body.role) ? request.body.role : 'Employee';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      response.status(400).json({ error: 'Enter a valid email address' });
      return;
    }

    const existing = await supabaseRequest<InvitationRow[]>(
      `invitations?select=id,email,role,status,expires_at&email=eq.${encodeURIComponent(email)}&status=eq.pending&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`,
      requester.token,
    );
    if (existing.length > 0) {
      response.status(409).json({ error: 'There is already an active invitation for this email' });
      return;
    }

    const token = createInvitationToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    const invitation = await supabaseRequest<InvitationRow[]>(
      'invitations',
      requester.token,
      {
        method: 'POST',
        body: JSON.stringify([{
          email,
          role,
          token_hash: tokenHash,
          invited_by: requester.id,
          status: 'pending',
          expires_at: expiresAt,
        }]),
      },
    );

    const origin = getOrigin(request);
    const inviteLink = `${origin}/crm?invitation_token=${encodeURIComponent(token)}`;
    if (!process.env.RESEND_API_KEY) {
      response.status(202).json({
        invitation: invitation[0],
        inviteLink,
        emailSent: false,
        warning: 'RESEND_API_KEY is not configured. Copy and send this invitation link manually.',
      });
      return;
    }

    const companyName = 'Digital Wave CRM';
    const inviterName = requesterProfile.full_name || requester.name;
    try {
      await sendInvitationEmail({
        to: email,
        inviteLink,
        inviterName,
        companyName,
      });
    } catch (error) {
      response.status(202).json({
        invitation: invitation[0],
        inviteLink,
        emailSent: false,
        warning: resendWarning(error instanceof Error ? error.message : undefined),
      });
      return;
    }

    response.status(201).json({ invitation: invitation[0], inviteLink, emailSent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to invite user';
    response.status(message.includes('Authorization') ? 401 : 400).json({ error: message });
  }
}
