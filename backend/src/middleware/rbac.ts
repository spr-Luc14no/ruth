import { NextFunction, Request, Response } from 'express';
import { fail } from '../utils/apiResponse';
import { Perfil } from '../types';

/**
 * Middleware de autorização por perfil (RN05).
 * Use depois de `authenticate`. Recebe lista de perfis permitidos.
 *
 * @example
 *   router.post('/sessoes', authenticate, rbac('P'), ...)
 *   router.get('/usuarios', authenticate, rbac('A'), ...)
 */
export function rbac(...perfis: Perfil[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      fail(res, 401, 'NOT_AUTHENTICATED', 'Usuário não autenticado');
      return;
    }

    if (!perfis.includes(req.user.tipo)) {
      fail(res, 403, 'RN05_FORBIDDEN', 'Perfil sem permissão para esta operação');
      return;
    }

    next();
  };
}
