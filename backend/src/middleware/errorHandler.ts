import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { fail } from '../utils/apiResponse';
import { env } from '../config/env';

/**
 * Middleware final da pipeline. Converte erros em respostas padronizadas.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    fail(res, err.status, err.code, err.message, err.details);
    return;
  }

  // Erro inesperado
  if (env.NODE_ENV !== 'test') {
    console.error('[errorHandler] erro não tratado:', err);
  }

  fail(
    res,
    500,
    'INTERNAL_ERROR',
    env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
  );
}
