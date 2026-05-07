import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { fail } from '../utils/apiResponse';

type Source = 'body' | 'query' | 'params';

/**
 * Valida o source da requisição contra um schema Zod.
 * Substitui req[source] pelo valor parseado/coercido.
 */
export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      fail(res, 400, 'VALIDATION_ERROR', 'Dados inválidos', result.error.flatten().fieldErrors);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[source] = result.data;
    next();
  };
}
