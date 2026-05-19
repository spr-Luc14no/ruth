import { prisma } from '../config/prisma';
import { NotFoundError, BusinessRuleError, AppError } from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';

export interface CheckinInput {
  sessaoId: number;
  alunoId: number;
  ip?: string;
  dispositivo?: string;
}

export class PresencaService {
  /**
   * Registra check-in do aluno na sessão.
   * Aplica TODAS as RNs do RUTh:
   *  - RN01: presença válida só dentro da janela de tempo
   *  - RN02: tolerância de atraso parametrizada
   *  - RN06: sessão encerrada bloqueia
   *  - RN10: aluno só registra 1x (constraint UNIQUE no banco também)
   *  - RN11: aluno tem que estar matriculado na turma da sessão
   */
  static async registrar(input: CheckinInput) {
    const { sessaoId, alunoId } = input;

    const sessao = await prisma.sessaoChamada.findUnique({
      where: { id: sessaoId },
      select: {
        id: true,
        turmaId: true,
        status: true,
        dataAbertura: true,
        janelaMin: true,
      },
    });
    if (!sessao) throw new NotFoundError('Sessão');

    // RN06: sessão encerrada
    if (sessao.status !== 'ABERTA') {
      throw new BusinessRuleError('RN06', 'Esta sessão já foi encerrada.');
    }

    // RN11: aluno tem que estar matriculado na turma
    const matricula = await prisma.matricula.findUnique({
      where: { alunoId_turmaId: { alunoId, turmaId: sessao.turmaId } },
    });
    if (!matricula) {
      throw new BusinessRuleError(
        'RN11',
        'Você não está matriculado nesta turma.',
      );
    }

    // RN10: aluno só registra 1x
    const existente = await prisma.presenca.findUnique({
      where: { sessaoId_alunoId: { sessaoId, alunoId } },
    });
    if (existente) {
      throw new AppError(
        'JA_REGISTRADO',
        'Você já registrou presença nesta sessão.',
        409,
      );
    }

    // RN01 + RN02: dentro da janela + tolerância
    const agora = new Date();
    const minutosDesdeAbertura = Math.floor(
      (agora.getTime() - sessao.dataAbertura.getTime()) / 60_000,
    );

    // Busca tolerância do parâmetro
    const paramTolerancia = await prisma.parametro.findUnique({
      where: { chave: 'tolerancia_atraso' },
    });
    const toleranciaMin = paramTolerancia ? Number(paramTolerancia.valor) : 0;
    const limiteTotalMin = sessao.janelaMin + toleranciaMin;

    if (minutosDesdeAbertura > limiteTotalMin) {
      throw new BusinessRuleError(
        'RN01',
        `Janela de presença encerrada (limite: ${limiteTotalMin} min).`,
      );
    }

    const presenca = await prisma.presenca.create({
      data: {
        sessaoId,
        alunoId,
        marcadoEm: agora,
        atrasoMin: Math.max(0, minutosDesdeAbertura),
        // Se dentro da janela "normal", CONFIRMADO; se na tolerância, PENDENTE
        status: minutosDesdeAbertura <= sessao.janelaMin ? 'CONFIRMADO' : 'PENDENTE',
        validacao: 'OK',
        ip: input.ip ?? null,
        dispositivo: input.dispositivo ?? null,
      },
      include: {
        aluno: { select: { id: true, nome: true, matricula: true } },
      },
    });

    await AuditoriaService.registrar({
      usuarioId: alunoId,
      acao: 'PRESENCA_REGISTRADA',
      entidade: 'Presenca',
      detalhes: `sessao=${sessaoId} atraso=${presenca.atrasoMin}min`,
      ip: input.ip,
    });

    return presenca;
  }

  /**
   * Lista as presenças da sessão (pro professor acompanhar em tempo real).
   */
  static async listarPorSessao(sessaoId: number) {
    return prisma.presenca.findMany({
      where: { sessaoId },
      include: {
        aluno: { select: { id: true, nome: true, matricula: true } },
      },
      orderBy: { marcadoEm: 'asc' },
    });
  }

  /**
   * Confere se o aluno tem presença na sessão (pra reconexão do socket).
   */
  static async buscarDoAluno(sessaoId: number, alunoId: number) {
    return prisma.presenca.findUnique({
      where: { sessaoId_alunoId: { sessaoId, alunoId } },
      include: {
        aluno: { select: { id: true, nome: true, matricula: true } },
      },
    });
  }
}
