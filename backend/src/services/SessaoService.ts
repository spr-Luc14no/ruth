import { prisma } from '../config/prisma';
import { NotFoundError, BusinessRuleError, ForbiddenError } from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';
import { gerarCodigoSessao } from '../utils/codigoSessao';

export interface CriarSessaoInput { disciplinaId: number; professorId: number; janelaMin?: number; }
const MAX_TENTATIVAS_CODIGO = 8;

const incluiDisciplina = {
  disciplina: {
    select: { id: true, nome: true, turma: { select: { id: true, nome: true, periodo: true } } },
  },
} as const;

export class SessaoService {
  static async criar(input: CriarSessaoInput) {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id: input.disciplinaId },
      select: { id: true, professorId: true, nome: true, janelaPadraoMin: true },
    });
    if (!disciplina) throw new NotFoundError('Disciplina');
    if (disciplina.professorId !== input.professorId) throw new ForbiddenError('Você não é o professor responsável por esta disciplina.');

    const ativa = await prisma.sessaoChamada.findFirst({ where: { disciplinaId: input.disciplinaId, status: 'ABERTA' }, select: { id: true, codigo: true } });
    if (ativa) throw new BusinessRuleError('UC002', `Já existe uma sessão aberta para esta disciplina (código ${ativa.codigo}).`);

    let codigo: string | null = null;
    for (let i = 0; i < MAX_TENTATIVAS_CODIGO; i++) {
      const candidato = gerarCodigoSessao();
      const existe = await prisma.sessaoChamada.findUnique({ where: { codigo: candidato }, select: { id: true } });
      if (!existe) { codigo = candidato; break; }
    }
    if (!codigo) throw new BusinessRuleError('UC002', 'Não foi possível gerar código único. Tente novamente.');

    const janelaMin = input.janelaMin && input.janelaMin > 0 ? input.janelaMin
      : disciplina.janelaPadraoMin && disciplina.janelaPadraoMin > 0 ? disciplina.janelaPadraoMin : 10;

    const sessao = await prisma.sessaoChamada.create({
      data: { disciplinaId: input.disciplinaId, professorId: input.professorId, janelaMin, codigo, status: 'ABERTA' },
      include: incluiDisciplina,
    });
    await AuditoriaService.registrar({ usuarioId: input.professorId, acao: 'SESSAO_ABERTA', entidade: 'SessaoChamada', detalhes: `id=${sessao.id} disciplina=${input.disciplinaId} codigo=${codigo}` });
    return sessao;
  }

  static async encerrar(sessaoId: number, professorId: number) {
    const sessao = await prisma.sessaoChamada.findUnique({ where: { id: sessaoId }, select: { id: true, professorId: true, status: true } });
    if (!sessao) throw new NotFoundError('Sessão');
    if (sessao.professorId !== professorId) throw new ForbiddenError('Apenas o professor que abriu pode encerrar a sessão.');
    if (sessao.status === 'ENCERRADA') throw new BusinessRuleError('RN06', 'Sessão já está encerrada.');
    const encerrada = await prisma.sessaoChamada.update({
      where: { id: sessaoId }, data: { status: 'ENCERRADA', dataEncerramento: new Date() }, include: incluiDisciplina,
    });
    await AuditoriaService.registrar({ usuarioId: professorId, acao: 'SESSAO_ENCERRADA', entidade: 'SessaoChamada', detalhes: `id=${sessaoId}` });
    return encerrada;
  }

  static async buscarPorCodigo(codigo: string) {
    const sessao = await prisma.sessaoChamada.findUnique({ where: { codigo: codigo.toUpperCase() }, include: incluiDisciplina });
    if (!sessao || sessao.status !== 'ABERTA') throw new NotFoundError('Sessão ativa');
    return sessao;
  }

  static async detalhar(sessaoId: number) {
    const sessao = await prisma.sessaoChamada.findUnique({
      where: { id: sessaoId },
      include: {
        disciplina: { select: { id: true, nome: true, turma: { select: { id: true, nome: true, periodo: true, _count: { select: { matriculas: true } } } } } },
        presencas: { include: { aluno: { select: { id: true, nome: true, matricula: true } } }, orderBy: { marcadoEm: 'asc' } },
        perguntas: { include: { opcoes: true, _count: { select: { respostas: true } } }, orderBy: { criadaEm: 'desc' } },
      },
    });
    if (!sessao) throw new NotFoundError('Sessão');
    return sessao;
  }

  static async listarDoProfessor(professorId: number) {
    return prisma.sessaoChamada.findMany({
      where: { professorId },
      include: { ...incluiDisciplina, _count: { select: { presencas: true } } },
      orderBy: { dataAbertura: 'desc' }, take: 20,
    });
  }

  static async buscarAtivaDoAluno(alunoId: number) {
    const presenca = await prisma.presenca.findFirst({
      where: { alunoId, sessao: { status: 'ABERTA' } },
      include: { sessao: { include: incluiDisciplina } },
      orderBy: { marcadoEm: 'desc' },
    });
    return presenca?.sessao ?? null;
  }
}
