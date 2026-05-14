import { beforeEach, describe, expect, it, vi } from 'vitest';

// ====== MOCKS (antes dos imports do SUT) ======

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
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditoriaLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('../src/utils/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('$2a$10$fake-hash'),
  verifyPassword: vi.fn(),
}));

import { UsuarioService } from '../src/services/UsuarioService';
import { prisma } from '../src/config/prisma';
import { BusinessRuleError, AppError, NotFoundError } from '../src/utils/errors';

const usuarioFake = {
  id: 10,
  nome: 'João Professor',
  email: 'joao@ruth.local',
  login: 'joao.prof',
  senha: '$2a$10$existing-hash',
  tipo: 'P' as const,
  status: 'A' as const,
  matricula: null,
  criadoEm: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UsuarioService.criar', () => {
  it('cria professor com sucesso quando dados são válidos', async () => {
    vi.mocked(prisma.usuario.findFirst).mockResolvedValue(null); // sem duplicata
    vi.mocked(prisma.usuario.create).mockResolvedValue({ ...usuarioFake, id: 99 });

    const result = await UsuarioService.criar({
      nome: 'Novo Prof',
      email: 'novo@ruth.local',
      login: 'novo.prof',
      senha: 'senha123',
      tipo: 'P',
    });

    expect(result.id).toBe(99);
    expect(prisma.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          senha: '$2a$10$fake-hash', // bcrypt foi chamado
          tipo: 'P',
          status: 'A',
        }),
      }),
    );
    expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acao: 'USUARIO_CRIADO' }) }),
    );
  });

  it('rejeita criar aluno sem matrícula', async () => {
    await expect(
      UsuarioService.criar({
        nome: 'Aluno Sem Mat',
        email: 'a@ruth.local',
        login: 'a',
        senha: 'senha123',
        tipo: 'U',
      }),
    ).rejects.toBeInstanceOf(AppError);

    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  it('rejeita criar com e-mail duplicado', async () => {
    vi.mocked(prisma.usuario.findFirst).mockResolvedValue({
      id: 1,
      email: 'dup@ruth.local',
      login: 'outro',
      matricula: null,
    });

    await expect(
      UsuarioService.criar({
        nome: 'Dup',
        email: 'dup@ruth.local',
        login: 'novo',
        senha: 'senha123',
        tipo: 'P',
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });
});

describe('UsuarioService.bloquear', () => {
  it('bloqueia usuário existente com sucesso', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(usuarioFake);
    vi.mocked(prisma.usuario.update).mockResolvedValue({ ...usuarioFake, status: 'B' });

    const result = await UsuarioService.bloquear(10, 1);

    expect(result.status).toBe('B');
    expect(prisma.usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 10 }, data: { status: 'B' } }),
    );
  });

  it('impede admin de bloquear a si mesmo', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(usuarioFake);

    await expect(UsuarioService.bloquear(10, 10)).rejects.toBeInstanceOf(BusinessRuleError);

    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  it('lança NotFoundError se usuário não existe', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(null);

    await expect(UsuarioService.bloquear(999)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('UsuarioService.atualizar', () => {
  it('aplica nova senha com hash bcrypt quando senha é alterada', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(usuarioFake);
    vi.mocked(prisma.usuario.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.usuario.update).mockResolvedValue(usuarioFake);

    await UsuarioService.atualizar(10, { senha: 'nova-senha' });

    expect(prisma.usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ senha: '$2a$10$fake-hash' }),
      }),
    );
  });
});
