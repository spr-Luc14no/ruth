import { prisma } from '../config/prisma';
import {
  NotFoundError,
  BusinessRuleError,
  ForbiddenError,
  AppError,
} from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';

export type TipoPergunta = 'MULTIPLA' | 'VF' | 'ENQUETE' | 'TEXTO';

export interface CriarPerguntaInput {
  sessaoId: number;
  professorId: number;
  enunciado: string;
  tipo: TipoPergunta;
  opcoes?: Array<{ descricao: string; correta?: boolean }>;
}

export interface ResponderInput {
  perguntaId: number;
  alunoId: number;
  opcaoId?: number;
  textoLivre?: string;
}

export class InteracaoService {
  /**
   * Dispara uma pergunta interativa na sessão.
   * - Só professor da sessão pode disparar
   * - Sessão precisa estar ABERTA
   * - Desativa qualquer pergunta ativa anterior (uma por vez)
   */
  static async dispararPergunta(input: CriarPerguntaInput) {
    const sessao = await prisma.sessaoChamada.findUnique({
      where: { id: input.sessaoId },
      select: { id: true, professorId: true, status: true },
    });
    if (!sessao) throw new NotFoundError('Sessão');

    if (sessao.professorId !== input.professorId) {
      throw new ForbiddenError('Apenas o professor da sessão pode disparar interações.');
    }

    if (sessao.status !== 'ABERTA') {
      throw new BusinessRuleError('RN06', 'Sessão precisa estar ativa.');
    }

    if (input.tipo !== 'TEXTO' && (!input.opcoes || input.opcoes.length < 2)) {
      throw new BusinessRuleError(
        'UC004',
        'Pergunta de múltipla escolha precisa de pelo menos 2 opções.',
      );
    }

    // Desativa quaisquer perguntas ativas anteriores
    await prisma.pergunta.updateMany({
      where: { sessaoId: input.sessaoId, ativa: true },
      data: { ativa: false },
    });

    const pergunta = await prisma.pergunta.create({
      data: {
        sessaoId: input.sessaoId,
        enunciado: input.enunciado,
        tipo: input.tipo,
        ativa: true,
        opcoes: input.opcoes
          ? {
              create: input.opcoes.map((o) => ({
                descricao: o.descricao,
                correta: o.correta ?? false,
              })),
            }
          : undefined,
      },
      include: { opcoes: true },
    });

    await AuditoriaService.registrar({
      usuarioId: input.professorId,
      acao: 'PERGUNTA_DISPARADA',
      entidade: 'Pergunta',
      detalhes: `id=${pergunta.id} sessao=${input.sessaoId}`,
    });

    return pergunta;
  }

  /**
   * Encerra a pergunta ativa (deixa de aceitar respostas).
   */
  static async encerrarPergunta(perguntaId: number, professorId: number) {
    const pergunta = await prisma.pergunta.findUnique({
      where: { id: perguntaId },
      include: { sessao: { select: { professorId: true } } },
    });
    if (!pergunta) throw new NotFoundError('Pergunta');
    if (pergunta.sessao.professorId !== professorId) {
      throw new ForbiddenError('Apenas o professor da sessão pode encerrar.');
    }

    return prisma.pergunta.update({
      where: { id: perguntaId },
      data: { ativa: false },
    });
  }

  /**
   * Aluno responde a uma pergunta ativa.
   * RN03: presença pode ser confirmada/invalidada conforme resposta.
   * Implementação: responder mantém o status atual (não invalida).
   * Não-resposta vai ser tratada quando a sessão for encerrada (PR futuro).
   */
  static async responder(input: ResponderInput) {
    const pergunta = await prisma.pergunta.findUnique({
      where: { id: input.perguntaId },
      include: {
        sessao: { select: { id: true, status: true } },
        opcoes: true,
      },
    });
    if (!pergunta) throw new NotFoundError('Pergunta');

    if (!pergunta.ativa) {
      throw new BusinessRuleError('UC004', 'Esta pergunta não está mais aceitando respostas.');
    }

    if (pergunta.sessao.status !== 'ABERTA') {
      throw new BusinessRuleError('RN06', 'A sessão foi encerrada.');
    }

    // Aluno tem que ter check-in feito na sessão
    const presenca = await prisma.presenca.findUnique({
      where: { sessaoId_alunoId: { sessaoId: pergunta.sessao.id, alunoId: input.alunoId } },
    });
    if (!presenca) {
      throw new BusinessRuleError(
        'RN11',
        'Faça check-in na sessão antes de responder.',
      );
    }

    // Não responde 2x
    const jaRespondeu = await prisma.resposta.findUnique({
      where: { perguntaId_alunoId: { perguntaId: input.perguntaId, alunoId: input.alunoId } },
    });
    if (jaRespondeu) {
      throw new AppError('JA_RESPONDEU', 'Você já respondeu esta pergunta.', 409);
    }

    // Valida resposta: opcao válida ou texto
    let opcaoId: number | undefined;
    let correta = false;
    let textoLivre: string | undefined;

    if (pergunta.tipo === 'TEXTO') {
      if (!input.textoLivre?.trim()) {
        throw new BusinessRuleError('UC004', 'Resposta de texto não pode ser vazia.');
      }
      textoLivre = input.textoLivre.trim();
    } else {
      if (!input.opcaoId) {
        throw new BusinessRuleError('UC004', 'Selecione uma opção.');
      }
      const opcao = pergunta.opcoes.find(
        (o: { id: number; descricao: string; correta: boolean }) => o.id === input.opcaoId,
      );
      if (!opcao) {
        throw new BusinessRuleError('UC004', 'Opção inválida pra esta pergunta.');
      }
      opcaoId = opcao.id;
      correta = opcao.correta;
    }

    const resposta = await prisma.resposta.create({
      data: {
        perguntaId: input.perguntaId,
        alunoId: input.alunoId,
        opcaoId,
        textoLivre,
        correta,
      },
    });

    return resposta;
  }

  /**
   * Resultados consolidados de uma pergunta (contagem por opção).
   * Usado pro professor ver em tempo real.
   */
  static async resultados(perguntaId: number) {
    const pergunta = await prisma.pergunta.findUnique({
      where: { id: perguntaId },
      include: {
        opcoes: true,
        respostas: {
          include: {
            aluno: { select: { id: true, nome: true } },
          },
        },
      },
    });
    if (!pergunta) throw new NotFoundError('Pergunta');

    const totalRespostas = pergunta.respostas.length;

    const porOpcao = pergunta.opcoes.map(
      (opcao: { id: number; descricao: string; correta: boolean }) => {
        const count = pergunta.respostas.filter(
          (r: { opcaoId: number | null }) => r.opcaoId === opcao.id,
        ).length;
        return {
          opcaoId: opcao.id,
          descricao: opcao.descricao,
          correta: opcao.correta,
          count,
          percentual: totalRespostas > 0 ? Math.round((count / totalRespostas) * 100) : 0,
        };
      },
    );

    return {
      perguntaId: pergunta.id,
      enunciado: pergunta.enunciado,
      tipo: pergunta.tipo,
      ativa: pergunta.ativa,
      totalRespostas,
      porOpcao,
    };
  }
}
