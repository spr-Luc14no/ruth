import { prisma } from '../config/prisma';
import { NotFoundError, BusinessRuleError } from '../utils/errors';
import { AuditoriaService } from './AuditoriaService';

export interface AtualizarParametroInput {
  valor: string;
  ativo?: boolean;
}

export class ParametroService {
  /**
   * Lista todos os parâmetros do sistema, ordenados por chave.
   */
  static async listar() {
    return prisma.parametro.findMany({
      orderBy: { chave: 'asc' },
    });
  }

  /**
   * Busca um parâmetro pela chave.
   */
  static async buscarPorChave(chave: string) {
    const param = await prisma.parametro.findUnique({ where: { chave } });
    if (!param) throw new NotFoundError('Parâmetro');
    return param;
  }

  /**
   * Atualiza valor e/ou estado ativo do parâmetro.
   * - Valida formato pelo `tipo` declarado
   * - Registra auditoria com valor anterior e novo
   */
  static async atualizar(
    id: number,
    input: AtualizarParametroInput,
    usuarioId: number,
  ) {
    const atual = await prisma.parametro.findUnique({ where: { id } });
    if (!atual) throw new NotFoundError('Parâmetro');

    // Validação por tipo
    if (input.valor !== undefined) {
      validarValor(atual.tipo, input.valor);
    }

    const novo = await prisma.parametro.update({
      where: { id },
      data: {
        ...(input.valor !== undefined ? { valor: input.valor } : {}),
        ...(input.ativo !== undefined ? { ativo: input.ativo } : {}),
      },
    });

    await AuditoriaService.registrar({
      usuarioId,
      acao: 'PARAMETRO_ATUALIZADO',
      entidade: 'Parametro',
      detalhes: `chave=${atual.chave} antes=[valor=${atual.valor},ativo=${atual.ativo}] depois=[valor=${novo.valor},ativo=${novo.ativo}]`,
    });

    return novo;
  }
}

/**
 * Valida o formato do valor baseado no tipo declarado.
 * - MIN: minutos, número inteiro positivo (até 360)
 * - P: percentual, 0-100
 * - INT: inteiro não-negativo
 * - STR: qualquer string até 50 chars
 */
function validarValor(tipo: string, valor: string): void {
  const trim = valor.trim();
  if (!trim) {
    throw new BusinessRuleError('PARAMETRO', 'Valor não pode ser vazio.');
  }
  switch (tipo) {
    case 'MIN': {
      const n = Number(trim);
      if (!Number.isInteger(n) || n < 0 || n > 360) {
        throw new BusinessRuleError(
          'PARAMETRO',
          'Valor deve ser um número inteiro de minutos entre 0 e 360.',
        );
      }
      break;
    }
    case 'P': {
      const n = Number(trim);
      if (Number.isNaN(n) || n < 0 || n > 100) {
        throw new BusinessRuleError(
          'PARAMETRO',
          'Valor deve ser um percentual entre 0 e 100.',
        );
      }
      break;
    }
    case 'INT': {
      const n = Number(trim);
      if (!Number.isInteger(n) || n < 0) {
        throw new BusinessRuleError('PARAMETRO', 'Valor deve ser inteiro não-negativo.');
      }
      break;
    }
    case 'STR': {
      if (trim.length > 50) {
        throw new BusinessRuleError('PARAMETRO', 'Texto muito longo (máx 50 chars).');
      }
      break;
    }
    default:
      // Tipos desconhecidos passam (compatibilidade futura)
      break;
  }
}
