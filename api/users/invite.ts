import { Resend } from 'resend';
import {
  createInvitationToken,
  getOrigin,
  hashToken,
  requireClerkUser,
  setJsonHeaders,
  supabaseRequest,
  type VercelRequest,
  type VercelResponse,
} from '../_serverHelpers';

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
    if (!process.env.RESEND_API_KEY) {
      response.status(500).json({ error: 'RESEND_API_KEY is not configured' });
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
    const companyName = 'Digital Wave CRM';
    const inviterName = requesterProfile.full_name || requester.name;
    const safeInviteLink = escapeHtml(inviteLink);
    const safeCompanyName = escapeHtml(companyName);
    const safeInviterName = escapeHtml(inviterName);
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Digital Wave CRM <onboarding@resend.dev>',
      to: email,
      subject: "You're Invited to Join Our CRM",
      html: `
        <div style="margin:0;padding:32px;background:#f6f8fb;font-family:Arial,sans-serif;color:#111827">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <div style="padding:28px 32px;background:#0f172a;color:#ffffff">
              <h1 style="margin:0;font-size:22px;line-height:1.3">You're invited to ${safeCompanyName}</h1>
            </div>
            <div style="padding:28px 32px">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6">${safeInviterName} invited you to join the ${safeCompanyName} workspace.</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6">Use the secure invitation link below to sign in and access the shared CRM data.</p>
              <a href="${safeInviteLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">Accept Invitation</a>
              <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6b7280">This invitation expires in 7 days. If you were not expecting this invitation, you can ignore this email.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      await supabaseRequest(
        `invitations?id=eq.${encodeURIComponent(invitation[0].id)}`,
        requester.token,
        { method: 'DELETE' },
      ).catch(() => undefined);
      response.status(502).json({ error: error.message || 'Resend failed to send the invitation email' });
      return;
    }

    response.status(201).json({ invitation: invitation[0], inviteLink });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to invite user';
    response.status(message.includes('Authorization') ? 401 : 400).json({ error: message });
  }
}
