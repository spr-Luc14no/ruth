import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { setupSocket } from './sockets';

const app = createApp();
const httpServer = createServer(app);

// Socket.IO com auth JWT no handshake
const io = setupSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.info(`🚀 RUTh API rodando em http://localhost:${env.PORT}`);
  console.info(`   Ambiente: ${env.NODE_ENV}`);
  console.info(`   CORS:     ${env.CORS_ORIGIN}`);
  console.info(`   Socket.IO: ativo`);
});

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
