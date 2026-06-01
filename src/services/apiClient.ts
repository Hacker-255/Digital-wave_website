const API_BASE = '/api';

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: string }> {
  try {
    const token = await getSessionToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      let body: { error?: string; message?: string; details?: string } = {};
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = { error: raw };
      }
      return { error: body.error || body.message || body.details || res.statusText || `Request failed (${res.status})` };
    }
    const data = await res.json();
    return { data: data as T };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { error: message };
  }
}

let cachedToken: string | null = null;

async function getSessionToken(): Promise<string | null> {
  try {
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      if (!cachedToken) {
        cachedToken = await clerk.session.getToken();
        setTimeout(() => { cachedToken = null; }, 1000 * 60 * 5);
      }
      return cachedToken;
    }
  } catch { /* Clerk not available */ }
  return null;
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
  workflows: {
    list: () => request<{ workflows: any[] }>('/workflows'),
    run: (id: string) =>
      request<{ execution: any }>(`/workflows/${id}/run`, { method: 'POST' }),
  },
};
