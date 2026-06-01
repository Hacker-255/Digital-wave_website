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
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getToken } = useClerkAuth();
  const { user: clerkUser, isSignedIn } = useUser();
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const role = getCurrentRole();
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

  useEffect(() => {
    configureSupabaseAuth(() => getToken({ template: 'supabase' }).catch(() => getToken().catch(() => null)));
  }, [getToken]);

  useEffect(() => {
    if (!clerkUser || !isSignedIn) return;

    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const name = clerkUser.fullName || email || 'Unknown';

    upsertProfile({
      id: clerkUser.id,
      email,
      full_name: name,
      avatar_url: clerkUser.imageUrl,
      role,
    }).catch(() => undefined);
  }, [clerkUser, isSignedIn, role]);

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
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
