import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { RelatorioService } from '../services/RelatorioService';
import { ok } from '../utils/apiResponse';

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const filtroQuery = z.object({
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
});

export class RelatorioController {
  static async resumo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const filtro = req.query as unknown as z.infer<typeof filtroQuery>;
      const relatorio = await RelatorioService.consolidarPorTurma(
        id,
        filtro,
        req.user!.userId,
        req.user!.tipo,
      );
      ok(res, relatorio);
    } catch (err) {
      next(err);
    }
  }

  static async csv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const filtro = req.query as unknown as z.infer<typeof filtroQuery>;
      const relatorio = await RelatorioService.consolidarPorTurma(
        id,
        filtro,
        req.user!.userId,
        req.user!.tipo,
      );
      const csv = RelatorioService.gerarCSV(relatorio);
      const nomeArquivo = `relatorio-${relatorio.turma.nome
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}-${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }

  static async pdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as z.infer<typeof idParam>;
      const filtro = req.query as unknown as z.infer<typeof filtroQuery>;
      const relatorio = await RelatorioService.consolidarPorTurma(
        id,
        filtro,
        req.user!.userId,
        req.user!.tipo,
      );
      const pdf = await RelatorioService.gerarPDF(relatorio);
      const nomeArquivo = `relatorio-${relatorio.turma.nome
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}-${new Date().toISOString().slice(0, 10)}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
      res.send(pdf);
    } catch (err) {
      next(err);
    }
  }
}
