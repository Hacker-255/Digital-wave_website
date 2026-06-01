import {
  createInvitationToken,
  getOrigin,
  hashToken,
  requireClerkUser,
  setJsonHeaders,
  supabaseServiceRequest,
  type VercelRequest,
  type VercelResponse,
} from '../_serverHelpers.js';
import { sendInvitationEmail } from '../_emailService.js';

type InviteBody = {
  companies?: unknown[];
  email?: string;
  ids?: string[];
  module?: string;
  records?: Array<{ id?: string; [key: string]: unknown }>;
  role?: string;
};

type InviteRequest = VercelRequest<InviteBody> & {
  query?: Record<string, string | string[] | undefined>;
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

function queryValue(request: InviteRequest, name: string) {
  const value = request.query?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function idsFilter(ids: string[]) {
  return `(${ids.map((id) => `"${String(id).replace(/"/g, '\\"')}"`).join(',')})`;
}

async function getRequesterProfile(requester: { id: string; email: string; name: string; avatarUrl?: string }) {
  const profiles = await supabaseServiceRequest<ProfileRow[]>(
    `profiles?select=id,full_name,email,role&id=eq.${encodeURIComponent(requester.id)}`,
  );
  if (profiles[0]) return profiles[0];

  const existingManagers = await supabaseServiceRequest<Array<{ id: string }>>(
    'profiles?select=id&role=in.(Owner,Admin,Manager)&limit=1',
  );
  if (existingManagers.length > 0) return null;

  const created = await supabaseServiceRequest<ProfileRow[]>(
    'profiles?on_conflict=id',
    {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify([{
        id: requester.id,
        email: requester.email,
        full_name: requester.name,
        avatar_url: requester.avatarUrl,
        role: 'Owner',
      }]),
    },
  );
  return created[0] || null;
}

async function handleCrmSync(request: InviteRequest, response: VercelResponse) {
  const resource = queryValue(request, 'crmResource');

  if (resource === 'companies') {
    if (request.method === 'GET') {
      const companies = await supabaseServiceRequest('companies?select=*&order=inserted_at.desc');
      response.status(200).json({ companies });
      return;
    }

    if (request.method === 'PUT') {
      const companies = Array.isArray(request.body?.companies) ? request.body.companies : [];
      if (companies.length > 0) {
        await supabaseServiceRequest('companies?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(companies),
        });
      }
      response.status(200).json({ ok: true });
      return;
    }

    if (request.method === 'DELETE') {
      const ids = Array.isArray(request.body?.ids) ? request.body.ids.filter(Boolean) : [];
      if (ids.length > 0) {
        await supabaseServiceRequest(`companies?id=in.${encodeURIComponent(idsFilter(ids))}`, { method: 'DELETE' });
      }
      response.status(200).json({ ok: true });
      return;
    }
  }

  if (resource === 'records') {
    const module = (request.method === 'GET' ? queryValue(request, 'module') : request.body?.module)?.trim();
    if (!module) {
      response.status(400).json({ error: 'Module is required' });
      return;
    }

    if (request.method === 'GET') {
      const records = await supabaseServiceRequest(`crm_records?select=record_id,data&module=eq.${encodeURIComponent(module)}&order=updated_at.desc`);
      response.status(200).json({ records });
      return;
    }

    if (request.method === 'PUT') {
      const records = Array.isArray(request.body?.records) ? request.body.records : [];
      await supabaseServiceRequest(`crm_records?module=eq.${encodeURIComponent(module)}`, { method: 'DELETE' });

      const rows = records
        .filter((record) => record.id)
        .map(({ id, ...data }) => ({
          module,
          record_id: id,
          data,
          updated_at: new Date().toISOString(),
        }));

      if (rows.length > 0) {
        await supabaseServiceRequest('crm_records?on_conflict=module,record_id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(rows),
        });
      }
      response.status(200).json({ ok: true });
      return;
    }
  }

  if (resource === 'health' && request.method === 'GET') {
    const tables = ['profiles', 'companies', 'crm_records', 'workflows', 'invitations'];
    const results = await Promise.all(tables.map(async (table) => {
      try {
        await supabaseServiceRequest(`${table}?select=*&limit=1`);
        return { table, ok: true };
      } catch {
        return { table, ok: false };
      }
    }));

    response.status(200).json({
      ok: results.every((result) => result.ok),
      missing: results.filter((result) => !result.ok).map((result) => result.table),
    });
    return;
  }

  response.status(405).json({ error: 'Method not allowed' });
}

export default async function handler(request: InviteRequest, response: VercelResponse) {
  setJsonHeaders(response);

  if (request.method === 'OPTIONS') {
    response.status(204).json({});
    return;
  }

  if (queryValue(request, 'crmResource')) {
    try {
      await requireClerkUser(request);
      await handleCrmSync(request, response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'CRM sync failed';
      response.status(message.includes('Authorization') ? 401 : 400).json({ error: message });
    }
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const requester = await requireClerkUser(request);
    const requesterProfile = await getRequesterProfile(requester);
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

    const existing = await supabaseServiceRequest<InvitationRow[]>(
      `invitations?select=id,email,role,status,expires_at&email=eq.${encodeURIComponent(email)}&status=eq.pending&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`,
    );
    if (existing.length > 0) {
      response.status(409).json({ error: 'There is already an active invitation for this email' });
      return;
    }

    const token = createInvitationToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    const invitation = await supabaseServiceRequest<InvitationRow[]>(
      'invitations',
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
    const status = message.includes('Authorization')
      ? 401
      : message.includes('environment') || message.includes('configured')
        ? 500
        : 400;
    response.status(status).json({ error: message });
  }
}
