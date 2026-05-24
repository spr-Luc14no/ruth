import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/config/env', () => ({ env: { JWT_SECRET: 'test-secret-32-chars-minimum-aaaaaaaaaa', JWT_EXPIRES_IN: '8h', BCRYPT_SALT_ROUNDS: 10, MAX_LOGIN_ATTEMPTS: 5, LOGIN_LOCKOUT_MINUTES: 15, NODE_ENV: 'test', PORT: 3001, DATABASE_URL: 'mysql://test', CORS_ORIGIN: 'http://localhost:5173' } }));
vi.mock('../src/config/prisma', () => ({ prisma: { disciplina: { findUnique: vi.fn() }, sessaoChamada: { findMany: vi.fn() }, matricula: { findMany: vi.fn() }, presenca: { findMany: vi.fn() }, parametro: { findUnique: vi.fn() } } }));
import { RelatorioService } from '../src/services/RelatorioService';
import { prisma } from '../src/config/prisma';
import { ForbiddenError, NotFoundError } from '../src/utils/errors';
const disciplinaFake = { id: 1, nome: 'Arquitetura', turmaId: 10, professorId: 5, turma: { id: 10, nome: 'Eng Software', periodo: '2026/01' }, professor: { id: 5, nome: 'Moacir' } };
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.parametro.findUnique).mockResolvedValue({ id: 1, chave: 'presenca_minima', descricao: '', valor: '75', tipo: 'P', ativo: true });
});
describe('RelatorioService.consolidarPorDisciplina', () => {
  it('consolida com % e RN04 aprovado/reprovado', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue(disciplinaFake);
    vi.mocked(prisma.sessaoChamada.findMany).mockResolvedValue([{ id: 100 }, { id: 101 }, { id: 102 }, { id: 103 }]);
    vi.mocked(prisma.matricula.findMany).mockResolvedValue([
      { alunoId: 20, aluno: { id: 20, nome: 'Ramon', matricula: '2026001' } },
      { alunoId: 21, aluno: { id: 21, nome: 'Luiz', matricula: '2026002' } },
    ]);
    vi.mocked(prisma.presenca.findMany).mockResolvedValue([
      { alunoId: 20, status: 'CONFIRMADO', marcadoEm: new Date('2026-05-01') },
      { alunoId: 20, status: 'CONFIRMADO', marcadoEm: new Date('2026-05-02') },
      { alunoId: 20, status: 'CONFIRMADO', marcadoEm: new Date('2026-05-03') },
      { alunoId: 20, status: 'PENDENTE', marcadoEm: new Date('2026-05-04') },
      { alunoId: 21, status: 'CONFIRMADO', marcadoEm: new Date('2026-05-01') },
    ]);
    const r = await RelatorioService.consolidarPorDisciplina(1, {}, 5, 'P');
    expect(r.totalSessoesConsideradas).toBe(4);
    expect(r.presencaMinima).toBe(75);
    expect(r.linhas.find((l) => l.alunoId === 20)!.aprovado).toBe(true);
    expect(r.linhas.find((l) => l.alunoId === 21)!.percentualPresenca).toBe(25);
    expect(r.linhas.find((l) => l.alunoId === 21)!.aprovado).toBe(false);
  });
  it('0% quando sem sessoes', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue(disciplinaFake);
    vi.mocked(prisma.sessaoChamada.findMany).mockResolvedValue([]);
    vi.mocked(prisma.matricula.findMany).mockResolvedValue([{ alunoId: 20, aluno: { id: 20, nome: 'Ramon', matricula: '2026001' } }]);
    vi.mocked(prisma.presenca.findMany).mockResolvedValue([]);
    const r = await RelatorioService.consolidarPorDisciplina(1, {}, 5, 'P');
    expect(r.linhas[0].percentualPresenca).toBe(0);
    expect(r.linhas[0].aprovado).toBe(false);
  });
  it('bloqueia professor nao-dono', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue({ ...disciplinaFake, professorId: 99 });
    await expect(RelatorioService.consolidarPorDisciplina(1, {}, 5, 'P')).rejects.toBeInstanceOf(ForbiddenError);
  });
  it('bloqueia aluno', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue(disciplinaFake);
    await expect(RelatorioService.consolidarPorDisciplina(1, {}, 20, 'U')).rejects.toBeInstanceOf(ForbiddenError);
  });
  it('NotFound quando disciplina nao existe', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue(null);
    await expect(RelatorioService.consolidarPorDisciplina(999, {}, 5, 'A')).rejects.toBeInstanceOf(NotFoundError);
  });
});
describe('RelatorioService.gerarCSV', () => {
  const rel = { disciplina: { id: 1, nome: 'Arq', turma: { id: 10, nome: 'Eng', periodo: '2026/01' }, professor: { id: 5, nome: 'Moacir' } }, filtro: {}, geradoEm: new Date('2026-05-19').toISOString(), totalSessoesConsideradas: 2, presencaMinima: 75, linhas: [{ alunoId: 20, alunoNome: 'Ramon', matricula: '2026001', totalSessoes: 2, presencasConfirmadas: 2, presencasPendentes: 0, faltas: 0, percentualPresenca: 100, ultimaPresenca: '2026-05-15T10:00:00Z', aprovado: true }] };
  it('gera CSV com BOM, CRLF e Aprovado', () => {
    const csv = RelatorioService.gerarCSV(rel);
    expect(csv).toContain('\uFEFF');
    expect(csv).toContain('Ramon');
    expect(csv).toContain('Aprovado');
    expect(csv).toContain('\r\n');
  });
  it('escapa aspas e virgulas', () => {
    const csv = RelatorioService.gerarCSV({ ...rel, linhas: [{ alunoId: 20, alunoNome: 'Silva, José "Junior"', matricula: null, totalSessoes: 1, presencasConfirmadas: 1, presencasPendentes: 0, faltas: 0, percentualPresenca: 100, ultimaPresenca: null, aprovado: true }] });
    expect(csv).toContain('"Silva, José ""Junior"""');
  });
});
