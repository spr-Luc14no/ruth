import { prisma } from '../config/prisma';
import { NotFoundError, BusinessRuleError, AppError } from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';

export interface CriarTurmaInput { nome: string; periodo: string; }
export interface AtualizarTurmaInput { nome?: string; periodo?: string; }

export class TurmaService {
  static async listar() {
    return prisma.turma.findMany({
      include: {
        disciplinas: {
          include: {
            professor: { select: { id: true, nome: true } },
            _count: { select: { sessoes: true } },
          },
          orderBy: { nome: 'asc' },
        },
        _count: { select: { matriculas: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  static async buscarPorId(id: number) {
    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        disciplinas: {
          include: {
            professor: { select: { id: true, nome: true, email: true } },
            _count: { select: { sessoes: true } },
          },
          orderBy: { nome: 'asc' },
        },
        matriculas: {
          include: { aluno: { select: { id: true, nome: true, email: true, matricula: true, status: true } } },
          orderBy: { aluno: { nome: 'asc' } },
        },
      },
    });
    if (!turma) throw new NotFoundError('Turma');
    return turma;
  }

  static async criar(input: CriarTurmaInput, criadoPorId?: number) {
    const criada = await prisma.turma.create({
      data: { nome: input.nome, periodo: input.periodo },
      include: { disciplinas: true, _count: { select: { matriculas: true } } },
    });
    await AuditoriaService.registrar({ usuarioId: criadoPorId, acao: 'TURMA_CRIADA', entidade: 'Turma', detalhes: `id=${criada.id} nome=${input.nome}` });
    return criada;
  }

  static async atualizar(id: number, input: AtualizarTurmaInput, atualizadoPorId?: number) {
    const atual = await prisma.turma.findUnique({ where: { id } });
    if (!atual) throw new NotFoundError('Turma');
    const atualizada = await prisma.turma.update({
      where: { id }, data: input,
      include: { disciplinas: { include: { professor: { select: { id: true, nome: true } } } }, _count: { select: { matriculas: true } } },
    });
    await AuditoriaService.registrar({ usuarioId: atualizadoPorId, acao: 'TURMA_ATUALIZADA', entidade: 'Turma', detalhes: `id=${id}` });
    return atualizada;
  }

  static async excluir(id: number, executadoPorId?: number) {
    const turma = await prisma.turma.findUnique({
      where: { id },
      include: { disciplinas: { include: { _count: { select: { sessoes: true } } } } },
    });
    if (!turma) throw new NotFoundError('Turma');
    const totalSessoes = turma.disciplinas.reduce((acc: number, d: { _count: { sessoes: number } }) => acc + d._count.sessoes, 0);
    if (totalSessoes > 0) throw new BusinessRuleError('UC006', 'Esta turma possui sessões registradas e não pode ser excluída.');
    await prisma.turma.delete({ where: { id } });
    await AuditoriaService.registrar({ usuarioId: executadoPorId, acao: 'TURMA_EXCLUIDA', entidade: 'Turma', detalhes: `id=${id}` });
    return { id };
  }

  static async matricular(turmaId: number, alunoId: number, executadoPorId?: number) {
    const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
    if (!turma) throw new NotFoundError('Turma');
    const aluno = await prisma.usuario.findUnique({ where: { id: alunoId }, select: { tipo: true, status: true } });
    if (!aluno) throw new NotFoundError('Aluno');
    if (aluno.tipo !== 'U') throw new BusinessRuleError('UC006', 'Apenas alunos podem ser matriculados.');
    const jaExiste = await prisma.matricula.findUnique({ where: { alunoId_turmaId: { alunoId, turmaId } } });
    if (jaExiste) throw new AppError('JA_MATRICULADO', 'Aluno já está matriculado nesta turma.', 409);
    await prisma.matricula.create({ data: { alunoId, turmaId } });
    await AuditoriaService.registrar({ usuarioId: executadoPorId, acao: 'MATRICULA_CRIADA', entidade: 'Matricula', detalhes: `turma=${turmaId} aluno=${alunoId}` });
    return { alunoId, turmaId };
  }

  static async desmatricular(turmaId: number, alunoId: number, executadoPorId?: number) {
    try {
      await prisma.matricula.delete({ where: { alunoId_turmaId: { alunoId, turmaId } } });
    } catch { throw new NotFoundError('Matrícula'); }
    await AuditoriaService.registrar({ usuarioId: executadoPorId, acao: 'MATRICULA_REMOVIDA', entidade: 'Matricula', detalhes: `turma=${turmaId} aluno=${alunoId}` });
    return { alunoId, turmaId };
  }
}
