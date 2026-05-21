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
    parametro: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditoriaLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

import { ParametroService } from '../src/services/ParametroService';
import { prisma } from '../src/config/prisma';
import { BusinessRuleError, NotFoundError } from '../src/utils/errors';

const paramMin = {
  id: 1,
  chave: 'tolerancia_atraso',
  descricao: 'Tolerância de atraso em minutos',
  valor: '5',
  tipo: 'MIN',
  ativo: true,
};

const paramP = {
  id: 2,
  chave: 'presenca_minima',
  descricao: 'Percentual mínimo de presença',
  valor: '75',
  tipo: 'P',
  ativo: true,
};

beforeEach(() => vi.clearAllMocks());

describe('ParametroService.listar', () => {
  it('retorna lista ordenada por chave', async () => {
    vi.mocked(prisma.parametro.findMany).mockResolvedValue([paramMin, paramP]);

    const lista = await ParametroService.listar();

    expect(lista).toHaveLength(2);
    expect(prisma.parametro.findMany).toHaveBeenCalledWith({
      orderBy: { chave: 'asc' },
    });
  });
});

describe('ParametroService.atualizar', () => {
  it('atualiza valor MIN dentro do range e registra auditoria', async () => {
    vi.mocked(prisma.parametro.findUnique).mockResolvedValue(paramMin);
    vi.mocked(prisma.parametro.update).mockResolvedValue({ ...paramMin, valor: '10' });

    const result = await ParametroService.atualizar(1, { valor: '10' }, 5);

    expect(result.valor).toBe('10');
    expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ acao: 'PARAMETRO_ATUALIZADO' }),
      }),
    );
  });

  it('rejeita MIN fora do range (0-360)', async () => {
    vi.mocked(prisma.parametro.findUnique).mockResolvedValue(paramMin);

    await expect(
      ParametroService.atualizar(1, { valor: '500' }, 5),
    ).rejects.toBeInstanceOf(BusinessRuleError);

    expect(prisma.parametro.update).not.toHaveBeenCalled();
  });

  it('rejeita P fora do range (0-100)', async () => {
    vi.mocked(prisma.parametro.findUnique).mockResolvedValue(paramP);

    await expect(
      ParametroService.atualizar(2, { valor: '150' }, 5),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('rejeita valor vazio', async () => {
    vi.mocked(prisma.parametro.findUnique).mockResolvedValue(paramMin);

    await expect(
      ParametroService.atualizar(1, { valor: '  ' }, 5),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('NotFound quando parâmetro não existe', async () => {
    vi.mocked(prisma.parametro.findUnique).mockResolvedValue(null);

    await expect(
      ParametroService.atualizar(999, { valor: '5' }, 5),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
