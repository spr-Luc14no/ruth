import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password';
import { AuditoriaService } from './AuditoriaService';

export interface LinhaCSV { nome: string; email: string; login: string; matricula: string; senha?: string; }
export interface ResultadoImportacao {
  total: number; criados: number; matriculados: number;
  erros: Array<{ linha: number; nome: string; motivo: string }>;
}

export class ImportacaoService {
  static parseCSV(texto: string): { linhas: LinhaCSV[]; erros: string[] } {
    const erros: string[] = [];
    const linhas: LinhaCSV[] = [];
    const limpo = texto.replace(/^\uFEFF/, '');
    const linhasTexto = limpo.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (linhasTexto.length === 0) return { linhas, erros: ['Arquivo vazio.'] };
    const sep = linhasTexto[0].includes(';') ? ';' : ',';
    const header = linhasTexto[0].split(sep).map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    const idxNome = header.indexOf('nome');
    const idxEmail = header.indexOf('email');
    const idxLogin = header.indexOf('login');
    const idxMatricula = header.findIndex((h) => h === 'matricula' || h === 'matrícula');
    const idxSenha = header.indexOf('senha');
    if (idxNome === -1 || idxEmail === -1 || idxMatricula === -1) {
      return { linhas, erros: ['Cabeçalho inválido. Esperado ao menos: nome, email, matricula (login opcional).'] };
    }
    for (let i = 1; i < linhasTexto.length; i++) {
      const campos = linhasTexto[i].split(sep).map((c) => c.trim().replace(/^"|"$/g, ''));
      const nome = campos[idxNome] ?? '';
      const email = campos[idxEmail] ?? '';
      const matricula = campos[idxMatricula] ?? '';
      const login = idxLogin !== -1 && campos[idxLogin] ? campos[idxLogin] : email.split('@')[0];
      const senha = idxSenha !== -1 ? campos[idxSenha] : undefined;
      if (!nome || !email || !matricula) { erros.push(`Linha ${i + 1}: nome, email ou matrícula em branco.`); continue; }
      linhas.push({ nome, email, login, matricula, senha: senha || undefined });
    }
    return { linhas, erros };
  }

  static async importarAlunos(csvTexto: string, turmaId: number | undefined, executadoPorId?: number): Promise<ResultadoImportacao> {
    const { linhas, erros: errosParse } = this.parseCSV(csvTexto);
    const resultado: ResultadoImportacao = {
      total: linhas.length, criados: 0, matriculados: 0,
      erros: errosParse.map((motivo) => ({ linha: 0, nome: '—', motivo })),
    };
    if (turmaId) {
      const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
      if (!turma) { resultado.erros.push({ linha: 0, nome: '—', motivo: 'Turma não encontrada.' }); return resultado; }
    }
    const senhaPadraoHash = await hashPassword('aluno123');
    for (let i = 0; i < linhas.length; i++) {
      const l = linhas[i];
      try {
        const existente = await prisma.usuario.findFirst({
          where: { OR: [{ email: l.email }, { login: l.login }, { matricula: l.matricula }] },
          select: { id: true, email: true },
        });
        let alunoId: number;
        if (existente) {
          alunoId = existente.id;
          resultado.erros.push({ linha: i + 2, nome: l.nome, motivo: 'Já existe usuário com este email/login/matrícula (não recriado).' });
        } else {
          const senhaHash = l.senha ? await hashPassword(l.senha) : senhaPadraoHash;
          const novo = await prisma.usuario.create({
            data: { nome: l.nome, email: l.email, login: l.login, senha: senhaHash, tipo: 'U', status: 'A', matricula: l.matricula },
            select: { id: true },
          });
          alunoId = novo.id;
          resultado.criados++;
        }
        if (turmaId) {
          const jaMatriculado = await prisma.matricula.findUnique({ where: { alunoId_turmaId: { alunoId, turmaId } } });
          if (!jaMatriculado) { await prisma.matricula.create({ data: { alunoId, turmaId } }); resultado.matriculados++; }
        }
      } catch (e) {
        resultado.erros.push({ linha: i + 2, nome: l.nome, motivo: e instanceof Error ? e.message : 'Erro desconhecido.' });
      }
    }
    await AuditoriaService.registrar({
      usuarioId: executadoPorId, acao: 'ALUNOS_IMPORTADOS', entidade: 'Usuario',
      detalhes: `total=${resultado.total} criados=${resultado.criados} matriculados=${resultado.matriculados} turma=${turmaId ?? '—'}`,
    });
    return resultado;
  }
}
