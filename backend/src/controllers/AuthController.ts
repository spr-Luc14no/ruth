import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/AuthService';
import { ok } from '../utils/apiResponse';

export const loginSchema = z.object({
  login: z.string().min(1, 'login obrigatório').max(100),
  senha: z.string().min(1, 'senha obrigatória').max(255),
});

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { login, senha } = req.body as z.infer<typeof loginSchema>;
      const ip = req.ip;

      const result = await AuthService.login({ login, senha, ip });

      ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // O middleware authenticate já popula req.user
      ok(res, { user: req.user });
    } catch (err) {
      next(err);
    }
  }
}
