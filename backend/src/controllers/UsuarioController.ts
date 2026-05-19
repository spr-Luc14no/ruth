import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { UsuarioService } from '../services/UsuarioService';
import { ok } from '../utils/apiResponse';

// =============== Schemas ===============

const tipoSchema = z.enum(['A', 'P', 'U']);
const statusSchema = z.enum(['A', 'B']);

export const listarUsuariosQuery = z.object({
  tipo: tipoSchema.optional(),
  status: statusSchema.optional(),
  busca: z.string().trim().max(100).optional(),
});

export const criarUsuarioSchema = z.object({
  nome: z.string().trim().min(2, 'Nome muito curto').max(100),
  email: z.string().trim().toLowerCase().email('E-mail inválido').max(100),
  login: z
    .string()
    .trim()
    .min(3, 'Login muito curto')
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, números, ponto, traço ou underline'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').max(255),
  tipo: tipoSchema,
  matricula: z.string().trim().max(50).optional().nullable(),
});

export const atualizarUsuarioSchema = z.object({
  nome: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().toLowerCase().email().max(100).optional(),
  login: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/)
    .optional(),
  senha: z.string().min(6).max(255).optional(),
  matricula: z.string().trim().max(50).nullable().optional(),
  status: statusSchema.optional(),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

// =============== Controller ===============

export class UsuarioController {
  static async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await UsuarioService.listar(req.query as z.infer<typeof listarUsuariosQuery>);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async buscar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const data = await UsuarioService.buscarPorId(id);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as z.infer<typeof criarUsuarioSchema>;
      const data = await UsuarioService.criar(input, req.user?.userId);
      ok(res, data, 201);
    } catch (err) {
      next(err);
    }
  }

  static async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const input = req.body as z.infer<typeof atualizarUsuarioSchema>;
      const data = await UsuarioService.atualizar(id, input, req.user?.userId);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async bloquear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const data = await UsuarioService.bloquear(id, req.user?.userId);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async reativar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const data = await UsuarioService.reativar(id, req.user?.userId);
      ok(res, data);
    } catch (err) {
      next(err);
    }
  }
}
