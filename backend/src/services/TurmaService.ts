import { prisma } from '../config/prisma';
import { NotFoundError, BusinessRuleError, AppError } from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';

export interface CriarTurmaInput {
  nome: string;
  periodo: string;
  disciplina: string;
  professorId: number;
}

export interface AtualizarTurmaInput {
  nome?: string;
  periodo?: string;
  disciplina?: string;
  professorId?: number;
}

/**
 * Service de gerenciamento de Turmas (UC006).
 * Implementa:
 *  - Validação de que o professor existe e tem perfil P
 *  - Impede exclusão se houver sessões com presenças (preserva histórico)
 *  - Gestão de matrículas (atende parte da RN11: aluno só registra
 *    presença em turma matriculada)
 */
export class TurmaService {
  static async listar(filtros: { professorId?: number } = {}) {
    return prisma.turma.findMany({
      where: filtros,
      include: {
        professor: { select: { id: true, nome: true, email: true } },
        _count: { select: { matriculas: true, sessoes: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  static async buscarPorId(id: number) {
    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        professor: { select: { id: true, nome: true, email: true } },
        matriculas: {
          include: {
            aluno: { select: { id: true, nome: true, email: true, matricula: true, status: true } },
          },
          orderBy: { aluno: { nome: 'asc' } },
        },
        _count: { select: { sessoes: true } },
      },
    });
    if (!turma) throw new NotFoundError('Turma');
    return turma;
  }

  static async criar(input: CriarTurmaInput, criadoPorId?: number) {
    const professor = await prisma.usuario.findUnique({
      where: { id: input.professorId },
      select: { id: true, tipo: true, status: true },
    });
    if (!professor) throw new NotFoundError('Professor');
    if (professor.tipo !== 'P') {
      throw new BusinessRuleError('UC006', 'Usuário informado não é um professor.');
    }
    if (professor.status !== 'A') {
      throw new BusinessRuleError('UC006', 'Professor está bloqueado.');
    }

    const criada = await prisma.turma.create({
      data: {
        nome: input.nome,
        periodo: input.periodo,
        disciplina: input.disciplina,
        professorId: input.professorId,
      },
      include: {
        professor: { select: { id: true, nome: true } },
        _count: { select: { matriculas: true, sessoes: true } },
      },
    });
    await AuditoriaService.registrar({
      usuarioId: criadoPorId,
      acao: 'TURMA_CRIADA',
      entidade: 'Turma',
      detalhes: `id=${criada.id}`,
    });
    return criada;
  }

  static async atualizar(id: number, input: AtualizarTurmaInput, atualizadoPorId?: number) {
    const atual = await prisma.turma.findUnique({ where: { id } });
    if (!atual) throw new NotFoundError('Turma');

    if (input.professorId && input.professorId !== atual.professorId) {
      const prof = await prisma.usuario.findUnique({
        where: { id: input.professorId },
        select: { tipo: true, status: true },
      });
      if (!prof) throw new NotFoundError('Professor');
      if (prof.tipo !== 'P') {
        throw new BusinessRuleError('UC006', 'Usuário informado não é um professor.');
      }
    }

    const atualizada = await prisma.turma.update({
      where: { id },
      data: input,
      include: {
        professor: { select: { id: true, nome: true } },
        _count: { select: { matriculas: true, sessoes: true } },
      },
    });
    await AuditoriaService.registrar({
      usuarioId: atualizadoPorId,
      acao: 'TURMA_ATUALIZADA',
      entidade: 'Turma',
      detalhes: `id=${id}`,
    });
    return atualizada;
  }

  /**
   * RN documentada (UC006 — fluxo alternativo 2.2):
   * "O sistema impede apagar uma turma que possua registros de presença ativos."
   */
  static async excluir(id: number, executadoPorId?: number) {
    const turma = await prisma.turma.findUnique({
      where: { id },
      include: { _count: { select: { sessoes: true } } },
    });
    if (!turma) throw new NotFoundError('Turma');

    if (turma._count.sessoes > 0) {
      throw new BusinessRuleError(
        'UC006',
        'Esta turma possui sessões registradas e não pode ser excluída. Você pode arquivar os dados em vez disso.',
      );
    }

    await prisma.turma.delete({ where: { id } });
    await AuditoriaService.registrar({
      usuarioId: executadoPorId,
      acao: 'TURMA_EXCLUIDA',
      entidade: 'Turma',
      detalhes: `id=${id}`,
    });
    return { id };
  }

  // ====================== Matrículas ======================

  static async matricular(turmaId: number, alunoId: number, executadoPorId?: number) {
    const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
    if (!turma) throw new NotFoundError('Turma');

    const aluno = await prisma.usuario.findUnique({
      where: { id: alunoId },
      select: { tipo: true, status: true },
    });
    if (!aluno) throw new NotFoundError('Aluno');
    if (aluno.tipo !== 'U') {
      throw new BusinessRuleError('UC006', 'Apenas alunos podem ser matriculados.');
    }

    const jaExiste = await prisma.matricula.findUnique({
      where: { alunoId_turmaId: { alunoId, turmaId } },
    });
    if (jaExiste) {
      throw new AppError('JA_MATRICULADO', 'Aluno já está matriculado nesta turma.', 409);
    }

    await prisma.matricula.create({ data: { alunoId, turmaId } });
    await AuditoriaService.registrar({
      usuarioId: executadoPorId,
      acao: 'MATRICULA_CRIADA',
      entidade: 'Matricula',
      detalhes: `turma=${turmaId} aluno=${alunoId}`,
    });
    return { alunoId, turmaId };
  }

  static async desmatricular(turmaId: number, alunoId: number, executadoPorId?: number) {
    try {
      await prisma.matricula.delete({
        where: { alunoId_turmaId: { alunoId, turmaId } },
      });
    } catch {
      throw new NotFoundError('Matrícula');
    }
    await AuditoriaService.registrar({
      usuarioId: executadoPorId,
      acao: 'MATRICULA_REMOVIDA',
      entidade: 'Matricula',
      detalhes: `turma=${turmaId} aluno=${alunoId}`,
    });
    return { alunoId, turmaId };
  }
}
