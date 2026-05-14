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
    pergunta: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    presenca: { findUnique: vi.fn() },
    resposta: { findUnique: vi.fn(), create: vi.fn() },
    auditoriaLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

import { InteracaoService } from '../src/services/InteracaoService';
import { prisma } from '../src/config/prisma';
import {
  BusinessRuleError,
  ForbiddenError,
  AppError,
  NotFoundError,
} from '../src/utils/errors';

const sessaoAberta = { id: 100, professorId: 5, status: 'ABERTA' as const, turmaId: 1 };
const perguntaAtiva = {
  id: 10,
  sessaoId: 100,
  enunciado: 'Quanto é 1+1?',
  tipo: 'MULTIPLA' as const,
  ativa: true,
  criadaEm: new Date(),
  sessao: { id: 100, status: 'ABERTA', turmaId: 1, professorId: 5 },
  opcoes: [
    { id: 1, descricao: '2', correta: true },
    { id: 2, descricao: '3', correta: false },
  ],
};

beforeEach(() => vi.clearAllMocks());

describe('InteracaoService.dispararPergunta', () => {
  it('cria pergunta com opções quando dados estão ok', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(sessaoAberta);
    vi.mocked(prisma.pergunta.updateMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.pergunta.create).mockResolvedValue(perguntaAtiva);

    const result = await InteracaoService.dispararPergunta({
      sessaoId: 100,
      professorId: 5,
      enunciado: 'Quanto é 1+1?',
      tipo: 'MULTIPLA',
      opcoes: [{ descricao: '2', correta: true }, { descricao: '3' }],
    });

    expect(result.id).toBe(10);
    expect(prisma.pergunta.updateMany).toHaveBeenCalled(); // desativa anteriores
  });

  it('bloqueia professor que não é dono da sessão', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(sessaoAberta);

    await expect(
      InteracaoService.dispararPergunta({
        sessaoId: 100,
        professorId: 99,
        enunciado: 'X',
        tipo: 'MULTIPLA',
        opcoes: [{ descricao: 'a' }, { descricao: 'b' }],
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('bloqueia disparo se sessão está encerrada (RN06)', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({
      ...sessaoAberta,
      status: 'ENCERRADA',
    });

    await expect(
      InteracaoService.dispararPergunta({
        sessaoId: 100,
        professorId: 5,
        enunciado: 'X',
        tipo: 'MULTIPLA',
        opcoes: [{ descricao: 'a' }, { descricao: 'b' }],
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('rejeita múltipla escolha com menos de 2 opções', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(sessaoAberta);

    await expect(
      InteracaoService.dispararPergunta({
        sessaoId: 100,
        professorId: 5,
        enunciado: 'X',
        tipo: 'MULTIPLA',
        opcoes: [{ descricao: 'so uma' }],
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });
});

describe('InteracaoService.responder', () => {
  const presencaFake = {
    id: 1,
    sessaoId: 100,
    alunoId: 20,
    marcadoEm: new Date(),
    status: 'CONFIRMADO',
  };

  it('registra resposta válida marcando correta', async () => {
    vi.mocked(prisma.pergunta.findUnique).mockResolvedValue(perguntaAtiva);
    vi.mocked(prisma.presenca.findUnique).mockResolvedValue(presencaFake);
    vi.mocked(prisma.resposta.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.resposta.create).mockResolvedValue({
      id: 1,
      perguntaId: 10,
      alunoId: 20,
      opcaoId: 1,
      textoLivre: null,
      respondidoEm: new Date(),
      correta: true,
    });

    const result = await InteracaoService.responder({
      perguntaId: 10,
      alunoId: 20,
      opcaoId: 1,
    });

    expect(result.correta).toBe(true);
  });

  it('rejeita responder pergunta inativa', async () => {
    vi.mocked(prisma.pergunta.findUnique).mockResolvedValue({ ...perguntaAtiva, ativa: false });

    await expect(
      InteracaoService.responder({ perguntaId: 10, alunoId: 20, opcaoId: 1 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('exige check-in antes de responder (RN11)', async () => {
    vi.mocked(prisma.pergunta.findUnique).mockResolvedValue(perguntaAtiva);
    vi.mocked(prisma.presenca.findUnique).mockResolvedValue(null);

    await expect(
      InteracaoService.responder({ perguntaId: 10, alunoId: 20, opcaoId: 1 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('bloqueia resposta duplicada', async () => {
    vi.mocked(prisma.pergunta.findUnique).mockResolvedValue(perguntaAtiva);
    vi.mocked(prisma.presenca.findUnique).mockResolvedValue(presencaFake);
    vi.mocked(prisma.resposta.findUnique).mockResolvedValue({
      id: 1,
      perguntaId: 10,
      alunoId: 20,
      opcaoId: 1,
      textoLivre: null,
      respondidoEm: new Date(),
      correta: true,
    });

    await expect(
      InteracaoService.responder({ perguntaId: 10, alunoId: 20, opcaoId: 2 }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('rejeita opcaoId inválido', async () => {
    vi.mocked(prisma.pergunta.findUnique).mockResolvedValue(perguntaAtiva);
    vi.mocked(prisma.presenca.findUnique).mockResolvedValue(presencaFake);
    vi.mocked(prisma.resposta.findUnique).mockResolvedValue(null);

    await expect(
      InteracaoService.responder({ perguntaId: 10, alunoId: 20, opcaoId: 999 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('NotFound quando pergunta não existe', async () => {
    vi.mocked(prisma.pergunta.findUnique).mockResolvedValue(null);

    await expect(
      InteracaoService.responder({ perguntaId: 999, alunoId: 20, opcaoId: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
