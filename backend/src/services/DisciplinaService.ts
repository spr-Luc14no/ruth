import { prisma } from '../config/prisma';
import { NotFoundError, BusinessRuleError } from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';

export interface CriarDisciplinaInput { nome: string; turmaId: number; professorId: number; toleranciaAtrasoMin?: number | null; janelaPadraoMin?: number | null; }
export interface AtualizarDisciplinaInput { nome?: string; professorId?: number; toleranciaAtrasoMin?: number | null; janelaPadraoMin?: number | null; }

export class DisciplinaService {
  static async listarPorTurma(turmaId: number) {
    return prisma.disciplina.findMany({
      where: { turmaId },
      include: { professor: { select: { id: true, nome: true } }, _count: { select: { sessoes: true } } },
      orderBy: { nome: 'asc' },
    });
  }

  static async listarDoProfessor(professorId: number) {
    return prisma.disciplina.findMany({
      where: { professorId },
      include: { turma: { select: { id: true, nome: true, periodo: true } }, _count: { select: { sessoes: true } } },
      orderBy: [{ turma: { nome: 'asc' } }, { nome: 'asc' }],
    });
  }

  static async buscarPorId(id: number) {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id },
      include: { turma: { select: { id: true, nome: true, periodo: true } }, professor: { select: { id: true, nome: true } } },
    });
    if (!disciplina) throw new NotFoundError('Disciplina');
    return disciplina;
  }

  static async criar(input: CriarDisciplinaInput, criadoPorId?: number) {
    const turma = await prisma.turma.findUnique({ where: { id: input.turmaId } });
    if (!turma) throw new NotFoundError('Turma');
    const professor = await prisma.usuario.findUnique({ where: { id: input.professorId }, select: { tipo: true, status: true } });
    if (!professor) throw new NotFoundError('Professor');
    if (professor.tipo !== 'P') throw new BusinessRuleError('DISCIPLINA', 'Usuário informado não é um professor.');
    if (professor.status !== 'A') throw new BusinessRuleError('DISCIPLINA', 'Professor está bloqueado.');
    const criada = await prisma.disciplina.create({
      data: { nome: input.nome, turmaId: input.turmaId, professorId: input.professorId, toleranciaAtrasoMin: input.toleranciaAtrasoMin ?? null, janelaPadraoMin: input.janelaPadraoMin ?? null },
      include: { professor: { select: { id: true, nome: true } } },
    });
    await AuditoriaService.registrar({ usuarioId: criadoPorId, acao: 'DISCIPLINA_CRIADA', entidade: 'Disciplina', detalhes: `id=${criada.id} nome=${input.nome} turma=${input.turmaId}` });
    return criada;
  }

  static async atualizar(id: number, input: AtualizarDisciplinaInput, executadoPorId?: number) {
    const atual = await prisma.disciplina.findUnique({ where: { id } });
    if (!atual) throw new NotFoundError('Disciplina');
    if (input.professorId && input.professorId !== atual.professorId) {
      const prof = await prisma.usuario.findUnique({ where: { id: input.professorId }, select: { tipo: true } });
      if (!prof) throw new NotFoundError('Professor');
      if (prof.tipo !== 'P') throw new BusinessRuleError('DISCIPLINA', 'Usuário informado não é um professor.');
    }
    const atualizada = await prisma.disciplina.update({
      where: { id },
      data: {
        ...(input.nome !== undefined ? { nome: input.nome } : {}),
        ...(input.professorId !== undefined ? { professorId: input.professorId } : {}),
        ...(input.toleranciaAtrasoMin !== undefined ? { toleranciaAtrasoMin: input.toleranciaAtrasoMin } : {}),
        ...(input.janelaPadraoMin !== undefined ? { janelaPadraoMin: input.janelaPadraoMin } : {}),
      },
      include: { professor: { select: { id: true, nome: true } } },
    });
    await AuditoriaService.registrar({ usuarioId: executadoPorId, acao: 'DISCIPLINA_ATUALIZADA', entidade: 'Disciplina', detalhes: `id=${id}` });
    return atualizada;
  }

  static async excluir(id: number, executadoPorId?: number) {
    const disciplina = await prisma.disciplina.findUnique({ where: { id }, include: { _count: { select: { sessoes: true } } } });
    if (!disciplina) throw new NotFoundError('Disciplina');
    if (disciplina._count.sessoes > 0) throw new BusinessRuleError('DISCIPLINA', 'Esta disciplina possui sessões registradas e não pode ser excluída.');
    await prisma.disciplina.delete({ where: { id } });
    await AuditoriaService.registrar({ usuarioId: executadoPorId, acao: 'DISCIPLINA_EXCLUIDA', entidade: 'Disciplina', detalhes: `id=${id}` });
    return { id };
  }
}
