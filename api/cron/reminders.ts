import { sendDueMeetingReminders } from '../_meetingReminderService.js';
import { setJsonHeaders, type VercelRequest, type VercelResponse } from '../_serverHelpers.js';

function authorized(request: VercelRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.authorization;
  const header = request.headers['x-cron-secret'];
  const bearer = Array.isArray(auth) ? auth[0] : auth;
  const explicit = Array.isArray(header) ? header[0] : header;
  return bearer === `Bearer ${secret}` || explicit === secret;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  setJsonHeaders(response);

  if (request.method !== 'GET' && request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!authorized(request)) {
    response.status(401).json({ error: 'Unauthorized cron request' });
    return;
  }

  try {
    const result = await sendDueMeetingReminders();
    response.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error('[Cron] Meeting reminder job failed:', error instanceof Error ? error.message : error);
    response.status(500).json({ error: 'Reminder job failed.' });
  }
}
