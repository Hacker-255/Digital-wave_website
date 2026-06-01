export type Role = 'Owner' | 'Admin' | 'Manager' | 'Employee' | 'Viewer';

export interface StoredUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  lastLogout?: string;
  online: boolean;
  away: boolean;
  settings?: Record<string, unknown>;
}

interface LoginSession {
  userId: string;
  loginTime: string;
  logoutTime?: string;
  device: string;
  browser: string;
  ip: string;
  active: boolean;
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
  token: string;
  status: 'pending' | 'accepted';
  createdAt: string;
  expiresAt: string;
}

const users: StoredUser[] = [];
const loginSessions: LoginSession[] = [];
const invitations: Invitation[] = [];

const MANAGER_ROLES: Role[] = ['Owner', 'Admin'];

function isManager(role: Role): boolean {
  return MANAGER_ROLES.includes(role);
}

export function getManagerCount(): number {
  return users.filter((u) => isManager(u.role)).length;
}

export function getUsers(): StoredUser[] {
  return [...users];
}

export function getUserById(id: string): StoredUser | undefined {
  return users.find((u) => u.id === id);
}

export function getUserByClerkId(clerkId: string): StoredUser | undefined {
  return users.find((u) => u.clerkId === clerkId);
}

export function getUserByEmail(email: string): StoredUser | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(
  data: { clerkId: string; email: string; name: string; role?: Role; avatar?: string },
  requestedByRole?: Role,
): StoredUser {
  if (data.role && isManager(data.role as Role) && requestedByRole !== 'Owner' && requestedByRole !== 'Admin') {
    throw new Error('Only the CRM Manager can create manager accounts');
  }
  if (data.role === 'Owner') {
    const existing = users.find((u) => u.role === 'Owner');
    if (existing && data.clerkId !== existing.clerkId) {
      throw new Error('Only one Owner account is allowed. Transfer ownership first.');
    }
  }
  if (getUserByEmail(data.email)) {
    throw new Error('A user with this email already exists');
  }

  const user: StoredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    clerkId: data.clerkId,
    email: data.email,
    name: data.name,
    role: data.role || 'Employee',
    avatar: data.avatar,
    createdAt: new Date().toISOString(),
    online: false,
    away: false,
  };
  users.push(user);
  return user;
}

export function ensureUserForLogin(data: { clerkId: string; email: string; name: string; avatar?: string }): StoredUser {
  const existing = getUserByClerkId(data.clerkId) || getUserByEmail(data.email);
  if (existing) {
    existing.clerkId = data.clerkId;
    existing.name = data.name || existing.name;
    existing.avatar = data.avatar || existing.avatar;
    return existing;
  }

  const invitation = invitations.find((item) => item.email.toLowerCase() === data.email.toLowerCase() && item.status === 'pending');
  const isFirstUser = users.length === 0;
  const user = createUser({
    clerkId: data.clerkId,
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    role: isFirstUser ? 'Owner' : invitation?.role ?? 'Viewer',
  }, 'Owner');

  if (invitation) invitation.status = 'accepted';
  return user;
}

export function inviteUser(email: string, role: Role, invitedBy: StoredUser): Invitation {
  if (!isManager(invitedBy.role)) {
    throw new Error('Only admins can invite users');
  }
  if (!email || !email.includes('@')) {
    throw new Error('A valid Gmail/email address is required');
  }
  if (role === 'Owner') {
    throw new Error('Use ownership transfer to assign Owner');
  }
  const existing = invitations.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.status === 'pending');
  if (existing) return existing;

  const invitation: Invitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    email,
    role,
    invitedBy: invitedBy.id,
    token: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 18)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  };
  invitations.push(invitation);
  return invitation;
}

export function getInvitations(): Invitation[] {
  return [...invitations];
}

export function deleteInvitation(id: string): boolean {
  const index = invitations.findIndex((item) => item.id === id);
  if (index === -1) return false;
  invitations.splice(index, 1);
  return true;
}

