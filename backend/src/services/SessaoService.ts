import { prisma } from '../config/prisma';
import { NotFoundError, BusinessRuleError, ForbiddenError } from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';
import { gerarCodigoSessao } from '../utils/codigoSessao';

export interface CriarSessaoInput {
  turmaId: number;
  professorId: number;
  janelaMin?: number;
}

const MAX_TENTATIVAS_CODIGO = 8;

export class SessaoService {
  /**
   * Cria uma sessão de chamada ativa.
   * - Valida que o professor é dono da turma
   * - Impede sessões duplicadas ativas pra mesma turma (UC002 fluxo alt 3.1)
   * - Gera código único com retry em caso de colisão
   */
  static async criar(input: CriarSessaoInput) {
    const turma = await prisma.turma.findUnique({
      where: { id: input.turmaId },
      select: { id: true, professorId: true, nome: true },
    });
    if (!turma) throw new NotFoundError('Turma');

    if (turma.professorId !== input.professorId) {
      throw new ForbiddenError('Você não é o professor responsável por esta turma.');
    }

    const ativa = await prisma.sessaoChamada.findFirst({
      where: { turmaId: input.turmaId, status: 'ABERTA' },
      select: { id: true, codigo: true },
    });
    if (ativa) {
      throw new BusinessRuleError(
        'UC002',
        `Já existe uma sessão aberta para esta turma (código ${ativa.codigo}).`,
      );
    }

    let codigo: string | null = null;
    for (let i = 0; i < MAX_TENTATIVAS_CODIGO; i++) {
      const candidato = gerarCodigoSessao();
      const existe = await prisma.sessaoChamada.findUnique({
        where: { codigo: candidato },
        select: { id: true },
      });
      if (!existe) {
        codigo = candidato;
        break;
      }
    }
    if (!codigo) {
      throw new BusinessRuleError('UC002', 'Não foi possível gerar código único. Tente novamente.');
    }

    const janelaMin = input.janelaMin && input.janelaMin > 0 ? input.janelaMin : 10;

    const sessao = await prisma.sessaoChamada.create({
      data: {
        turmaId: input.turmaId,
        professorId: input.professorId,
        janelaMin,
        codigo,
        status: 'ABERTA',
      },
      include: {
        turma: { select: { id: true, nome: true, disciplina: true } },
      },
    });

    await AuditoriaService.registrar({
      usuarioId: input.professorId,
      acao: 'SESSAO_ABERTA',
      entidade: 'SessaoChamada',
      detalhes: `id=${sessao.id} turma=${input.turmaId} codigo=${codigo}`,
    });

    return sessao;
  }

  static async encerrar(sessaoId: number, professorId: number) {
    const sessao = await prisma.sessaoChamada.findUnique({
      where: { id: sessaoId },
      select: { id: true, professorId: true, status: true },
    });
    if (!sessao) throw new NotFoundError('Sessão');

    if (sessao.professorId !== professorId) {
      throw new ForbiddenError('Apenas o professor que abriu pode encerrar a sessão.');
    }

    if (sessao.status === 'ENCERRADA') {
      throw new BusinessRuleError('RN06', 'Sessão já está encerrada.');
    }

    const encerrada = await prisma.sessaoChamada.update({
      where: { id: sessaoId },
      data: { status: 'ENCERRADA', dataEncerramento: new Date() },
      include: {
        turma: { select: { id: true, nome: true, disciplina: true } },
      },
    });

    await AuditoriaService.registrar({
      usuarioId: professorId,
      acao: 'SESSAO_ENCERRADA',
      entidade: 'SessaoChamada',
      detalhes: `id=${sessaoId}`,
    });

    return encerrada;
  }

  /**
   * Busca sessão pelo código (usado pelo aluno pra entrar).
   * Retorna apenas se estiver ABERTA — sessões encerradas não são acessíveis por código.
   */
  static async buscarPorCodigo(codigo: string) {
    const sessao = await prisma.sessaoChamada.findUnique({
      where: { codigo: codigo.toUpperCase() },
      include: {
        turma: { select: { id: true, nome: true, disciplina: true } },
      },
    });
    if (!sessao || sessao.status !== 'ABERTA') {
      throw new NotFoundError('Sessão ativa');
    }
    return sessao;
  }

  /**
   * Detalhes completos da sessão (lista de presenças, perguntas).
   * Usado pela tela do professor.
   */
  static async detalhar(sessaoId: number) {
    const sessao = await prisma.sessaoChamada.findUnique({
      where: { id: sessaoId },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            disciplina: true,
            _count: { select: { matriculas: true } },
          },
        },
        presencas: {
          include: {
            aluno: { select: { id: true, nome: true, matricula: true } },
          },
          orderBy: { marcadoEm: 'asc' },
        },
        perguntas: {
          include: {
            opcoes: true,
            _count: { select: { respostas: true } },
          },
          orderBy: { criadaEm: 'desc' },
        },
      },
    });
    if (!sessao) throw new NotFoundError('Sessão');
    return sessao;
  }

  /**
   * Sessões ativas/recentes do professor (pra dashboard).
   */
  static async listarDoProfessor(professorId: number) {
    return prisma.sessaoChamada.findMany({
      where: { professorId },
      include: {
        turma: { select: { id: true, nome: true, disciplina: true } },
        _count: { select: { presencas: true } },
      },
      orderBy: { dataAbertura: 'desc' },
      take: 20,
    });
  }

  /**
   * Retorna a sessão ABERTA em que o aluno já fez check-in, ou null.
   * Usado pelo dashboard do aluno pra oferecer "Voltar à sessão" sem ter
   * que digitar o código de novo.
   */
  static async buscarAtivaDoAluno(alunoId: number) {
    const presenca = await prisma.presenca.findFirst({
      where: {
        alunoId,
        sessao: { status: 'ABERTA' },
      },
      include: {
        sessao: {
          include: {
            turma: { select: { id: true, nome: true, disciplina: true } },
          },
        },
      },
      orderBy: { marcadoEm: 'desc' },
    });
    return presenca?.sessao ?? null;
  }
}
