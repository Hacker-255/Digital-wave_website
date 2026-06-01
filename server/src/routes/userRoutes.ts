import { Router } from 'express';
import type { Request } from 'express';
import { requireAuth, requireManager } from '../middleware/auth';
import {
  getUsers, getUserById, createUser, updateUserRole, deleteUser,
  recordLogin, recordLogout, getLoginSessions, getOnlineUsers,
  getInvitations, inviteUser, transferOwnership, getUserByClerkId, acceptInvitation,
} from '../services/userService';
import { sendInvitationEmail } from '../services/emailService';

const router = Router();

router.use(requireAuth);

router.get('/', requireManager, (_req, res) => {
  res.json({ users: getUsers() });
});

router.get('/online', (_req, res) => {
  res.json({ online: getOnlineUsers() });
});

router.get('/sessions', requireManager, (_req, res) => {
  res.json({ sessions: getLoginSessions() });
});

router.get('/sessions/:userId', requireManager, (req, res) => {
  const uid = req.params.userId as string;
  res.json({ sessions: getLoginSessions(uid) });
});

router.get('/invitations', requireManager, (_req, res) => {
  res.json({ invitations: getInvitations() });
});

function requestOrigin(req: Request) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || '127.0.0.1:5173';
  return `${Array.isArray(proto) ? proto[0] : proto}://${Array.isArray(host) ? host[0] : host}`;
}

router.post('/invite', requireManager, async (req, res) => {
  try {
    const requester = req.authUser ? getUserByClerkId(req.authUser.clerkId) : undefined;
    if (!requester) return res.status(401).json({ error: 'Inviting user not found' });
    const { email, role = 'Employee' } = req.body;
    const invitation = inviteUser(email, role, requester);
    const inviteLink = `${requestOrigin(req)}/crm?invitation_token=${encodeURIComponent(invitation.token)}`;

    await sendInvitationEmail({
      to: invitation.email,
      inviteLink,
      inviterName: requester.name,
    });

    const { token: _token, ...safeInvitation } = invitation;
    res.status(201).json({ invitation: safeInvitation, inviteLink });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to invite user';
    const status = message.includes('RESEND') || message.toLowerCase().includes('resend') ? 502 : 400;
    res.status(status).json({ error: message });
  }
});

router.post('/accept-invitation', (req, res) => {
  try {
    if (!req.authUser) return res.status(401).json({ error: 'Not authenticated' });
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Invitation token is required' });
    const user = acceptInvitation(token, {
      clerkId: req.authUser.clerkId,
      email: req.authUser.email,
      name: req.authUser.name,
    });
    res.json({ ok: true, role: user.role });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to accept invitation';
    res.status(400).json({ error: message });
  }
});

router.patch('/transfer-owner/:id', requireManager, (req, res) => {
  try {
    const requester = req.authUser ? getUserByClerkId(req.authUser.clerkId) : undefined;
    if (!requester) return res.status(401).json({ error: 'Requesting user not found' });
    const user = transferOwnership(req.params.id as string, requester);
    res.json({ user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to transfer ownership';
    res.status(400).json({ error: message });
  }
});

router.get('/:id', (req, res) => {
  const uid = req.params.id as string;
  const user = getUserById(uid);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.post('/', requireManager, (req, res) => {
  try {
    const { clerkId, email, name, role } = req.body;
    if (!clerkId || !email || !name) {
      return res.status(400).json({ error: 'clerkId, email, and name are required' });
    }
    const user = createUser(
      { clerkId, email, name, role },
      req.authUser?.role,
    );
    res.status(201).json({ user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create user';
    res.status(400).json({ error: message });
  }
});

router.patch('/:id/role', requireManager, (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    const uid = req.params.id as string;
    const user = updateUserRole(uid, role, req.authUser!.role);
    res.json({ user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update role';
    res.status(400).json({ error: message });
  }
});

router.delete('/:id', requireManager, (req, res) => {
  try {
    const uid = req.params.id as string;
    deleteUser(uid, req.authUser!.role);
    res.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete user';
    res.status(400).json({ error: message });
  }
});

router.post('/track/login', (req, res) => {
  const { clerkId, device, browser } = req.body;
  if (!clerkId) return res.status(400).json({ error: 'clerkId required' });
  if (req.authUser && req.authUser.clerkId !== clerkId) {
    return res.status(403).json({ error: 'Cannot track login for another user' });
  }
  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp = Array.isArray(forwardedFor) ? forwardedFor[0] : (forwardedFor || req.socket.remoteAddress || 'Unknown');
  const user = recordLogin(clerkId, device || 'Unknown', browser || 'Unknown', clientIp);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.post('/track/logout', (req, res) => {
  const { clerkId } = req.body;
  if (!clerkId) return res.status(400).json({ error: 'clerkId required' });
  if (req.authUser && req.authUser.clerkId !== clerkId) {
    return res.status(403).json({ error: 'Cannot track logout for another user' });
  }
  const user = recordLogout(clerkId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

export { router as userRoutes };
