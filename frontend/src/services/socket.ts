import { io as ioClient, Socket } from 'socket.io-client';
import { authStorage } from '@/lib/auth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';

let socket: Socket | null = null;
let refCount = 0;

/**
 * Retorna uma instância singleton do Socket conectada.
 * Cada chamador deve invocar releaseSocket() quando não precisar mais.
 */
export function acquireSocket(): Socket {
  refCount++;
  if (!socket) {
    socket = ioClient(SOCKET_URL, {
      auth: { token: authStorage.getToken() },
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.warn('[socket] connect_error:', err.message);
    });
  } else if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function releaseSocket(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && socket) {
    socket.disconnect();
    socket = null;
  }
}

export type { Socket };
