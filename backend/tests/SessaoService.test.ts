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

vi.mock('../src/sockets', () => ({
  emitToSessao: vi.fn(),
}));

vi.mock('../src/config/prisma', () => ({
  prisma: {
    turma: { findUnique: vi.fn() },
    sessaoChamada: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditoriaLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

import { SessaoService } from '../src/services/SessaoService';
import { prisma } from '../src/config/prisma';
import { BusinessRuleError, ForbiddenError, NotFoundError } from '../src/utils/errors';

const turmaFake = { id: 1, professorId: 5, nome: 'Arq Soft' };
const sessaoFake = {
  id: 100,
  turmaId: 1,
  professorId: 5,
  janelaMin: 10,
  status: 'ABERTA' as const,
  codigo: 'A2B3',
  dataAbertura: new Date(),
  dataEncerramento: null,
  turma: { id: 1, nome: 'Arq Soft', disciplina: 'Arquitetura' },
};

beforeEach(() => vi.clearAllMocks());

describe('SessaoService.criar', () => {
  it('cria sessão com sucesso quando professor é dono da turma e não há sessão ativa', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue(turmaFake);
    vi.mocked(prisma.sessaoChamada.findFirst).mockResolvedValue(null); // sem sessão ativa
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(null); // código livre
    vi.mocked(prisma.sessaoChamada.create).mockResolvedValue(sessaoFake);

    const result = await SessaoService.criar({ turmaId: 1, professorId: 5, janelaMin: 10 });

    expect(result.id).toBe(100);
    expect(result.codigo).toBeTruthy();
    expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: 'SESSAO_ABERTA' }) }),
    );
  });

  it('bloqueia se professor não é dono da turma', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({ ...turmaFake, professorId: 99 });

    await expect(
      SessaoService.criar({ turmaId: 1, professorId: 5 }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(prisma.sessaoChamada.create).not.toHaveBeenCalled();
  });

  it('bloqueia se já existe sessão ativa pra mesma turma (UC002)', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue(turmaFake);
    vi.mocked(prisma.sessaoChamada.findFirst).mockResolvedValue({
      id: 50,
      codigo: 'XYZA',
    });

    await expect(
      SessaoService.criar({ turmaId: 1, professorId: 5 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('aplica janela padrão de 10 min quando não fornecida', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue(turmaFake);
    vi.mocked(prisma.sessaoChamada.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.sessaoChamada.create).mockResolvedValue(sessaoFake);

    await SessaoService.criar({ turmaId: 1, professorId: 5 });

    expect(prisma.sessaoChamada.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ janelaMin: 10 }) }),
    );
  });
});

describe('SessaoService.encerrar', () => {
  it('encerra sessão ativa com sucesso', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({
      id: 100,
      professorId: 5,
      status: 'ABERTA',
    });
    vi.mocked(prisma.sessaoChamada.update).mockResolvedValue({
      ...sessaoFake,
      status: 'ENCERRADA',
      dataEncerramento: new Date(),
    });

    const result = await SessaoService.encerrar(100, 5);

    expect(result.status).toBe('ENCERRADA');
    expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: 'SESSAO_ENCERRADA' }) }),
    );
  });

  it('bloqueia outro professor de encerrar sessão alheia', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({
      id: 100,
      professorId: 5,
      status: 'ABERTA',
    });

    await expect(SessaoService.encerrar(100, 99)).rejects.toBeInstanceOf(ForbiddenError);
    expect(prisma.sessaoChamada.update).not.toHaveBeenCalled();
  });

  it('rejeita encerrar sessão já encerrada (RN06)', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({
      id: 100,
      professorId: 5,
      status: 'ENCERRADA',
    });

    await expect(SessaoService.encerrar(100, 5)).rejects.toBeInstanceOf(BusinessRuleError);
  });
});

describe('SessaoService.buscarPorCodigo', () => {
  it('rejeita código de sessão encerrada (RN06)', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({
      ...sessaoFake,
      status: 'ENCERRADA',
    });

    await expect(SessaoService.buscarPorCodigo('A2B3')).rejects.toBeInstanceOf(NotFoundError);
  });
});
