import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ImportacaoService } from '../services/ImportacaoService';
import { ok } from '../utils/apiResponse';

export const importarSchema = z.object({
  csv: z.string().min(1, 'CSV vazio'),
  turmaId: z.coerce.number().int().positive().optional(),
});

export class ImportacaoController {
  static async importarAlunos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { csv, turmaId } = req.body as z.infer<typeof importarSchema>; ok(res, await ImportacaoService.importarAlunos(csv, turmaId, req.user?.userId), 201); } catch (err) { next(err); }
  }
}
