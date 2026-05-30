import type { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { ensureUserForLogin } from '../services/userService';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || '',
});

export interface AuthUser {
  clerkId: string;
  email: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Employee' | 'Viewer';
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

async function verifyClerkToken(token: string): Promise<AuthUser> {
  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  const userId = payload.sub;
  if (!userId) throw new Error('Invalid session token');
  const user = await clerkClient.users.getUser(userId);
  const storedUser = ensureUserForLogin({
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    name: user.fullName || user.emailAddresses[0]?.emailAddress || 'Unknown',
    avatar: user.imageUrl,
  });
  return {
    clerkId: storedUser.clerkId,
    email: storedUser.email,
    name: storedUser.name,
    role: storedUser.role,
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!process.env.CLERK_SECRET_KEY) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ error: 'Authentication is not configured' });
    }
    req.authUser = {
      clerkId: 'dev-mode',
      email: 'dev@digitalwave.com',
      name: 'Development User',
      role: 'Owner',
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    req.authUser = await verifyClerkToken(authHeader.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function requireRole(...roles: AuthUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.authUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireManager(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.authUser.role !== 'Owner' && req.authUser.role !== 'Admin') {
    return res.status(403).json({ error: 'Only the CRM Manager can perform this action' });
  }
  next();
}
