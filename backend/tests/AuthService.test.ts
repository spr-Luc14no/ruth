/**
 * Testes do AuthService.
 * Cobre regras de negócio: RN05 (RBAC via tipo no token), RN08 (auditoria de falhas).
 *
 * Estratégia: mockar `prisma` e `password` para testar lógica em isolamento,
 * sem necessidade de banco real (CI fica rápido).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ====== MOCKS (devem vir antes dos imports do que usa) ======

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
      update: vi.fn(),
    },
    auditoriaLog: {
      create: vi.fn().mockResolvedValue({}),
      count: vi.fn(),
    },
  },
}));

vi.mock('../src/utils/password', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

// ====== IMPORTS DEPOIS DOS MOCKS ======

import { AuthService } from '../src/services/AuthService';
import { prisma } from '../src/config/prisma';
import { verifyPassword } from '../src/utils/password';
import { AccountLockedError, UnauthorizedError } from '../src/utils/errors';

// ====== HELPERS ======

const usuarioFake = {
  id: 1,
  nome: 'Admin Teste',
  email: 'admin@ruth.local',
  login: 'admin',
  senha: '$2a$10$hashfakeparatestes',
  tipo: 'A' as const,
  status: 'A' as const,
  matricula: null,
  criadoEm: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});

// ====== TESTES ======

describe('AuthService.login', () => {
  describe('caminho feliz', () => {
    it('retorna token e usuário quando credenciais são válidas', async () => {
      vi.mocked(prisma.usuario.findFirst).mockResolvedValue(usuarioFake);
      vi.mocked(verifyPassword).mockResolvedValue(true);

      const result = await AuthService.login({
        login: 'admin',
        senha: 'admin123',
      });

      expect(result.token).toBeTruthy();
      expect(typeof result.token).toBe('string');
      expect(result.usuario).toEqual({
        id: 1,
        nome: 'Admin Teste',
        email: 'admin@ruth.local',
        login: 'admin',
        tipo: 'A',
      });
      // Auditoria de sucesso registrada
      expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ acao: 'LOGIN_SUCESSO' }),
        }),
      );
    });

    it('aceita login por email além de login textual', async () => {
      vi.mocked(prisma.usuario.findFirst).mockResolvedValue(usuarioFake);
      vi.mocked(verifyPassword).mockResolvedValue(true);

      await AuthService.login({ login: 'admin@ruth.local', senha: 'admin123' });

      expect(prisma.usuario.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ login: 'admin@ruth.local' }, { email: 'admin@ruth.local' }],
          }),
        }),
      );
    });
  });

  describe('caminhos negativos', () => {
    it('lança UnauthorizedError quando usuário não existe (RN08: auditoria registrada)', async () => {
      vi.mocked(prisma.usuario.findFirst).mockResolvedValue(null);

      await expect(
        AuthService.login({ login: 'inexistente', senha: 'qualquer' }),
      ).rejects.toBeInstanceOf(UnauthorizedError);

      expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ acao: 'LOGIN_FALHA' }),
        }),
      );
    });

    it('lança UnauthorizedError quando senha está incorreta', async () => {
      vi.mocked(prisma.usuario.findFirst).mockResolvedValue(usuarioFake);
      vi.mocked(verifyPassword).mockResolvedValue(false);
      vi.mocked(prisma.auditoriaLog.count).mockResolvedValue(1);

      await expect(
        AuthService.login({ login: 'admin', senha: 'errada' }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('lança AccountLockedError quando conta já está bloqueada (status=B)', async () => {
      vi.mocked(prisma.usuario.findFirst).mockResolvedValue({
        ...usuarioFake,
        status: 'B',
      });

      await expect(
        AuthService.login({ login: 'admin', senha: 'admin123' }),
      ).rejects.toBeInstanceOf(AccountLockedError);
    });

    it('bloqueia conta após MAX_LOGIN_ATTEMPTS falhas recentes', async () => {
      vi.mocked(prisma.usuario.findFirst).mockResolvedValue(usuarioFake);
      vi.mocked(verifyPassword).mockResolvedValue(false);
      // 5 falhas anteriores → essa será a 6ª, vai estourar o limite
      vi.mocked(prisma.auditoriaLog.count).mockResolvedValue(5);

      await expect(
        AuthService.login({ login: 'admin', senha: 'errada' }),
      ).rejects.toBeInstanceOf(AccountLockedError);

      expect(prisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { status: 'B' },
        }),
      );
    });
  });
});
