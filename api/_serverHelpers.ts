import { createHash, randomBytes } from 'crypto';
import { createClerkClient, verifyToken } from '@clerk/backend';

export type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export type VercelRequest<TBody = unknown> = {
  method?: string;
  body?: TBody;
  headers: Record<string, string | string[] | undefined>;
};

export class ApiError extends Error {
  status: number;
  publicMessage: string;

  constructor(status: number, publicMessage: string, internalMessage = publicMessage) {
    super(internalMessage);
    this.name = 'ApiError';
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

function getClerkClient() {
  if (!process.env.CLERK_SECRET_KEY) throw new ApiError(500, 'CLERK_SECRET_KEY is not configured');
  return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
}

export function setJsonHeaders(response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Content-Type', 'application/json');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createInvitationToken() {
  return randomBytes(32).toString('base64url');
}

export function getOrigin(request: VercelRequest) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const proto = headerValue(request, 'x-forwarded-proto') || 'https';
  const host = headerValue(request, 'x-forwarded-host') || headerValue(request, 'host') || 'digital-wave.solutions';
  return `${proto}://${host}`;
}

export function headerValue(request: VercelRequest, name: string) {
  const value = request.headers[name] || request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export async function requireClerkUser(request: VercelRequest) {
  const authHeader = headerValue(request, 'authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new ApiError(401, 'Please sign in again.');
  if (!process.env.CLERK_SECRET_KEY) throw new ApiError(500, 'CLERK_SECRET_KEY is not configured');

  const token = authHeader.slice(7);
  let payload: Awaited<ReturnType<typeof verifyToken>>;
  try {
    payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/jwt.*expired|token.*expired|expired/i.test(message)) {
      throw new ApiError(401, 'Your session expired. Please sign in again.', message);
    }
    throw new ApiError(401, 'Invalid session. Please sign in again.', message);
  }
  const clerkId = payload.sub;
  if (!clerkId) throw new ApiError(401, 'Invalid session. Please sign in again.');
  const clerkClient = getClerkClient();
  const user = await clerkClient.users.getUser(clerkId);
  return {
    token,
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    name: user.fullName || user.emailAddresses[0]?.emailAddress || 'Unknown',
    avatarUrl: user.imageUrl,
  };
}

export async function supabaseRequest<T = unknown>(
  path: string,
  token: string,
  options: RequestInit = {},
) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase environment variables are not configured');

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null) as T;
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data ? String((data as { message: unknown }).message) : 'Supabase request failed';
    throw new Error(message);
  }
  return data;
}

export async function supabaseServiceRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Supabase service environment variables are not configured');

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null) as T;
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data ? String((data as { message: unknown }).message) : 'Supabase service request failed';
    throw new Error(message);
  }
  return data;
}
