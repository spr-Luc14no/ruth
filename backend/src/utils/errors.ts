/**
 * Erros customizados para regras de negócio.
 * Todo erro lançado em service deve ser uma dessas classes.
 */

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly status: number = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Credenciais inválidas') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(entidade: string) {
    super('NOT_FOUND', `${entidade} não encontrado(a)`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super('VALIDATION_ERROR', 'Dados inválidos', 400, details);
  }
}

export class BusinessRuleError extends AppError {
  /**
   * @param rnCode Código da regra (ex: 'RN06')
   * @param message Mensagem amigável
   */
  constructor(rnCode: string, message: string) {
    super(`${rnCode}_VIOLATION`, message, 422);
  }
}

export class AccountLockedError extends AppError {
  constructor() {
    super(
      'ACCOUNT_LOCKED',
      'Conta temporariamente bloqueada por excesso de tentativas. Tente novamente mais tarde.',
      423,
    );
  }
}
