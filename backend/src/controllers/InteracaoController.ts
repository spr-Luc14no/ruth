import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { InteracaoService } from '../services/InteracaoService';
import { ok } from '../utils/apiResponse';
import { emitToSessao } from '../sockets';

// ============ Schemas ============

export const dispararPerguntaSchema = z.object({
  enunciado: z.string().trim().min(2).max(255),
  tipo: z.enum(['MULTIPLA', 'VF', 'ENQUETE', 'TEXTO']),
  opcoes: z
    .array(
      z.object({
        descricao: z.string().trim().min(1).max(255),
        correta: z.boolean().optional(),
      }),
    )
    .optional(),
});

export const responderSchema = z.object({
  opcaoId: z.coerce.number().int().positive().optional(),
  textoLivre: z.string().trim().max(500).optional(),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

// ============ Controller ============

export class InteracaoController {
  static async dispararEm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: sessaoId } = req.params as unknown as z.infer<typeof idParam>;
      const input = req.body as z.infer<typeof dispararPerguntaSchema>;

      const pergunta = await InteracaoService.dispararPergunta({
        sessaoId,
        professorId: req.user!.userId,
        enunciado: input.enunciado,
        tipo: input.tipo,
        opcoes: input.opcoes,
      });

      // Broadcast pra todos os alunos da sessão verem a pergunta
      emitToSessao(sessaoId, 'sessao:pergunta-disparada', {
        sessaoId,
        pergunta: {
          id: pergunta.id,
          enunciado: pergunta.enunciado,
          tipo: pergunta.tipo,
          ativa: pergunta.ativa,
          opcoes: pergunta.opcoes.map((o: { id: number; descricao: string }) => ({
            id: o.id,
            descricao: o.descricao,
          })),
        },
      });

      ok(res, pergunta, 201);
    } catch (err) {
      next(err);
    }
  }

  static async encerrar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const pergunta = await InteracaoService.encerrarPergunta(id, req.user!.userId);

      // Notifica a sessão
      emitToSessao(pergunta.sessaoId, 'sessao:pergunta-encerrada', {
        perguntaId: pergunta.id,
      });

      ok(res, pergunta);
    } catch (err) {
      next(err);
    }
  }

  static async responder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: perguntaId } = req.params as unknown as z.infer<typeof idParam>;
      const input = req.body as z.infer<typeof responderSchema>;

      const resposta = await InteracaoService.responder({
        perguntaId,
        alunoId: req.user!.userId,
        opcaoId: input.opcaoId,
        textoLivre: input.textoLivre,
      });

      // Resultados atualizados pro professor ver em tempo real
      const resultados = await InteracaoService.resultados(perguntaId);
      // Acha sessaoId pela pergunta
      const sessaoId = await getSessaoIdDaPergunta(perguntaId);
      if (sessaoId) {
        emitToSessao(sessaoId, 'sessao:resposta-recebida', {
          perguntaId,
          alunoId: req.user!.userId,
          resultados,
        });
      }

      ok(res, { resposta, resultados }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async resultados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const data = await InteracaoService.resultados(id);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }
}

// Helper interno
async function getSessaoIdDaPergunta(perguntaId: number): Promise<number | null> {
  const { prisma } = await import('../config/prisma.js');
  const p = await prisma.pergunta.findUnique({
    where: { id: perguntaId },
    select: { sessaoId: true },
  });
  return p?.sessaoId ?? null;
}
