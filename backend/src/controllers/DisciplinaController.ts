import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { DisciplinaService } from '../services/DisciplinaService';
import { ok } from '../utils/apiResponse';

export const criarDisciplinaSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  turmaId: z.coerce.number().int().positive(),
  professorId: z.coerce.number().int().positive(),
  toleranciaAtrasoMin: z.coerce.number().int().min(0).max(360).nullable().optional(),
  janelaPadraoMin: z.coerce.number().int().min(1).max(360).nullable().optional(),
});
export const atualizarDisciplinaSchema = z.object({
  nome: z.string().trim().min(2).max(100).optional(),
  professorId: z.coerce.number().int().positive().optional(),
  toleranciaAtrasoMin: z.coerce.number().int().min(0).max(360).nullable().optional(),
  janelaPadraoMin: z.coerce.number().int().min(1).max(360).nullable().optional(),
});
export const idParam = z.object({ id: z.coerce.number().int().positive() });
export const turmaIdParam = z.object({ turmaId: z.coerce.number().int().positive() });

export class DisciplinaController {
  static async listarPorTurma(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { turmaId } = req.params as unknown as z.infer<typeof turmaIdParam>; ok(res, await DisciplinaService.listarPorTurma(turmaId)); } catch (err) { next(err); }
  }
  static async minhas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { ok(res, await DisciplinaService.listarDoProfessor(req.user!.userId)); } catch (err) { next(err); }
  }
  static async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const input = req.body as z.infer<typeof criarDisciplinaSchema>; ok(res, await DisciplinaService.criar(input, req.user?.userId), 201); } catch (err) { next(err); }
  }
  static async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { id } = req.params as unknown as z.infer<typeof idParam>; const input = req.body as z.infer<typeof atualizarDisciplinaSchema>; ok(res, await DisciplinaService.atualizar(id, input, req.user?.userId)); } catch (err) { next(err); }
  }
  static async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { id } = req.params as unknown as z.infer<typeof idParam>; ok(res, await DisciplinaService.excluir(id, req.user?.userId)); } catch (err) { next(err); }
  }
}
