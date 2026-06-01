import { useState } from 'react';
import { ShieldCheck, UserCog, Trash2, AlertTriangle, Check, Search, UserPlus } from 'lucide-react';
import { SelectDropdown } from './SelectDropdown';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_OPTIONS = ['Manager', 'Employee', 'Viewer'] as const;

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Owner: 'Full system access. Can manage all settings, users, permissions, and data.',
  Admin: 'Complete administrative access. Can manage users, roles, and all CRM modules.',
  Manager: 'Can manage team members, create/edit records, and access workflows and exports.',
  Employee: 'Can create and edit records. No access to team management or system settings.',
  Viewer: 'Read-only access. Can view records but cannot create, edit, or delete anything.',
};

const ROLE_COLORS: Record<string, string> = {
  Owner: '#f59e0b',
  Admin: '#22c55e',
  Manager: '#3b82f6',
  Employee: '#8b5cf6',
  Viewer: '#6b7280',
};

export function UserPermissionPanel() {
  const { users, isManager, updateUserRole, deleteUser, inviteUser, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [inviting, setInviting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isManager) return null;

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    const error = await updateUserRole(userId, newRole as any);
    if (error) {
      setFeedback(error);
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback('Role updated successfully');
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const error = await deleteUser(userId);
    setConfirmDelete(null);
    if (error) {
      setFeedback(error);
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback('User removed');
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleInviteUser = async () => {
    setInviting(true);
    const error = await inviteUser(inviteEmail, inviteRole as any);
    setInviting(false);
    if (error) {
      setFeedback(error);
      setTimeout(() => setFeedback(null), 5000);
      return;
    }
    setInviteEmail('');
    setInviteRole('Employee');
    setFeedback('Invitation sent successfully');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} style={{ color: '#22c55e' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>User & Permission Management</span>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
          style={{
            background: feedback.includes('success') || feedback.includes('updated') || feedback.includes('removed')
              ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            borderColor: feedback.includes('success') || feedback.includes('updated') || feedback.includes('removed')
              ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
            color: feedback.includes('success') || feedback.includes('updated') || feedback.includes('removed')
              ? '#22c55e' : '#ef4444',
          }}>
          {feedback.includes('success') || feedback.includes('updated') || feedback.includes('removed')
            ? <Check size={14} /> : <AlertTriangle size={14} />}
          {feedback}
        </div>
      )}

      <div className="rounded-lg border p-3"
        style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
        <div className="mb-3 flex items-center gap-2">
          <UserPlus size={14} style={{ color: '#3b82f6' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--crm-text)' }}>Invite User</span>
        </div>
        <div className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="employee@company.com"
            className="rounded-lg border bg-transparent px-3 py-2 text-xs outline-none"
            style={{ borderColor: 'var(--crm-border-accent)', color: 'var(--crm-text)' }}
            type="email"
          />
          <SelectDropdown
            value={inviteRole}
            onChange={setInviteRole}
            options={['Manager', 'Employee', 'Viewer']}
          />
          <button
            onClick={handleInviteUser}
            disabled={inviting || !inviteEmail.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: '#2563eb', color: '#fff' }}
            type="button"
          >
            <UserPlus size={13} />
            {inviting ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{ borderColor: 'var(--crm-border-accent)', background: 'var(--crm-surface)' }}>
        <Search size={14} style={{ color: 'var(--crm-text-muted)' }} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name or email..."
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: 'var(--crm-text)' }}
        />
      </label>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-xs" style={{ color: 'var(--crm-text-muted)' }}>
          Loading users...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-xs" style={{ color: 'var(--crm-text-muted)' }}>
          <UserCog size={24} className="mb-2 opacity-40" />
          {searchQuery ? 'No users match your search' : 'No users found. Users appear here when they log in.'}
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-lg border p-3 transition"
              style={{
                borderColor: 'var(--crm-border)',
                background: 'var(--crm-surface)',
              }}
            >
              <div className="relative flex-shrink-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: user.online
                      ? `linear-gradient(135deg, ${ROLE_COLORS[user.role] || '#6b7280'}, ${ROLE_COLORS[user.role] || '#6b7280'}88)`
                      : 'var(--crm-surface)',
                    color: user.online ? '#fff' : 'var(--crm-text-muted)',
                    border: user.online ? 'none' : '2px solid var(--crm-border-accent)',
                  }}>
                  {user.name[0]?.toUpperCase() || '?'}
                </span>
                {user.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
                    style={{
                      backgroundColor: user.away ? '#f59e0b' : '#22c55e',
                      borderColor: 'var(--crm-surface)',
                    }}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium" style={{ color: 'var(--crm-text)' }}>
                    {user.name}
                  </span>
                  <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: `${ROLE_COLORS[user.role] || '#6b7280'}20`,
                      color: ROLE_COLORS[user.role] || '#6b7280',
                    }}>
                    {user.role}
                  </span>
                </div>
                <div className="truncate text-xs mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>
                  {user.email}
                  {user.lastLogin && ` - Last login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {user.role !== 'Owner' && (
                  <>
                    <div style={{ minWidth: '110px' }}>
                      <SelectDropdown
                        value={user.role}
                        onChange={(v) => handleRoleChange(user.id, v)}
                        options={[...ROLE_OPTIONS]}
                      />
                    </div>
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      className="rounded-md p-1.5 transition hover:bg-red-500/10"
                      title="Remove user"
                      type="button"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold" style={{ color: 'var(--crm-text-muted)' }}>Role Descriptions</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => (
            <div key={role} className="rounded-lg border p-2 text-xs"
              style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
              <span className="font-semibold" style={{ color: ROLE_COLORS[role] || 'var(--crm-text)' }}>
                {role}
              </span>
              <p className="mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-xl border p-5 shadow-2xl"
            style={{ background: 'var(--crm-dropdown-bg)', borderColor: 'var(--crm-border-accent)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Remove user?</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>
                  This will permanently remove this user from the CRM.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg px-3 py-1.5 text-xs transition"
                style={{ color: 'var(--crm-text-secondary)' }}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDelete)}
                className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-red-400"
                type="button"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
