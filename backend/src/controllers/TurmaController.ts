import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { TurmaService } from '../services/TurmaService';
import { ok } from '../utils/apiResponse';

// =============== Schemas ===============

export const criarTurmaSchema = z.object({
  nome: z.string().trim().min(2, 'Nome muito curto').max(100),
  periodo: z.string().trim().min(1).max(50),
  disciplina: z.string().trim().min(2).max(100),
  professorId: z.coerce.number().int().positive(),
});

export const atualizarTurmaSchema = z.object({
  nome: z.string().trim().min(2).max(100).optional(),
  periodo: z.string().trim().min(1).max(50).optional(),
  disciplina: z.string().trim().min(2).max(100).optional(),
  professorId: z.coerce.number().int().positive().optional(),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const matriculaParam = z.object({
  id: z.coerce.number().int().positive(),
  alunoId: z.coerce.number().int().positive(),
});

export const matricularSchema = z.object({
  alunoId: z.coerce.number().int().positive(),
});

// =============== Controller ===============

export class TurmaController {
  static async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Se o requisitante é professor, filtra automaticamente pelas turmas dele
      const filtros: { professorId?: number } = {};
      if (req.user?.tipo === 'P') {
        filtros.professorId = req.user.userId;
      }
      const data = await TurmaService.listar(filtros);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async buscar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const data = await TurmaService.buscarPorId(id);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as z.infer<typeof criarTurmaSchema>;
      const data = await TurmaService.criar(input, req.user?.userId);
      ok(res, data, 201);
    } catch (err) {
      next(err);
    }
  }

  static async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const input = req.body as z.infer<typeof atualizarTurmaSchema>;
      const data = await TurmaService.atualizar(id, input, req.user?.userId);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const data = await TurmaService.excluir(id, req.user?.userId);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async matricular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const { alunoId } = req.body as z.infer<typeof matricularSchema>;
      const data = await TurmaService.matricular(id, alunoId, req.user?.userId);
      ok(res, data, 201);
    } catch (err) {
      next(err);
    }
  }

  static async desmatricular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, alunoId } = req.params as unknown as z.infer<typeof matriculaParam>;
      const data = await TurmaService.desmatricular(id, alunoId, req.user?.userId);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }
}
