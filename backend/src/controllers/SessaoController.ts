import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { SessaoService } from '../services/SessaoService';
import { PresencaService } from '../services/PresencaService';
import { ok } from '../utils/apiResponse';
import { emitToSessao } from '../sockets';

// ============ Schemas ============

export const criarSessaoSchema = z.object({
  disciplinaId: z.coerce.number().int().positive(),
  janelaMin: z.coerce.number().int().positive().max(180).optional(),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const codigoParam = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .length(4, 'Código deve ter 4 caracteres'),
});

// ============ Controller ============

export class SessaoController {
  static async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { disciplinaId, janelaMin } = req.body as z.infer<typeof criarSessaoSchema>;
      const sessao = await SessaoService.criar({
        disciplinaId,
        janelaMin,
        professorId: req.user!.userId,
      });
      ok(res, sessao, 201);
    } catch (err) {
      next(err);
    }
  }

  static async detalhar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const sessao = await SessaoService.detalhar(id);
      ok(res, sessao);
    } catch (err) {
      next(err);
    }
  }

  static async buscarPorCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { codigo } = req.params as unknown as z.infer<typeof codigoParam>;
      const sessao = await SessaoService.buscarPorCodigo(codigo);
      ok(res, sessao);
    } catch (err) {
      next(err);
    }
  }

  static async listarDoProfessor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessoes = await SessaoService.listarDoProfessor(req.user!.userId);
      ok(res, sessoes);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retorna a sessão ABERTA em que o aluno já fez check-in (ou null).
   * Permite ao dashboard do aluno mostrar um atalho "Voltar à sessão"
   * sem precisar digitar o código novamente.
   */
  static async ativaDoAluno(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessao = await SessaoService.buscarAtivaDoAluno(req.user!.userId);
      ok(res, sessao);
    } catch (err) {
      next(err);
    }
  }

  static async encerrar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const sessao = await SessaoService.encerrar(id, req.user!.userId);

      emitToSessao(id, 'sessao:encerrada', {
        sessaoId: id,
        encerradaEm: sessao.dataEncerramento,
      });

      ok(res, sessao);
    } catch (err) {
      next(err);
    }
  }

  static async checkin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const presenca = await PresencaService.registrar({
        sessaoId: id,
        alunoId: req.user!.userId,
        ip: req.ip,
        dispositivo: req.headers['user-agent']?.slice(0, 100),
      });

      emitToSessao(id, 'sessao:presenca-nova', {
        sessaoId: id,
        presenca: {
          id: presenca.id,
          aluno: presenca.aluno,
          marcadoEm: presenca.marcadoEm,
          atrasoMin: presenca.atrasoMin,
          status: presenca.status,
        },
      });

      ok(res, presenca, 201);
    } catch (err) {
      next(err);
    }
  }
}
