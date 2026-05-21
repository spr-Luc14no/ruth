import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ParametroService } from '../services/ParametroService';
import { ok } from '../utils/apiResponse';

export const atualizarParametroSchema = z.object({
  valor: z.string().trim().min(1).max(50),
  ativo: z.boolean().optional(),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export class ParametroController {
  static async listar(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lista = await ParametroService.listar();
      ok(res, lista);
    } catch (err) {
      next(err);
    }
  }

  static async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const input = req.body as z.infer<typeof atualizarParametroSchema>;
      const atualizado = await ParametroService.atualizar(id, input, req.user!.userId);
      ok(res, atualizado);
    } catch (err) {
      next(err);
    }
  }
}
