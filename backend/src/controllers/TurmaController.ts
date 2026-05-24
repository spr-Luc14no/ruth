import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { TurmaService } from '../services/TurmaService';
import { ok } from '../utils/apiResponse';

export const criarTurmaSchema = z.object({
  nome: z.string().trim().min(2, 'Nome muito curto').max(100),
  periodo: z.string().trim().min(1).max(50),
});
export const atualizarTurmaSchema = z.object({
  nome: z.string().trim().min(2).max(100).optional(),
  periodo: z.string().trim().min(1).max(50).optional(),
});
export const idParam = z.object({ id: z.coerce.number().int().positive() });
export const matriculaParam = z.object({ id: z.coerce.number().int().positive(), alunoId: z.coerce.number().int().positive() });
export const matricularSchema = z.object({ alunoId: z.coerce.number().int().positive() });

export class TurmaController {
  static async listar(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { ok(res, await TurmaService.listar()); } catch (err) { next(err); }
  }
  static async buscar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { id } = req.params as unknown as z.infer<typeof idParam>; ok(res, await TurmaService.buscarPorId(id)); } catch (err) { next(err); }
  }
  static async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const input = req.body as z.infer<typeof criarTurmaSchema>; ok(res, await TurmaService.criar(input, req.user?.userId), 201); } catch (err) { next(err); }
  }
  static async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { id } = req.params as unknown as z.infer<typeof idParam>; const input = req.body as z.infer<typeof atualizarTurmaSchema>; ok(res, await TurmaService.atualizar(id, input, req.user?.userId)); } catch (err) { next(err); }
  }
  static async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { id } = req.params as unknown as z.infer<typeof idParam>; ok(res, await TurmaService.excluir(id, req.user?.userId)); } catch (err) { next(err); }
  }
  static async matricular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { id } = req.params as unknown as z.infer<typeof idParam>; const { alunoId } = req.body as z.infer<typeof matricularSchema>; ok(res, await TurmaService.matricular(id, alunoId, req.user?.userId), 201); } catch (err) { next(err); }
  }
  static async desmatricular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { id, alunoId } = req.params as unknown as z.infer<typeof matriculaParam>; ok(res, await TurmaService.desmatricular(id, alunoId, req.user?.userId)); } catch (err) { next(err); }
  }
}
