import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-32-chars-minimum-aaaaaaaaaa',
    JWT_EXPIRES_IN: '8h',
    BCRYPT_SALT_ROUNDS: 10,
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_LOCKOUT_MINUTES: 15,
    NODE_ENV: 'test',
    PORT: 3001,
    DATABASE_URL: 'mysql://test',
    CORS_ORIGIN: 'http://localhost:5173',
  },
}));

vi.mock('../src/config/prisma', () => ({
  prisma: {
    turma: { findUnique: vi.fn() },
    sessaoChamada: { findMany: vi.fn() },
    matricula: { findMany: vi.fn() },
    presenca: { findMany: vi.fn() },
  },
}));

import { RelatorioService } from '../src/services/RelatorioService';
import { prisma } from '../src/config/prisma';
import { ForbiddenError, NotFoundError } from '../src/utils/errors';

const turmaFake = {
  id: 1,
  nome: 'Arq Software',
  disciplina: 'Arquitetura',
  periodo: '2026/01',
  professorId: 5,
};

beforeEach(() => vi.clearAllMocks());

describe('RelatorioService.consolidarPorTurma', () => {
  it('consolida presenças com cálculo correto de % e faltas', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue(turmaFake);
    vi.mocked(prisma.sessaoChamada.findMany).mockResolvedValue([
      { id: 100 },
      { id: 101 },
      { id: 102 },
      { id: 103 },
    ]);
    vi.mocked(prisma.matricula.findMany).mockResolvedValue([
      { alunoId: 20, aluno: { id: 20, nome: 'Ramon', matricula: '2026001' } },
      { alunoId: 21, aluno: { id: 21, nome: 'Luiz', matricula: '2026002' } },
    ]);
    vi.mocked(prisma.presenca.findMany).mockResolvedValue([
      // Ramon: 3 confirmadas + 1 pendente → 4/4 = 100%
      { alunoId: 20, status: 'CONFIRMADO', marcadoEm: new Date('2026-05-01') },
      { alunoId: 20, status: 'CONFIRMADO', marcadoEm: new Date('2026-05-02') },
      { alunoId: 20, status: 'CONFIRMADO', marcadoEm: new Date('2026-05-03') },
      { alunoId: 20, status: 'PENDENTE', marcadoEm: new Date('2026-05-04') },
      // Luiz: 1 confirmada → 1/4 = 25%
      { alunoId: 21, status: 'CONFIRMADO', marcadoEm: new Date('2026-05-01') },
    ]);

    const r = await RelatorioService.consolidarPorTurma(1, {}, 5, 'P');

    expect(r.totalSessoesConsideradas).toBe(4);
    expect(r.linhas).toHaveLength(2);

    const ramon = r.linhas.find((l) => l.alunoId === 20)!;
    expect(ramon.presencasConfirmadas).toBe(3);
    expect(ramon.presencasPendentes).toBe(1);
    expect(ramon.faltas).toBe(0);
    expect(ramon.percentualPresenca).toBe(100);

    const luiz = r.linhas.find((l) => l.alunoId === 21)!;
    expect(luiz.presencasConfirmadas).toBe(1);
    expect(luiz.faltas).toBe(3);
    expect(luiz.percentualPresenca).toBe(25);
  });

  it('retorna 0% quando não há sessões no período', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue(turmaFake);
    vi.mocked(prisma.sessaoChamada.findMany).mockResolvedValue([]);
    vi.mocked(prisma.matricula.findMany).mockResolvedValue([
      { alunoId: 20, aluno: { id: 20, nome: 'Ramon', matricula: '2026001' } },
    ]);
    vi.mocked(prisma.presenca.findMany).mockResolvedValue([]);

    const r = await RelatorioService.consolidarPorTurma(1, {}, 5, 'P');

    expect(r.totalSessoesConsideradas).toBe(0);
    expect(r.linhas[0].percentualPresenca).toBe(0);
    expect(r.linhas[0].faltas).toBe(0);
  });

  it('bloqueia professor não-dono da turma', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({ ...turmaFake, professorId: 99 });

    await expect(
      RelatorioService.consolidarPorTurma(1, {}, 5, 'P'),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('bloqueia aluno de acessar relatório', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue(turmaFake);

    await expect(
      RelatorioService.consolidarPorTurma(1, {}, 20, 'U'),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('NotFound quando turma não existe', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue(null);

    await expect(
      RelatorioService.consolidarPorTurma(999, {}, 5, 'A'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('RelatorioService.gerarCSV', () => {
  it('gera CSV válido com BOM e linhas separadas por CRLF', () => {
    const csv = RelatorioService.gerarCSV({
      turma: { id: 1, nome: 'Arq', disciplina: 'X', periodo: '2026/01' },
      filtro: {},
      geradoEm: new Date('2026-05-19').toISOString(),
      totalSessoesConsideradas: 2,
      linhas: [
        {
          alunoId: 20,
          alunoNome: 'Ramon',
          matricula: '2026001',
          totalSessoes: 2,
          presencasConfirmadas: 2,
          presencasPendentes: 0,
          faltas: 0,
          percentualPresenca: 100,
          ultimaPresenca: '2026-05-15T10:00:00Z',
        },
      ],
    });

    expect(csv).toContain('\uFEFF'); // BOM
    expect(csv).toContain('Ramon');
    expect(csv).toContain('100%');
    expect(csv).toContain('\r\n');
  });

  it('escapa valores com aspas e vírgulas', () => {
    const csv = RelatorioService.gerarCSV({
      turma: { id: 1, nome: 'Arq', disciplina: 'X', periodo: '2026/01' },
      filtro: {},
      geradoEm: new Date().toISOString(),
      totalSessoesConsideradas: 1,
      linhas: [
        {
          alunoId: 20,
          alunoNome: 'Silva, José "Junior"',
          matricula: null,
          totalSessoes: 1,
          presencasConfirmadas: 1,
          presencasPendentes: 0,
          faltas: 0,
          percentualPresenca: 100,
          ultimaPresenca: null,
        },
      ],
    });

    expect(csv).toContain('"Silva, José ""Junior"""');
  });
});
