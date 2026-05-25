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
    sessaoChamada: { findUnique: vi.fn() },
    matricula: { findUnique: vi.fn() },
    presenca: { findUnique: vi.fn(), create: vi.fn() },
    parametro: { findUnique: vi.fn() },
    auditoriaLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

import { PresencaService } from '../src/services/PresencaService';
import { prisma } from '../src/config/prisma';
import { BusinessRuleError, AppError, NotFoundError } from '../src/utils/errors';

const agora = new Date();
const sessaoAbertaRecente = {
  id: 100,
  status: 'ABERTA' as const,
  dataAbertura: new Date(agora.getTime() - 2 * 60_000),
  janelaMin: 10,
  disciplina: { turmaId: 1, toleranciaAtrasoMin: null },
};

const matriculaFake = { alunoId: 20, turmaId: 1 };
const presencaCriada = {
  id: 1,
  sessaoId: 100,
  alunoId: 20,
  marcadoEm: agora,
  atrasoMin: 2,
  status: 'CONFIRMADO' as const,
  validacao: 'OK' as const,
  ip: null,
  dispositivo: null,
  aluno: { id: 20, nome: 'Aluno X', matricula: '2026001' },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.parametro.findUnique).mockResolvedValue({
    id: 2,
    chave: 'tolerancia_atraso',
    descricao: 'Tolerância',
    valor: '5',
    tipo: 'MIN',
    ativo: true,
  });
});

describe('PresencaService.registrar', () => {
  it('registra check-in CONFIRMADO quando dentro da janela', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(sessaoAbertaRecente);
    vi.mocked(prisma.matricula.findUnique).mockResolvedValue(matriculaFake);
    vi.mocked(prisma.presenca.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.presenca.create).mockResolvedValue(presencaCriada);

    const result = await PresencaService.registrar({ sessaoId: 100, alunoId: 20 });

    expect(result.id).toBe(1);
    expect(prisma.presenca.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CONFIRMADO' }),
      }),
    );
    expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ acao: 'PRESENCA_REGISTRADA' }),
      }),
    );
  });

  it('RN06: bloqueia check-in em sessão encerrada', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({
      ...sessaoAbertaRecente,
      status: 'ENCERRADA',
    });

    await expect(
      PresencaService.registrar({ sessaoId: 100, alunoId: 20 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);

    expect(prisma.presenca.create).not.toHaveBeenCalled();
  });

  it('RN11: bloqueia aluno não matriculado na turma', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(sessaoAbertaRecente);
    vi.mocked(prisma.matricula.findUnique).mockResolvedValue(null);

    await expect(
      PresencaService.registrar({ sessaoId: 100, alunoId: 99 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('RN10: bloqueia segundo check-in do mesmo aluno', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(sessaoAbertaRecente);
    vi.mocked(prisma.matricula.findUnique).mockResolvedValue(matriculaFake);
    vi.mocked(prisma.presenca.findUnique).mockResolvedValue(presencaCriada);

    await expect(
      PresencaService.registrar({ sessaoId: 100, alunoId: 20 }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('RN01: bloqueia check-in fora da janela total (janela + tolerância)', async () => {
    // Sessão aberta há 20 minutos, janela 10 + tolerância 5 = 15 → fora
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({
      ...sessaoAbertaRecente,
      dataAbertura: new Date(agora.getTime() - 20 * 60_000),
    });
    vi.mocked(prisma.matricula.findUnique).mockResolvedValue(matriculaFake);
    vi.mocked(prisma.presenca.findUnique).mockResolvedValue(null);

    await expect(
      PresencaService.registrar({ sessaoId: 100, alunoId: 20 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('RN02: marca como PENDENTE quando entra na tolerância (após janela mas antes do limite)', async () => {
    // 12 minutos: além da janela (10), dentro do limite total (15)
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({
      ...sessaoAbertaRecente,
      dataAbertura: new Date(agora.getTime() - 12 * 60_000),
    });
    vi.mocked(prisma.matricula.findUnique).mockResolvedValue(matriculaFake);
    vi.mocked(prisma.presenca.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.presenca.create).mockResolvedValue({ ...presencaCriada, status: 'PENDENTE' });

    await PresencaService.registrar({ sessaoId: 100, alunoId: 20 });

    expect(prisma.presenca.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PENDENTE' }),
      }),
    );
  });

  it('rejeita NotFoundError quando sessão não existe', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(null);

    await expect(
      PresencaService.registrar({ sessaoId: 999, alunoId: 20 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
