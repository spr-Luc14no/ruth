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
    usuario: {
      findUnique: vi.fn(),
    },
    turma: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    matricula: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    auditoriaLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { TurmaService } from '../src/services/TurmaService';
import { prisma } from '../src/config/prisma';
import { BusinessRuleError, NotFoundError, AppError } from '../src/utils/errors';

const professorFake = { id: 5, tipo: 'P' as const, status: 'A' as const };
const alunoFake = { id: 20, tipo: 'U' as const, status: 'A' as const };

beforeEach(() => vi.clearAllMocks());

describe('TurmaService.criar', () => {
  it('cria turma quando professor existe e tem perfil P', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(professorFake);
    vi.mocked(prisma.turma.create).mockResolvedValue({
      id: 1,
      nome: 'Arq Soft',
      periodo: '2026/1',
      disciplina: 'Arquitetura de Software',
      professorId: 5,
    });

    const result = await TurmaService.criar({
      nome: 'Arq Soft',
      periodo: '2026/1',
      disciplina: 'Arquitetura de Software',
      professorId: 5,
    });

    expect(result.id).toBe(1);
    expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: 'TURMA_CRIADA' }) }),
    );
  });

  it('rejeita criar turma com usuário que não é professor', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({
      id: 5,
      tipo: 'U',
      status: 'A',
    });

    await expect(
      TurmaService.criar({
        nome: 'X',
        periodo: '2026/1',
        disciplina: 'Y',
        professorId: 5,
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('rejeita quando professor não existe', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(null);

    await expect(
      TurmaService.criar({
        nome: 'X',
        periodo: '2026/1',
        disciplina: 'Y',
        professorId: 999,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('TurmaService.excluir', () => {
  it('exclui turma sem sessões', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({
      id: 1,
      nome: 'X',
      periodo: 'p',
      disciplina: 'd',
      professorId: 5,
      _count: { sessoes: 0 },
    });

    await TurmaService.excluir(1);

    expect(prisma.turma.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('bloqueia exclusão de turma com sessões (preservar histórico)', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({
      id: 1,
      nome: 'X',
      periodo: 'p',
      disciplina: 'd',
      professorId: 5,
      _count: { sessoes: 3 },
    });

    await expect(TurmaService.excluir(1)).rejects.toBeInstanceOf(BusinessRuleError);
    expect(prisma.turma.delete).not.toHaveBeenCalled();
  });
});

describe('TurmaService.matricular', () => {
  it('matricula aluno em turma com sucesso', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({
      id: 1,
      nome: 'X',
      periodo: 'p',
      disciplina: 'd',
      professorId: 5,
    });
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(alunoFake);
    vi.mocked(prisma.matricula.findUnique).mockResolvedValue(null);

    const result = await TurmaService.matricular(1, 20);

    expect(result).toEqual({ alunoId: 20, turmaId: 1 });
    expect(prisma.matricula.create).toHaveBeenCalled();
  });

  it('rejeita matricular usuário que não é aluno', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({
      id: 1,
      nome: 'X',
      periodo: 'p',
      disciplina: 'd',
      professorId: 5,
    });
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({
      id: 30,
      tipo: 'P',
      status: 'A',
    });

    await expect(TurmaService.matricular(1, 30)).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('rejeita matrícula duplicada', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({
      id: 1,
      nome: 'X',
      periodo: 'p',
      disciplina: 'd',
      professorId: 5,
    });
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(alunoFake);
    vi.mocked(prisma.matricula.findUnique).mockResolvedValue({ alunoId: 20, turmaId: 1 });

    await expect(TurmaService.matricular(1, 20)).rejects.toBeInstanceOf(AppError);
    expect(prisma.matricula.create).not.toHaveBeenCalled();
  });
});
