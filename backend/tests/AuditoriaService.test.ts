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
    auditoriaLog: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { AuditoriaService } from '../src/services/AuditoriaService';
import { prisma } from '../src/config/prisma';

beforeEach(() => vi.clearAllMocks());

describe('AuditoriaService.listar', () => {
  it('retorna paginação padrão (página 1, 50 itens)', async () => {
    vi.mocked(prisma.auditoriaLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditoriaLog.count).mockResolvedValue(0);

    const r = await AuditoriaService.listar();

    expect(r.pagina).toBe(1);
    expect(r.porPagina).toBe(50);
    expect(prisma.auditoriaLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 50 }),
    );
  });

  it('aplica filtro de ação contendo termo', async () => {
    vi.mocked(prisma.auditoriaLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditoriaLog.count).mockResolvedValue(0);

    await AuditoriaService.listar({ acao: 'LOGIN' });

    expect(prisma.auditoriaLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ acao: { contains: 'LOGIN' } }),
      }),
    );
  });

  it('calcula skip correto na página 3 com 20 por página', async () => {
    vi.mocked(prisma.auditoriaLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditoriaLog.count).mockResolvedValue(0);

    await AuditoriaService.listar({ pagina: 3, porPagina: 20 });

    expect(prisma.auditoriaLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 40, take: 20 }),
    );
  });

  it('cap máximo de 100 itens por página (mesmo se pedido for maior)', async () => {
    vi.mocked(prisma.auditoriaLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditoriaLog.count).mockResolvedValue(0);

    await AuditoriaService.listar({ porPagina: 500 });

    expect(prisma.auditoriaLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('totalPaginas calculado corretamente', async () => {
    vi.mocked(prisma.auditoriaLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditoriaLog.count).mockResolvedValue(247);

    const r = await AuditoriaService.listar({ porPagina: 50 });

    expect(r.total).toBe(247);
    expect(r.totalPaginas).toBe(5); // 247 / 50 = 4.94 → 5
  });
});
