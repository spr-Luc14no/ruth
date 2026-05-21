import { prisma } from '../config/prisma';

interface LogParams {
  usuarioId?: number | null;
  acao: string;
  entidade: string;
  detalhes?: string;
  ip?: string;
}

export interface FiltroAuditoria {
  acao?: string;
  entidade?: string;
  usuarioId?: number;
  dataInicio?: Date;
  dataFim?: Date;
  /** Página (1-indexed). Padrão 1. */
  pagina?: number;
  /** Tamanho da página. Padrão 50, máximo 100. */
  porPagina?: number;
}

/**
 * Service de auditoria. Aplicado em pontos sensíveis:
 * - Login bem-sucedido (RN08)
 * - Tentativa de login falha (RN08)
 * - Abertura/encerramento de sessão (RF12)
 * - Operações de admin (RF12)
 * - Alterações de parâmetro (PR6)
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

  /**
   * Lista logs de auditoria com paginação e filtros.
   * Retorna `total` (count) pra montar paginação no frontend.
   */
  static async listar(filtro: FiltroAuditoria = {}) {
    const pagina = filtro.pagina && filtro.pagina > 0 ? filtro.pagina : 1;
    const porPagina = Math.min(filtro.porPagina && filtro.porPagina > 0 ? filtro.porPagina : 50, 100);

    const where = {
      ...(filtro.acao ? { acao: { contains: filtro.acao } } : {}),
      ...(filtro.entidade ? { entidade: filtro.entidade } : {}),
      ...(filtro.usuarioId ? { usuarioId: filtro.usuarioId } : {}),
      ...(filtro.dataInicio || filtro.dataFim
        ? {
            dataEvento: {
              ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
              ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditoriaLog.findMany({
        where,
        include: {
          usuario: { select: { id: true, nome: true, login: true } },
        },
        orderBy: { dataEvento: 'desc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.auditoriaLog.count({ where }),
    ]);

    return {
      logs,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.ceil(total / porPagina),
    };
  }
}
