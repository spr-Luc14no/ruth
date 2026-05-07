import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { fail } from '../utils/apiResponse';

/**
 * Middleware de autenticação.
 * Espera header: Authorization: Bearer <token>
 * Popula req.user com o payload do JWT.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;

  if (!auth?.startsWith('Bearer ')) {
    fail(res, 401, 'NO_TOKEN', 'Token não fornecido');
    return;
  }

  const token = auth.slice('Bearer '.length).trim();

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    fail(res, 401, 'INVALID_TOKEN', 'Token inválido ou expirado');
  }
}
