import { createCustomerMeeting } from '../_meetingReminderService.js';
import {
  requireClerkUser,
  setJsonHeaders,
  type VercelRequest,
  type VercelResponse,
} from '../_serverHelpers.js';

type ScheduleMeetingBody = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  meetingTime?: string;
  title?: string;
  notes?: string;
};

export default async function handler(request: VercelRequest<ScheduleMeetingBody>, response: VercelResponse) {
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
    await requireClerkUser(request);
    const meeting = await createCustomerMeeting({
      customerName: request.body?.customerName || '',
      customerEmail: request.body?.customerEmail || '',
      customerPhone: request.body?.customerPhone,
      meetingTime: request.body?.meetingTime || '',
      title: request.body?.title,
      notes: request.body?.notes,
    }, request);

    response.status(201).json({ ok: true, meeting });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to schedule meeting reminder.';
    const status = message.includes('Authorization') || message.includes('session') ? 401 : message.includes('environment') || message.includes('configured') ? 500 : 400;
    response.status(status).json({ error: message });
  }
}
