import {
  hashToken,
  requireClerkUser,
  setJsonHeaders,
  supabaseServiceRequest,
  type VercelRequest,
  type VercelResponse,
} from '../_serverHelpers.js';

type AcceptBody = {
  token?: string;
};

type InvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
};

export default async function handler(request: VercelRequest<AcceptBody>, response: VercelResponse) {
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
    const user = await requireClerkUser(request);
    const token = request.body?.token?.trim();
    if (!token) {
      response.status(400).json({ error: 'Invitation token is required' });
      return;
    }

    const tokenHash = hashToken(token);
    const invitations = await supabaseServiceRequest<InvitationRow[]>(
      `invitations?select=id,email,role,status,expires_at&token_hash=eq.${encodeURIComponent(tokenHash)}&status=eq.pending`,
    );
    const invitation = invitations[0];
    if (!invitation) {
      response.status(404).json({ error: 'Invitation was not found or has already been used' });
      return;
    }
    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      response.status(410).json({ error: 'Invitation has expired' });
      return;
    }
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      response.status(403).json({ error: 'This invitation belongs to a different email address' });
      return;
    }

    await supabaseServiceRequest(
      'profiles?on_conflict=id',
      {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify([{
          id: user.id,
          email: user.email,
          full_name: user.name,
          avatar_url: user.avatarUrl,
          role: invitation.role,
          updated_at: new Date().toISOString(),
        }]),
      },
    );

    await supabaseServiceRequest(
      `invitations?id=eq.${encodeURIComponent(invitation.id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        }),
      },
    );

    response.status(200).json({ ok: true, role: invitation.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept invitation';
    const status = message.includes('Authorization')
      ? 401
      : message.includes('environment') || message.includes('configured')
        ? 500
        : 400;
    response.status(status).json({ error: message });
  }
}
