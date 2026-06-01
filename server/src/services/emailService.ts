import { Resend } from 'resend';

interface InvitationEmailInput {
  to: string;
  inviteLink: string;
  inviterName: string;
  companyName?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function requireResendConfig() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured. Add it to your environment before sending invitations.');
  }

  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL || 'Digital Wave CRM <onboarding@resend.dev>',
  };
}

export async function sendInvitationEmail({
  to,
  inviteLink,
  inviterName,
  companyName = 'Digital Wave CRM',
}: InvitationEmailInput) {
  const { apiKey, from } = requireResendConfig();
  const resend = new Resend(apiKey);
  const safeCompanyName = escapeHtml(companyName);
  const safeInviterName = escapeHtml(inviterName);
  const safeInviteLink = escapeHtml(inviteLink);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: `You're invited to join ${companyName}`,
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
    throw new Error(error.message || 'Resend failed to send the invitation email');
  }

  return data;
}
