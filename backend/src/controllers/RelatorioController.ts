import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { RelatorioService } from '../services/RelatorioService';
import { ok } from '../utils/apiResponse';

export const idParam = z.object({ id: z.coerce.number().int().positive() });
export const filtroQuery = z.object({ dataInicio: z.coerce.date().optional(), dataFim: z.coerce.date().optional() });

function nomeArquivo(rel: { disciplina: { nome: string } }, ext: string): string {
  const slug = rel.disciplina.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `relatorio-${slug}-${new Date().toISOString().slice(0, 10)}.${ext}`;
}

export class RelatorioController {
  static async resumo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { const { id } = req.params as unknown as z.infer<typeof idParam>; const filtro = req.query as unknown as z.infer<typeof filtroQuery>; ok(res, await RelatorioService.consolidarPorDisciplina(id, filtro, req.user!.userId, req.user!.tipo)); } catch (err) { next(err); }
  }
  static async csv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const filtro = req.query as unknown as z.infer<typeof filtroQuery>;
      const rel = await RelatorioService.consolidarPorDisciplina(id, filtro, req.user!.userId, req.user!.tipo);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo(rel, 'csv')}"`);
      res.send(RelatorioService.gerarCSV(rel));
    } catch (err) { next(err); }
  }
  static async pdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const filtro = req.query as unknown as z.infer<typeof filtroQuery>;
      const rel = await RelatorioService.consolidarPorDisciplina(id, filtro, req.user!.userId, req.user!.tipo);
      const pdf = await RelatorioService.gerarPDF(rel);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo(rel, 'pdf')}"`);
      res.send(pdf);
    } catch (err) { next(err); }
  }
}
