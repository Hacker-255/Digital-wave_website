import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { api } from '../services/apiClient';
import { getCurrentRole, type Role } from '../services/permissions';
import { configureSupabaseAuth } from '../lib/supabase';
import { listProfiles, upsertProfile } from '../services/supabaseCrmService';

interface CrmUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  online: boolean;
  away: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface InviteUserResult {
  error?: string;
  inviteLink?: string;
  warning?: string;
  emailSent?: boolean;
}

interface AuthContextValue {
  currentUser: CrmUser | null;
  isManager: boolean;
  role: Role;
  users: CrmUser[];
  sessions: any[];
  loading: boolean;
  refreshUsers: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  updateUserRole: (userId: string, newRole: Role) => Promise<string | null>;
  deleteUser: (userId: string) => Promise<string | null>;
  createUser: (data: { clerkId: string; email: string; name: string; role?: Role }) => Promise<string | null>;
  inviteUser: (email: string, inviteRole: Role) => Promise<InviteUserResult>;
  acceptInvitation: (token: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  isManager: false,
  role: 'Employee',
  users: [],
  sessions: [],
  loading: true,
  refreshUsers: async () => {},
  refreshSessions: async () => {},
  updateUserRole: async () => null,
  deleteUser: async () => null,
  createUser: async () => null,
  inviteUser: async () => ({}),
  acceptInvitation: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getToken } = useClerkAuth();
  const { user: clerkUser, isSignedIn } = useUser();
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileRole, setProfileRole] = useState<Role>(() => getCurrentRole());

  const role = profileRole;
  const isManager = role === 'Owner' || role === 'Admin';

  const currentUser: CrmUser | null = clerkUser && isSignedIn
    ? {
        id: `clerk-${clerkUser.id}`,
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.emailAddresses[0]?.emailAddress || 'Unknown',
        role,
        avatar: clerkUser.imageUrl,
        online: true,
        away: false,
        createdAt: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
      }
    : null;

  const refreshUsers = useCallback(async () => {
    const { data } = await api.users.list();
    if (data?.users) {
      setUsers(data.users as CrmUser[]);
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    const { data } = await api.users.sessions();
    if (data?.sessions) {
      setSessions(data.sessions);
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, newRole: Role): Promise<string | null> => {
    const { error } = await api.users.updateRole(userId, newRole);
    if (error) return error;
    await refreshUsers();
    return null;
  }, [refreshUsers]);

  const deleteUser = useCallback(async (userId: string): Promise<string | null> => {
    const { error } = await api.users.delete(userId);
    if (error) return error;
    await refreshUsers();
    return null;
  }, [refreshUsers]);

  const createUser = useCallback(async (data: { clerkId: string; email: string; name: string; role?: Role }): Promise<string | null> => {
    const { error } = await api.users.create(data);
    if (error) return error;
    await refreshUsers();
    return null;
  }, [refreshUsers]);

  const inviteUser = useCallback(async (email: string, inviteRole: Role): Promise<InviteUserResult> => {
    const { data, error } = await api.users.invite(email, inviteRole);
    if (error) return { error };
    await refreshUsers();
    return {
      inviteLink: data?.inviteLink,
      warning: data?.warning,
      emailSent: data?.emailSent,
    };
  }, [refreshUsers]);

  const acceptInvitation = useCallback(async (token: string): Promise<string | null> => {
    const { data, error } = await api.users.acceptInvitation(token);
    if (error) return error;
    if (data?.role) setProfileRole(data.role as Role);
    await refreshUsers();
    return null;
  }, [refreshUsers]);

  useEffect(() => {
    configureSupabaseAuth(() => getToken({ template: 'supabase' }).catch(() => getToken().catch(() => null)));
  }, [getToken]);

  useEffect(() => {
    if (!clerkUser || !isSignedIn) return;

    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const name = clerkUser.fullName || email || 'Unknown';

    listProfiles()
      .then((profiles) => {
        const existing = profiles.find((profile) => profile.id === clerkUser.id);
        const nextRole = existing?.role || role;
        if (existing?.role) setProfileRole(existing.role);
        return upsertProfile({
          id: clerkUser.id,
          email,
          full_name: name,
          avatar_url: clerkUser.imageUrl,
          role: nextRole,
        });
      })
      .catch(() => upsertProfile({
        id: clerkUser.id,
        email,
        full_name: name,
        avatar_url: clerkUser.imageUrl,
        role,
      }).catch(() => undefined));
  }, [clerkUser, isSignedIn, role]);

  useEffect(() => {
    if (!isSignedIn) return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invitation_token');
    if (!token) return;

    acceptInvitation(token)
      .then((error) => {
        if (!error) {
          params.delete('invitation_token');
          const nextQuery = params.toString();
          window.history.replaceState({}, '', `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`);
        }
      })
      .catch(() => undefined);
  }, [acceptInvitation, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      setLoading(false);
      if (isManager) {
        listProfiles()
          .then((profiles) => {
            if (profiles.length === 0) {
              void refreshUsers();
              return;
            }
            setUsers(profiles.map((profile) => ({
              id: profile.id,
              clerkId: profile.id,
              email: profile.email,
              name: profile.full_name || profile.email,
              role: profile.role,
              avatar: profile.avatar_url || undefined,
              online: false,
              away: false,
              createdAt: profile.created_at || new Date().toISOString(),
            })));
          })
          .catch(() => refreshUsers());
      }
    } else {
      setLoading(false);
    }
  }, [isSignedIn, isManager, refreshUsers]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isManager,
      role,
      users,
      sessions,
      loading,
      refreshUsers,
      refreshSessions,
      updateUserRole,
      deleteUser,
      createUser,
      inviteUser,
      acceptInvitation,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
