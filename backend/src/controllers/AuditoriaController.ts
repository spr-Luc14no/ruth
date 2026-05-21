import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AuditoriaService } from '../services/AuditoriaService';
import { ok } from '../utils/apiResponse';

export const filtroAuditoriaQuery = z.object({
  acao: z.string().trim().max(100).optional(),
  entidade: z.string().trim().max(50).optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  pagina: z.coerce.number().int().positive().optional(),
  porPagina: z.coerce.number().int().positive().max(100).optional(),
});

export class AuditoriaController {
  static async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filtro = req.query as unknown as z.infer<typeof filtroAuditoriaQuery>;
      const resultado = await AuditoriaService.listar(filtro);
      ok(res, resultado);
    } catch (err) {
      next(err);
    }
  }
}
