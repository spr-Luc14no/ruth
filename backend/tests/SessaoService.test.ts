import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/config/env', () => ({ env: { JWT_SECRET: 'test-secret-32-chars-minimum-aaaaaaaaaa', JWT_EXPIRES_IN: '8h', BCRYPT_SALT_ROUNDS: 10, MAX_LOGIN_ATTEMPTS: 5, LOGIN_LOCKOUT_MINUTES: 15, NODE_ENV: 'test', PORT: 3001, DATABASE_URL: 'mysql://test', CORS_ORIGIN: 'http://localhost:5173' } }));
vi.mock('../src/sockets', () => ({ emitToSessao: vi.fn() }));
vi.mock('../src/config/prisma', () => ({ prisma: { disciplina: { findUnique: vi.fn() }, sessaoChamada: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() }, auditoriaLog: { create: vi.fn().mockResolvedValue({}) } } }));
import { SessaoService } from '../src/services/SessaoService';
import { prisma } from '../src/config/prisma';
import { BusinessRuleError, ForbiddenError } from '../src/utils/errors';
const disciplinaFake = { id: 1, professorId: 5, nome: 'Arquitetura', janelaPadraoMin: null };
const sessaoFake = { id: 100, disciplinaId: 1, professorId: 5, janelaMin: 10, status: 'ABERTA' as const, codigo: 'A2B3', dataAbertura: new Date(), dataEncerramento: null, disciplina: { id: 1, nome: 'Arquitetura', turma: { id: 1, nome: 'Eng', periodo: '2026/01' } } };
beforeEach(() => vi.clearAllMocks());

describe('SessaoService.criar', () => {
  it('cria sessao quando professor e dono e nao ha ativa', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue(disciplinaFake);
    vi.mocked(prisma.sessaoChamada.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.sessaoChamada.create).mockResolvedValue(sessaoFake);
    const result = await SessaoService.criar({ disciplinaId: 1, professorId: 5, janelaMin: 10 });
    expect(result.id).toBe(100);
    expect(prisma.auditoriaLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ acao: 'SESSAO_ABERTA' }) }));
  });
  it('bloqueia se professor nao e dono', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue({ ...disciplinaFake, professorId: 99 });
    await expect(SessaoService.criar({ disciplinaId: 1, professorId: 5 })).rejects.toBeInstanceOf(ForbiddenError);
    expect(prisma.sessaoChamada.create).not.toHaveBeenCalled();
  });
  it('bloqueia se ja existe sessao ativa', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue(disciplinaFake);
    vi.mocked(prisma.sessaoChamada.findFirst).mockResolvedValue({ id: 50, codigo: 'XYZA' });
    await expect(SessaoService.criar({ disciplinaId: 1, professorId: 5 })).rejects.toBeInstanceOf(BusinessRuleError);
  });
  it('aplica janela padrao 10 quando nao fornecida', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue(disciplinaFake);
    vi.mocked(prisma.sessaoChamada.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.sessaoChamada.create).mockResolvedValue(sessaoFake);
    await SessaoService.criar({ disciplinaId: 1, professorId: 5 });
    expect(prisma.sessaoChamada.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ janelaMin: 10 }) }));
  });
  it('usa janela da disciplina quando configurada', async () => {
    vi.mocked(prisma.disciplina.findUnique).mockResolvedValue({ ...disciplinaFake, janelaPadraoMin: 20 });
    vi.mocked(prisma.sessaoChamada.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.sessaoChamada.create).mockResolvedValue(sessaoFake);
    await SessaoService.criar({ disciplinaId: 1, professorId: 5 });
    expect(prisma.sessaoChamada.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ janelaMin: 20 }) }));
  });
});
describe('SessaoService.encerrar', () => {
  it('encerra sessao ativa', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({ id: 100, professorId: 5, status: 'ABERTA' });
    vi.mocked(prisma.sessaoChamada.update).mockResolvedValue({ ...sessaoFake, status: 'ENCERRADA' });
    const result = await SessaoService.encerrar(100, 5);
    expect(result.status).toBe('ENCERRADA');
  });
  it('bloqueia outro professor', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({ id: 100, professorId: 5, status: 'ABERTA' });
    await expect(SessaoService.encerrar(100, 99)).rejects.toBeInstanceOf(ForbiddenError);
  });
  it('bloqueia encerrar ja encerrada', async () => {
    vi.mocked(prisma.sessaoChamada.findUnique).mockResolvedValue({ id: 100, professorId: 5, status: 'ENCERRADA' });
    await expect(SessaoService.encerrar(100, 5)).rejects.toBeInstanceOf(BusinessRuleError);
  });
});
