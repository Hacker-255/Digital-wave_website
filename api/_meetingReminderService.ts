import { randomUUID } from 'crypto';
import { sendMeetingReminderEmail } from './_emailService.js';
import { supabaseServiceRequest, type VercelRequest } from './_serverHelpers.js';

export type CustomerMeetingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  meetingTime: string;
  title?: string;
  notes?: string;
};

type CustomerMeetingRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  meeting_time: string;
  reschedule_id: string;
  reschedule_url: string;
  reminder_60_sent: boolean;
  reminder_30_sent: boolean;
  reminder_15_sent: boolean;
  title: string | null;
  notes: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function appUrl(request?: VercelRequest) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (!request) return 'https://digital-wave.solutions';
  const proto = request.headers['x-forwarded-proto'] || 'https';
  const host = request.headers['x-forwarded-host'] || request.headers.host || 'digital-wave.solutions';
  return `${Array.isArray(proto) ? proto[0] : proto}://${Array.isArray(host) ? host[0] : host}`;
}

function assertMeetingInput(input: CustomerMeetingInput) {
  if (!input.customerName?.trim()) throw new Error('Customer name is required.');
  if (!EMAIL_RE.test(input.customerEmail?.trim() || '')) throw new Error('Enter a valid customer email.');
  const time = new Date(input.meetingTime);
  if (Number.isNaN(time.getTime())) throw new Error('Meeting time must be a valid date and time.');
  return time;
}

export async function createCustomerMeeting(input: CustomerMeetingInput, request?: VercelRequest) {
  const meetingTime = assertMeetingInput(input);
  const rescheduleId = randomUUID();
  const rescheduleUrl = `${appUrl(request)}/reschedule/${encodeURIComponent(rescheduleId)}`;
  const rows = await supabaseServiceRequest<CustomerMeetingRow[]>('customer_meetings?on_conflict=reschedule_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([{
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail.trim().toLowerCase(),
      customer_phone: input.customerPhone?.trim() || null,
      meeting_time: meetingTime.toISOString(),
      reschedule_id: rescheduleId,
      reschedule_url: rescheduleUrl,
      reminder_60_sent: false,
      reminder_30_sent: false,
      reminder_15_sent: false,
      title: input.title?.trim() || null,
      notes: input.notes?.trim() || null,
    }]),
  });

  return rows[0];
}

function dueThreshold(row: CustomerMeetingRow, now: Date): 60 | 30 | 15 | null {
  const minutesUntil = Math.ceil((new Date(row.meeting_time).getTime() - now.getTime()) / 60000);
  if (minutesUntil <= 15 && !row.reminder_15_sent) return 15;
  if (minutesUntil <= 30 && !row.reminder_30_sent) return 30;
  if (minutesUntil <= 60 && !row.reminder_60_sent) return 60;
  return null;
}

export async function sendDueMeetingReminders(now = new Date()) {
  const upper = new Date(now.getTime() + 61 * 60000).toISOString();
  const lower = new Date(now.getTime() - 5 * 60000).toISOString();
  const rows = await supabaseServiceRequest<CustomerMeetingRow[]>(
    `customer_meetings?select=*&meeting_time=gte.${encodeURIComponent(lower)}&meeting_time=lte.${encodeURIComponent(upper)}&order=meeting_time.asc`,
  );

  const sent: Array<{ id: string; minutesBefore: 60 | 30 | 15 }> = [];
  for (const row of rows) {
    const minutesBefore = dueThreshold(row, now);
    if (!minutesBefore) continue;

    await sendMeetingReminderEmail({
      to: row.customer_email,
      customerName: row.customer_name,
      meetingTime: new Date(row.meeting_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      rescheduleId: row.reschedule_id,
      rescheduleUrl: row.reschedule_url,
      minutesBefore,
    });

    await supabaseServiceRequest(`customer_meetings?id=eq.${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        [`reminder_${minutesBefore}_sent`]: true,
        updated_at: new Date().toISOString(),
      }),
    });
    sent.push({ id: row.id, minutesBefore });
  }

  return { checked: rows.length, sent };
}
