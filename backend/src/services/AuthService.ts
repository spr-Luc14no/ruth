import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { verifyPassword } from '../utils/password';
import { AccountLockedError, UnauthorizedError } from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';
import { env } from '../config/env';

interface LoginInput {
  login: string;
  senha: string;
  ip?: string;
}

interface LoginResult {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    login: string;
    tipo: 'A' | 'P' | 'U';
  };
}

/**
 * Service de autenticação.
 * Implementa:
 *  - RN05 (RBAC): emite token com tipo do usuário
 *  - RN08: registra tentativas negadas em auditoria
 *  - Bloqueio temporário após N tentativas falhas (módulo de acesso, doc seção 1.10)
 */
export class AuthService {
  static async login(input: LoginInput): Promise<LoginResult> {
    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [{ login: input.login }, { email: input.login }],
      },
    });

    if (!usuario) {
      await AuditoriaService.registrar({
        acao: 'LOGIN_FALHA',
        entidade: 'Usuario',
        detalhes: `login não encontrado: ${input.login}`,
        ip: input.ip,
      });
      throw new UnauthorizedError();
    }

    if (usuario.status === 'B') {
      await AuditoriaService.registrar({
        usuarioId: usuario.id,
        acao: 'LOGIN_BLOQUEADO',
        entidade: 'Usuario',
        ip: input.ip,
      });
      throw new AccountLockedError();
    }

    const senhaOk = await verifyPassword(input.senha, usuario.senha);

    if (!senhaOk) {
      await AuditoriaService.registrar({
        usuarioId: usuario.id,
        acao: 'LOGIN_FALHA',
        entidade: 'Usuario',
        detalhes: 'senha incorreta',
        ip: input.ip,
      });

      // Bloqueio após N falhas — checa últimas tentativas
      const desde = new Date(Date.now() - env.LOGIN_LOCKOUT_MINUTES * 60_000);
      const falhasRecentes = await prisma.auditoriaLog.count({
        where: {
          usuarioId: usuario.id,
          acao: 'LOGIN_FALHA',
          dataEvento: { gte: desde },
        },
      });

      if (falhasRecentes >= env.MAX_LOGIN_ATTEMPTS) {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { status: 'B' },
        });
        throw new AccountLockedError();
      }

      throw new UnauthorizedError();
    }

    // Login bem-sucedido
    const token = signToken({
      userId: usuario.id,
      tipo: usuario.tipo,
      login: usuario.login,
    });

    await AuditoriaService.registrar({
      usuarioId: usuario.id,
      acao: 'LOGIN_SUCESSO',
      entidade: 'Usuario',
      ip: input.ip,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        login: usuario.login,
        tipo: usuario.tipo,
      },
    };
  }
}
