import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://127.0.0.1:4200';

interface PresenceUpdate {
  clerkId: string;
  online: boolean;
  away: boolean;
}

const listeners = new Set<(update: PresenceUpdate) => void>();
let globalSocket: Socket | null = null;
let globalClerkId: string | null = null;
let globalConnected = false;

async function getClerkToken(): Promise<string | undefined> {
  try {
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      return await clerk.session.getToken();
    }
  } catch { /* Clerk not available */ }
  return undefined;
}

function getOrCreateSocket(): Socket | null {
  if (globalSocket?.connected) return globalSocket;
  try {
    globalSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: async (cb: (data: { token?: string }) => void) => {
        const token = await getClerkToken();
        cb({ token });
      },
    });
    globalSocket.on('connect', () => {
      globalConnected = true;
      if (globalClerkId) {
        globalSocket!.emit('presence:online', {});
      }
    });
    globalSocket.on('disconnect', () => {
      globalConnected = false;
    });
    globalSocket.on('presence:update', (update: PresenceUpdate) => {
      listeners.forEach((fn) => fn(update));
    });
    return globalSocket;
  } catch {
    return null;
  }
}

export function setPresenceClerkId(clerkId: string | null) {
  globalClerkId = clerkId;
  const socket = getOrCreateSocket();
  if (socket?.connected && clerkId) {
    socket.emit('presence:online', {});
  }
}

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [awayUsers, setAwayUsers] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = getOrCreateSocket();
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);

    const handler = (update: PresenceUpdate) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (update.online) next.add(update.clerkId);
        else next.delete(update.clerkId);
        return next;
      });
      setAwayUsers((prev) => {
        const next = new Set(prev);
        if (update.away) next.add(update.clerkId);
        else next.delete(update.clerkId);
        return next;
      });
    };

    listeners.add(handler);

    const handleActivity = () => {
      if (activityTimer.current) clearTimeout(activityTimer.current);
      if (socket.connected && globalClerkId) {
        socket.emit('presence:active', {});
      }
      activityTimer.current = setTimeout(() => {
        if (socket.connected && globalClerkId) {
          socket.emit('presence:away', {});
        }
      }, 5 * 60 * 1000);
    };

    document.addEventListener('mousemove', handleActivity, { passive: true });
    document.addEventListener('keydown', handleActivity, { passive: true });
    document.addEventListener('click', handleActivity, { passive: true });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      listeners.delete(handler);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('click', handleActivity);
      if (activityTimer.current) clearTimeout(activityTimer.current);
    };
  }, []);

  const isOnline = useCallback((clerkId: string) => onlineUsers.has(clerkId), [onlineUsers]);
  const isAway = useCallback((clerkId: string) => awayUsers.has(clerkId), [awayUsers]);

  return { isOnline, isAway, connected, onlineCount: onlineUsers.size };
}