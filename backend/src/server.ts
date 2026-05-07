import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
const httpServer = createServer(app);

// Socket.IO — placeholder. Handlers serão adicionados em PRs futuros.
const io = new SocketServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  },
});

io.on('connection', (socket) => {
  if (env.NODE_ENV !== 'test') {
    console.info(`[socket] cliente conectado: ${socket.id}`);
  }
  socket.on('disconnect', () => {
    if (env.NODE_ENV !== 'test') {
      console.info(`[socket] cliente desconectado: ${socket.id}`);
    }
  });
});

httpServer.listen(env.PORT, () => {
  console.info(`🚀 RUTh API rodando em http://localhost:${env.PORT}`);
  console.info(`   Ambiente: ${env.NODE_ENV}`);
  console.info(`   CORS:     ${env.CORS_ORIGIN}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.info(`\n[server] recebido ${signal}, encerrando...`);
  httpServer.close(() => {
    console.info('[server] HTTP encerrado.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export { io };
