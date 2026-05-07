import { prisma } from '../config/prisma';

interface LogParams {
  usuarioId?: number | null;
  acao: string;
  entidade: string;
  detalhes?: string;
  ip?: string;
}

/**
 * Service de auditoria. Aplicado em pontos sensíveis:
 * - Login bem-sucedido (RN08)
 * - Tentativa de login falha (RN08)
 * - Abertura/encerramento de sessão (RF12)
 * - Operações de admin (RF12)
 */
export class AuditoriaService {
  static async registrar(params: LogParams): Promise<void> {
    try {
      await prisma.auditoriaLog.create({
        data: {
          usuarioId: params.usuarioId ?? null,
          acao: params.acao,
          entidade: params.entidade,
          detalhes: params.detalhes ?? null,
          ip: params.ip ?? null,
        },
      });
    } catch (e) {
      // Auditoria nunca pode quebrar a feature principal
      console.error('[AuditoriaService] falha ao registrar log:', e);
    }
  }
}
