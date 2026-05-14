import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { verifyToken, type JwtPayload } from '../utils/jwt';
import { env } from '../config/env';

let io: SocketServer | null = null;

interface AuthedSocketData extends JwtPayload {
  socketId: string;
}

// Augmenta o SocketData global do Socket.IO
declare module 'socket.io' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SocketData extends AuthedSocketData {}
}

/**
 * Inicializa o servidor Socket.IO atrelado ao httpServer já existente.
 * Aplica autenticação JWT no handshake.
 *
 * Convenções:
 *  - Cada sessão tem uma "room" chamada `sessao:${id}`
 *  - Cliente envia `sessao:join` com { sessaoId } depois de conectar
 *  - Servidor faz broadcast pra room via `emitToSessao()`
 */
export function setupSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    },
  });

  // Middleware de autenticação — token no handshake
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers.authorization?.replace(/^Bearer /, '');
    if (!token || typeof token !== 'string') {
      return next(new Error('Token de autenticação ausente.'));
    }
    try {
      const payload = verifyToken(token);
      socket.data = { ...payload, socketId: socket.id };
      next();
    } catch {
      next(new Error('Token inválido.'));
    }
  });

  io.on('connection', (socket) => {
    if (env.NODE_ENV !== 'test') {
      console.info(`[socket] conectado userId=${socket.data.userId} tipo=${socket.data.tipo}`);
    }

    // Entrar na room de uma sessão
    socket.on('sessao:join', (data: { sessaoId: number }) => {
      if (!data?.sessaoId) return;
      const room = `sessao:${data.sessaoId}`;
      socket.join(room);
      if (env.NODE_ENV !== 'test') {
        console.info(`[socket] userId=${socket.data.userId} entrou em ${room}`);
      }
    });

    socket.on('sessao:leave', (data: { sessaoId: number }) => {
      if (!data?.sessaoId) return;
      socket.leave(`sessao:${data.sessaoId}`);
    });

    socket.on('disconnect', () => {
      if (env.NODE_ENV !== 'test') {
        console.info(`[socket] desconectado userId=${socket.data?.userId}`);
      }
    });
  });

  return io;
}

/**
 * Emite um evento pra todos os clientes na room da sessão.
 * Usado pelos controllers HTTP pra notificar os participantes.
 */
export function emitToSessao(sessaoId: number, evento: string, payload: unknown): void {
  if (!io) return;
  io.to(`sessao:${sessaoId}`).emit(evento, payload);
}

export function getIo(): SocketServer | null {
  return io;
}