export function acceptInvitation(token: string, data: { clerkId: string; email: string; name: string; avatar?: string }): StoredUser {
  const invitation = invitations.find((item) => item.token === token && item.status === 'pending');
  if (!invitation) {
    throw new Error('Invitation was not found or has already been used');
  }
  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    throw new Error('Invitation has expired');
  }
  if (invitation.email.toLowerCase() !== data.email.toLowerCase()) {
    throw new Error('This invitation belongs to a different email address');
  }

  const existing = getUserByClerkId(data.clerkId) || getUserByEmail(data.email);
  if (existing) {
    existing.clerkId = data.clerkId;
    existing.name = data.name || existing.name;
    existing.avatar = data.avatar || existing.avatar;
    existing.role = invitation.role;
    invitation.status = 'accepted';
    return existing;
  }

  const user = createUser({
    clerkId: data.clerkId,
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    role: invitation.role,
  }, 'Owner');
  invitation.status = 'accepted';
  return user;
}

export function transferOwnership(targetId: string, requestedBy: StoredUser): StoredUser {
  if (requestedBy.role !== 'Owner') {
    throw new Error('Only the current Owner can transfer ownership');
  }
  const target = getUserById(targetId);
  if (!target) throw new Error('Target user not found');

  const currentOwner = users.find((user) => user.role === 'Owner');
  if (currentOwner) currentOwner.role = 'Admin';
  target.role = 'Owner';
  return target;
}

export function updateUserRole(
  targetId: string,
  newRole: Role,
  requestedByRole: Role,
): StoredUser {
  if (!isManager(requestedByRole)) {
    throw new Error('Only the CRM Manager can change roles');
  }
  const target = getUserById(targetId);
  if (!target) throw new Error('User not found');

  if (newRole === 'Owner') {
    throw new Error('Use transfer ownership to change the Owner');
  }
  if (target.role === 'Owner' && requestedByRole !== 'Owner') {
    throw new Error('Cannot change the Owner role');
  }

  target.role = newRole;
  return target;
}

export function deleteUser(targetId: string, requestedByRole: Role): boolean {
  if (!isManager(requestedByRole)) {
    throw new Error('Only the CRM Manager can delete users');
  }
  const idx = users.findIndex((u) => u.id === targetId);
  if (idx === -1) return false;
  if (users[idx].role === 'Owner') {
    throw new Error('Cannot delete the primary Owner account');
  }
  users.splice(idx, 1);
  return true;
}

export function recordLogin(clerkId: string, device: string, browser: string, ip: string): StoredUser | undefined {
  const user = getUserByClerkId(clerkId);
  if (!user) return undefined;

  user.online = true;
  user.away = false;
  user.lastLogin = new Date().toISOString();

  loginSessions.push({
    userId: user.id,
    loginTime: new Date().toISOString(),
    device,
    browser,
    ip,
    active: true,
  });

  if (loginSessions.length > 500) {
    loginSessions.splice(0, loginSessions.length - 500);
  }

  return user;
}

export function recordLogout(clerkId: string): StoredUser | undefined {
  const user = getUserByClerkId(clerkId);
  if (!user) return undefined;

  user.online = false;
  user.away = false;
  user.lastLogout = new Date().toISOString();

  const activeSession = loginSessions.filter((s) => s.userId === user.id && s.active).pop();
  if (activeSession) {
    activeSession.logoutTime = new Date().toISOString();
    activeSession.active = false;
  }

  return user;
}

export function setAway(clerkId: string): void {
  const user = getUserByClerkId(clerkId);
  if (user) user.away = true;
}

export function setOnline(clerkId: string): void {
  const user = getUserByClerkId(clerkId);
  if (user) {
    user.online = true;
    user.away = false;
  }
}

export function getLoginSessions(userId?: string): LoginSession[] {
  if (userId) return loginSessions.filter((s) => s.userId === userId);
  return [...loginSessions];
}

export function getOnlineUsers(): StoredUser[] {
  return users.filter((u) => u.online);
}

export function seedDefaultManager() {
  if (users.length === 0) {
    users.push({
      id: 'usr-default-manager',
      clerkId: 'dev-mode',
      email: 'manager@digitalwave.com',
      name: 'CRM Manager',
      role: 'Owner',
      createdAt: new Date().toISOString(),
      online: false,
      away: false,
    });
  }
}

if (process.env.NODE_ENV !== 'production') {
  seedDefaultManager();
}
