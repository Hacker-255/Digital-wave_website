import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from '@clerk/backend';
import { recordLogin, recordLogout, setAway, setOnline } from './userService';

let io: Server | null = null;
const userSockets = new Map<string, Set<string>>();
const awayTimers = new Map<string, NodeJS.Timeout>();
const AWAY_TIMEOUT = 5 * 60 * 1000;

export function getIO(): Server | null {
  return io;
}

async function verifySocketToken(token: string): Promise<string | null> {
  if (!process.env.CLERK_SECRET_KEY) return 'dev-mode';
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    return payload.sub || null;
  } catch {
    return null;
  }
}

export function setupPresence(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173',
      credentials: true,
    },
    pingInterval: 30000,
    pingTimeout: 10000,
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token && process.env.CLERK_SECRET_KEY) {
      return next(new Error('Authentication required'));
    }
    if (token) {
      const clerkId = await verifySocketToken(token);
      if (!clerkId) {
        return next(new Error('Invalid authentication token'));
      }
      (socket as any).authenticatedClerkId = clerkId;
    } else if (!process.env.CLERK_SECRET_KEY) {
      (socket as any).authenticatedClerkId = 'dev-mode';
    }
    next();
  });

  io.on('connection', (socket) => {
    const authenticatedId = (socket as any).authenticatedClerkId as string;
    let currentClerkId: string | null = null;

    const resetAwayTimer = (clerkId: string) => {
      if (awayTimers.has(clerkId)) {
        clearTimeout(awayTimers.get(clerkId)!);
      }
      awayTimers.set(clerkId, setTimeout(() => {
        setAway(clerkId);
        io?.emit('presence:update', { clerkId, online: true, away: true });
      }, AWAY_TIMEOUT));
    };

    socket.on('presence:online', (data: { device?: string; browser?: string }) => {
      const clerkId = authenticatedId;
      if (!clerkId) return;
      currentClerkId = clerkId;
      if (!userSockets.has(clerkId)) {
        userSockets.set(clerkId, new Set());
      }
      userSockets.get(clerkId)!.add(socket.id);
      setOnline(clerkId);
      recordLogin(clerkId, data.device || 'Unknown', data.browser || 'Unknown', 'socket');
      io?.emit('presence:update', {
        clerkId, online: true, away: false,
      });
      resetAwayTimer(clerkId);
    });

    socket.on('presence:away', () => {
      if (currentClerkId) {
        setAway(currentClerkId);
        io?.emit('presence:update', {
          clerkId: currentClerkId, online: true, away: true,
        });
      }
    });

    socket.on('presence:active', () => {
      if (currentClerkId) {
        setOnline(currentClerkId);
        io?.emit('presence:update', {
          clerkId: currentClerkId, online: true, away: false,
        });
        resetAwayTimer(currentClerkId);
      }
    });

    socket.on('disconnect', () => {
      if (currentClerkId) {
        if (awayTimers.has(currentClerkId)) {
          clearTimeout(awayTimers.get(currentClerkId)!);
          awayTimers.delete(currentClerkId);
        }
        const sockets = userSockets.get(currentClerkId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(currentClerkId);
            recordLogout(currentClerkId);
            io?.emit('presence:update', {
              clerkId: currentClerkId, online: false, away: false,
            });
          }
        }
      }
    });
  });

  return io;
}

export function getOnlineClerkIds(): string[] {
  return Array.from(userSockets.keys());
}