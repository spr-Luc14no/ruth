import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import './types'; // ativa augmentation do Express.Request

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // trust proxy pra capturar IP real atrás de Render
  app.set('trust proxy', 1);

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
}
