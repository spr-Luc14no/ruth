import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password';
import { AppError, NotFoundError, BusinessRuleError } from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';

export interface CriarUsuarioInput {
  nome: string;
  email: string;
  login: string;
  senha: string;
  tipo: 'A' | 'P' | 'U';
  matricula?: string | null;
}

export interface AtualizarUsuarioInput {
  nome?: string;
  email?: string;
  login?: string;
  senha?: string;
  matricula?: string | null;
  status?: 'A' | 'B';
}

export interface ListarUsuariosInput {
  tipo?: 'A' | 'P' | 'U';
  status?: 'A' | 'B';
  busca?: string;
}

const projecaoUsuario = {
  id: true,
  nome: true,
  email: true,
  login: true,
  tipo: true,
  status: true,
  matricula: true,
  criadoEm: true,
} as const;

/**
 * Service de gerenciamento de Usuários (UC006).
 * Implementa:
 *  - Hashing bcrypt (sempre)
 *  - Validação de email/login únicos (RN do banco + checagem amigável)
 *  - Soft-delete via status='B' (preserva integridade referencial)
 *  - Auditoria de criar/atualizar/bloquear/reativar (RF12)
 */
export class UsuarioService {
  static async listar(input: ListarUsuariosInput = {}) {
    const where: Record<string, unknown> = {};
    if (input.tipo) where.tipo = input.tipo;
    if (input.status) where.status = input.status;
    if (input.busca) {
      where.OR = [
        { nome: { contains: input.busca } },
        { email: { contains: input.busca } },
        { login: { contains: input.busca } },
        { matricula: { contains: input.busca } },
      ];
    }

    return prisma.usuario.findMany({
      where,
      select: projecaoUsuario,
      orderBy: { criadoEm: 'desc' },
    });
  }

  static async buscarPorId(id: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: projecaoUsuario,
    });
    if (!usuario) throw new NotFoundError('Usuário');
    return usuario;
  }

  static async criar(input: CriarUsuarioInput, criadoPorId?: number) {
    // Aluno requer matrícula; Admin/Professor não.
    if (input.tipo === 'U' && !input.matricula) {
      throw new AppError('MATRICULA_OBRIGATORIA', 'Aluno precisa ter matrícula.', 400);
    }

    // Checagem amigável de duplicidade (UNIQUE no banco também bloqueia)
    const existe = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: input.email },
          { login: input.login },
          ...(input.matricula ? [{ matricula: input.matricula }] : []),
        ],
      },
      select: { id: true, email: true, login: true, matricula: true },
    });
    if (existe) {
      const conflito =
        existe.email === input.email
          ? 'e-mail'
          : existe.login === input.login
            ? 'login'
            : 'matrícula';
      throw new BusinessRuleError('UC006', `Já existe usuário com este ${conflito}.`);
    }

    const senhaHash = await hashPassword(input.senha);
    const criado = await prisma.usuario.create({
      data: {
        nome: input.nome,
        email: input.email,
        login: input.login,
        senha: senhaHash,
        tipo: input.tipo,
        matricula: input.matricula ?? null,
        status: 'A',
      },
      select: projecaoUsuario,
    });

    await AuditoriaService.registrar({
      usuarioId: criadoPorId,
      acao: 'USUARIO_CRIADO',
      entidade: 'Usuario',
      detalhes: `id=${criado.id} tipo=${criado.tipo}`,
    });
    return criado;
  }

  static async atualizar(id: number, input: AtualizarUsuarioInput, atualizadoPorId?: number) {
    const atual = await prisma.usuario.findUnique({ where: { id } });
    if (!atual) throw new NotFoundError('Usuário');

    if (input.email && input.email !== atual.email) {
      const dup = await prisma.usuario.findFirst({
        where: { email: input.email, NOT: { id } },
        select: { id: true },
      });
      if (dup) throw new BusinessRuleError('UC006', 'Já existe usuário com este e-mail.');
    }

    if (input.login && input.login !== atual.login) {
      const dup = await prisma.usuario.findFirst({
        where: { login: input.login, NOT: { id } },
        select: { id: true },
      });
      if (dup) throw new BusinessRuleError('UC006', 'Já existe usuário com este login.');
    }

    if (input.matricula && input.matricula !== atual.matricula) {
      const dup = await prisma.usuario.findFirst({
        where: { matricula: input.matricula, NOT: { id } },
        select: { id: true },
      });
      if (dup) throw new BusinessRuleError('UC006', 'Já existe usuário com esta matrícula.');
    }

    const data: Record<string, unknown> = {};
    if (input.nome !== undefined) data.nome = input.nome;
    if (input.email !== undefined) data.email = input.email;
    if (input.login !== undefined) data.login = input.login;
    if (input.matricula !== undefined) data.matricula = input.matricula;
    if (input.status !== undefined) data.status = input.status;
    if (input.senha) data.senha = await hashPassword(input.senha);

    const atualizado = await prisma.usuario.update({
      where: { id },
      data,
      select: projecaoUsuario,
    });

    await AuditoriaService.registrar({
      usuarioId: atualizadoPorId,
      acao: 'USUARIO_ATUALIZADO',
      entidade: 'Usuario',
      detalhes: `id=${id} campos=${Object.keys(data).join(',')}`,
    });
    return atualizado;
  }

  /**
   * Soft-delete: marca como Bloqueado. Preserva integridade referencial
   * (presenças, sessões, logs) e permite reativação.
   */
  static async bloquear(id: number, executadoPorId?: number) {
    const atual = await prisma.usuario.findUnique({ where: { id } });
    if (!atual) throw new NotFoundError('Usuário');

    // Admin não pode bloquear a si mesmo
    if (executadoPorId === id) {
      throw new BusinessRuleError('UC006', 'Você não pode bloquear sua própria conta.');
    }

    const bloqueado = await prisma.usuario.update({
      where: { id },
      data: { status: 'B' },
      select: projecaoUsuario,
    });
    await AuditoriaService.registrar({
      usuarioId: executadoPorId,
      acao: 'USUARIO_BLOQUEADO',
      entidade: 'Usuario',
      detalhes: `id=${id}`,
    });
    return bloqueado;
  }

  static async reativar(id: number, executadoPorId?: number) {
    const atual = await prisma.usuario.findUnique({ where: { id } });
    if (!atual) throw new NotFoundError('Usuário');

    const reativado = await prisma.usuario.update({
      where: { id },
      data: { status: 'A' },
      select: projecaoUsuario,
    });
    await AuditoriaService.registrar({
      usuarioId: executadoPorId,
      acao: 'USUARIO_REATIVADO',
      entidade: 'Usuario',
      detalhes: `id=${id}`,
    });
    return reativado;
  }
}
