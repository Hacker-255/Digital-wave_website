const API_BASE = '/api';

type TokenProvider = (options?: { fresh?: boolean }) => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

export function configureApiAuth(getToken: TokenProvider) {
  tokenProvider = getToken;
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: string }> {
  try {
    let res = await fetchWithAuth(path, options);
    if (res.status === 401) {
      res = await fetchWithAuth(path, options, true);
    }

    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      let body: { error?: string; message?: string; details?: string } = {};
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = { error: raw };
      }
      return { error: cleanApiError(body.error || body.message || body.details || res.statusText || `Request failed (${res.status})`, res.status) };
    }
    const data = await res.json();
    return { data: data as T };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { error: cleanApiError(message) };
  }
}

async function fetchWithAuth(path: string, options: RequestInit, fresh = false) {
  const token = await getSessionToken(fresh);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

async function getSessionToken(fresh = false): Promise<string | null> {
  try {
    if (tokenProvider) {
      return tokenProvider({ fresh });
    }

    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      return clerk.session.getToken(fresh ? { skipCache: true } : undefined);
    }
  } catch { /* Clerk not available */ }
  return null;
}

function cleanApiError(message: string, status?: number) {
  if (status === 401 || /jwt.*expired|session.*expired|token.*expired|authorization/i.test(message)) {
    return 'Your session expired. Please sign in again and retry.';
  }
  if (status === 410 || /invite expired|invitation has expired/i.test(message)) {
    return 'Invite expired. Request a new invite.';
  }
  return message;
}

export const api = {
  users: {
    list: () => request<{ users: any[] }>('/users'),
    get: (id: string) => request<{ user: any }>(`/users/${id}`),
    create: (data: { clerkId: string; email: string; name: string; role?: string }) =>
      request<{ user: any }>('/users', { method: 'POST', body: JSON.stringify(data) }),
    updateRole: (id: string, role: string) =>
      request<{ user: any }>(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/users/${id}`, { method: 'DELETE' }),
    invite: (email: string, role: string) =>
      request<{ invitation: any; inviteLink: string; emailSent?: boolean; warning?: string }>('/users/invite', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      }),
    acceptInvitation: (token: string) =>
      request<{ ok: boolean; role: string }>('/users/accept-invitation', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    online: () => request<{ online: any[] }>('/users/online'),
    sessions: (userId?: string) =>
      request<{ sessions: any[] }>(`/users${userId ? `/sessions/${userId}` : '/sessions'}`),
    trackLogin: (clerkId: string, device?: string, browser?: string) =>
      request<{ user: any }>('/users/track/login', {
        method: 'POST',
        body: JSON.stringify({ clerkId, device, browser }),
      }),
    trackLogout: (clerkId: string) =>
      request<{ user: any }>('/users/track/logout', {
        method: 'POST',
        body: JSON.stringify({ clerkId }),
      }),
  },
  settings: {
    get: () => request<{ settings: any }>('/settings'),
    save: (settings: any) =>
      request<{ ok: boolean; settings: any }>('/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      }),
  },
  email: {
    sendTest: (to: string) =>
      request<{ ok: boolean; id?: string; to: string }>('/email/test', {
        method: 'POST',
        body: JSON.stringify({ to }),
      }),
    sendWelcome: () =>
      request<{ ok: boolean; id?: string; to: string }>('/email/welcome', {
        method: 'POST',
      }),
  },
  meetings: {
    schedule: (data: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      meetingTime: string;
      title?: string;
      notes?: string;
    }) =>
      request<{ ok: boolean; meeting: any }>('/meetings/schedule', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  crm: {
    listCompanies: () => request<{ companies: any[] }>('/users/invite?crmResource=companies'),
    saveCompanies: (companies: any[]) =>
      request<{ ok: boolean }>('/users/invite?crmResource=companies', {
        method: 'PUT',
        body: JSON.stringify({ companies }),
      }),
    deleteCompanies: (ids: string[]) =>
      request<{ ok: boolean }>('/users/invite?crmResource=companies', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      }),
    listRecords: (module: string) =>
      request<{ records: Array<{ record_id: string; data: Record<string, unknown> }> }>(`/users/invite?crmResource=records&module=${encodeURIComponent(module)}`),
    saveRecords: (module: string, records: Array<{ id: string }>) =>
      request<{ ok: boolean }>('/users/invite?crmResource=records', {
        method: 'PUT',
        body: JSON.stringify({ module, records }),
      }),
    health: () => request<{ ok: boolean; missing: string[] }>('/users/invite?crmResource=health'),
  },
  workflows: {
    list: () => request<{ workflows: any[] }>('/workflows'),
    run: (id: string) =>
      request<{ execution: any }>(`/workflows/${id}/run`, { method: 'POST' }),
  },
};
