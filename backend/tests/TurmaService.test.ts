import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/config/env', () => ({ env: { JWT_SECRET: 'test-secret-32-chars-minimum-aaaaaaaaaa', JWT_EXPIRES_IN: '8h', BCRYPT_SALT_ROUNDS: 10, MAX_LOGIN_ATTEMPTS: 5, LOGIN_LOCKOUT_MINUTES: 15, NODE_ENV: 'test', PORT: 3001, DATABASE_URL: 'mysql://test', CORS_ORIGIN: 'http://localhost:5173' } }));
vi.mock('../src/config/prisma', () => ({ prisma: { usuario: { findUnique: vi.fn() }, turma: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() }, matricula: { findUnique: vi.fn(), create: vi.fn() }, auditoriaLog: { create: vi.fn().mockResolvedValue({}) } } }));
import { TurmaService } from '../src/services/TurmaService';
import { prisma } from '../src/config/prisma';
import { BusinessRuleError, NotFoundError, AppError } from '../src/utils/errors';
const alunoFake = { id: 20, tipo: 'U' as const, status: 'A' as const };
beforeEach(() => vi.clearAllMocks());

describe('TurmaService.criar', () => {
  it('cria turma (nome + periodo)', async () => {
    vi.mocked(prisma.turma.create).mockResolvedValue({ id: 1, nome: 'Eng Software', periodo: '2026/01' });
    const result = await TurmaService.criar({ nome: 'Eng Software', periodo: '2026/01' });
    expect(result.id).toBe(1);
    expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ acao: 'TURMA_CRIADA' }) }));
  });
});
describe('TurmaService.excluir', () => {
  it('exclui turma sem sessoes', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({ id: 1, nome: 'X', periodo: 'p', disciplinas: [{ _count: { sessoes: 0 } }, { _count: { sessoes: 0 } }] });
    await TurmaService.excluir(1);
    expect(prisma.turma.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
  it('bloqueia exclusao de turma com sessoes', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({ id: 1, nome: 'X', periodo: 'p', disciplinas: [{ _count: { sessoes: 2 } }, { _count: { sessoes: 1 } }] });
    await expect(TurmaService.excluir(1)).rejects.toBeInstanceOf(BusinessRuleError);
    expect(prisma.turma.delete).not.toHaveBeenCalled();
  });
  it('NotFound quando turma nao existe', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue(null);
    await expect(TurmaService.excluir(999)).rejects.toBeInstanceOf(NotFoundError);
  });
});
describe('TurmaService.matricular', () => {
  it('matricula aluno com sucesso', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({ id: 1, nome: 'X', periodo: 'p' });
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(alunoFake);
    vi.mocked(prisma.matricula.findUnique).mockResolvedValue(null);
    const result = await TurmaService.matricular(1, 20);
    expect(result).toEqual({ alunoId: 20, turmaId: 1 });
  });
  it('rejeita matricular nao-aluno', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({ id: 1, nome: 'X', periodo: 'p' });
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({ id: 30, tipo: 'P', status: 'A' });
    await expect(TurmaService.matricular(1, 30)).rejects.toBeInstanceOf(BusinessRuleError);
  });
  it('rejeita matricula duplicada', async () => {
    vi.mocked(prisma.turma.findUnique).mockResolvedValue({ id: 1, nome: 'X', periodo: 'p' });
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(alunoFake);
    vi.mocked(prisma.matricula.findUnique).mockResolvedValue({ alunoId: 20, turmaId: 1 });
    await expect(TurmaService.matricular(1, 20)).rejects.toBeInstanceOf(AppError);
  });
});
