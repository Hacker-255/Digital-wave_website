import { Resend } from 'resend';

type EmailKind = 'welcome' | 'password-reset' | 'invitation' | 'crm-notification' | 'payment-confirmation' | 'meeting-reminder' | 'test';

type SendEmailInput = {
  kind: EmailKind;
  to: string;
  subject: string;
  heading: string;
  body: string;
  action?: {
    label: string;
    url: string;
  };
  footerNote?: string;
};

export type InvitationEmailInput = {
  to: string;
  inviteLink: string;
  inviterName: string;
  companyName?: string;
};

export type MeetingReminderEmailInput = {
  to: string;
  customerName: string;
  meetingTime: string;
  rescheduleId: string;
  rescheduleUrl: string;
  minutesBefore: 60 | 30 | 15;
};

export class EmailDeliveryError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'EmailDeliveryError';
    this.status = status;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeSender(value: string) {
  const markdownMatch = value.match(/^(.*?)\s*\[([^\]]+)\]\(mailto:[^)]+\)$/i);
  if (markdownMatch) {
    return `${markdownMatch[1].trim()} <${markdownMatch[2].trim()}>`;
  }
  return value;
}

function senderAddress(value: string) {
  return value.match(/<([^>]+)>/)?.[1] || value;
}

function requireResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new EmailDeliveryError('RESEND_API_KEY is not configured. Add it to the server or Vercel environment variables.', 500);
  }

  const from = normalizeSender(process.env.RESEND_FROM_EMAIL || 'Digital Wave <onboarding@resend.dev>');
  if (!isValidEmail(senderAddress(from))) {
    throw new EmailDeliveryError('RESEND_FROM_EMAIL must be a valid sender, for example: Digital Wave <onboarding@resend.dev>.', 500);
  }

  return { apiKey, from };
}

function brandedHtml({ heading, body, action, footerNote }: SendEmailInput) {
  const safeHeading = escapeHtml(heading);
  const safeBody = escapeHtml(body).replace(/\n/g, '<br />');
  const actionHtml = action
    ? `<a href="${escapeHtml(action.url)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">${escapeHtml(action.label)}</a>`
    : '';

  return `
    <div style="margin:0;padding:32px;background:#f6f8fb;font-family:Arial,sans-serif;color:#111827">
      <div style="max-width:580px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="padding:28px 32px;background:#0f172a;color:#ffffff">
          <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#93c5fd">Digital Wave</div>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3">${safeHeading}</h1>
        </div>
        <div style="padding:28px 32px">
          <p style="margin:0 0 22px;font-size:15px;line-height:1.6">${safeBody}</p>
          ${actionHtml}
          <p style="margin:26px 0 0;font-size:12px;line-height:1.5;color:#6b7280">${escapeHtml(footerNote || 'Digital Wave CRM')}</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendDigitalWaveEmail(input: SendEmailInput) {
  if (!isValidEmail(input.to)) {
    throw new EmailDeliveryError('Enter a valid recipient email address.', 400);
  }

  const { apiKey, from } = requireResendConfig();
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: input.to.trim().toLowerCase(),
    subject: input.subject,
    html: brandedHtml(input),
  });

  if (error) {
    const message = error.message || 'Resend failed to send the email.';
    console.error('[Email] Resend delivery failed:', message);
    const invalidSender = /domain|sender|from/i.test(message);
    throw new EmailDeliveryError(invalidSender ? `Invalid sender email: ${message}` : message, 400);
  }

  console.info(`[Email] Sent ${input.kind} email to ${input.to.trim().toLowerCase()}.`);
  return data;
}

export function sendWelcomeEmail(to: string, name = 'there') {
  return sendDigitalWaveEmail({
    kind: 'welcome',
    to,
    subject: 'Welcome to Digital Wave CRM',
    heading: 'Welcome to Digital Wave CRM',
    body: `Hi ${name},\n\nYour CRM workspace is ready. You can now manage contacts, deals, tasks, and team activity from one place.`,
    footerNote: 'Digital Wave CRM - Customer relationship management for growing teams.',
  });
}

export function sendPasswordResetEmail(to: string, resetLink: string) {
  return sendDigitalWaveEmail({
    kind: 'password-reset',
    to,
    subject: 'Reset your Digital Wave password',
    heading: 'Reset your password',
    body: 'Use the secure link below to reset your password. If you did not request this, you can ignore this email.',
    action: { label: 'Reset Password', url: resetLink },
  });
}

export function sendInvitationEmail({ to, inviteLink, inviterName, companyName = 'Digital Wave CRM' }: InvitationEmailInput) {
  return sendDigitalWaveEmail({
    kind: 'invitation',
    to,
    subject: `You are invited to join ${companyName}`,
    heading: `You are invited to ${companyName}`,
    body: `${inviterName} invited you to join the ${companyName} workspace.\n\nUse the secure invitation link below to sign in and access shared CRM data.`,
    action: { label: 'Accept Invitation', url: inviteLink },
    footerNote: 'This invitation expires in 7 days. Digital Wave CRM.',
  });
}

export function sendCrmNotificationEmail(to: string, message: string, actionUrl?: string) {
  return sendDigitalWaveEmail({
    kind: 'crm-notification',
    to,
    subject: 'Digital Wave CRM notification',
    heading: 'CRM notification',
    body: message,
    action: actionUrl ? { label: 'Open CRM', url: actionUrl } : undefined,
  });
}

export function sendPaymentConfirmationEmail(to: string, planName: string, amount: string) {
  return sendDigitalWaveEmail({
    kind: 'payment-confirmation',
    to,
    subject: 'Digital Wave subscription confirmation',
    heading: 'Subscription confirmed',
    body: `Your ${planName} subscription is active.\n\nAmount: ${amount}`,
    footerNote: 'Digital Wave CRM Billing',
  });
}

export function sendMeetingReminderEmail({
  to,
  customerName,
  meetingTime,
  rescheduleId,
  rescheduleUrl,
  minutesBefore,
}: MeetingReminderEmailInput) {
  return sendDigitalWaveEmail({
    kind: 'meeting-reminder',
    to,
    subject: `Reminder: your Digital Wave meeting starts in ${minutesBefore} minutes`,
    heading: 'Meeting reminder',
    body: `Hi ${customerName || 'there'},\n\nThis is a reminder that your meeting is scheduled for ${meetingTime}.\n\nReschedule ID: ${rescheduleId}\n\nUse the link below if you need to reschedule.`,
    action: { label: 'Reschedule Meeting', url: rescheduleUrl },
    footerNote: 'Digital Wave CRM Meeting Reminders',
  });
}

export function sendTestEmail(to: string, actorName = 'Digital Wave admin') {
  return sendDigitalWaveEmail({
    kind: 'test',
    to,
    subject: 'Digital Wave CRM test email',
    heading: 'Test email delivered',
    body: `${actorName} sent this message from the CRM email settings page.\n\nResend is configured correctly for server-side email delivery.`,
    footerNote: 'Digital Wave CRM - Email system test',
  });
}
