import { prisma } from '../config/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export interface FiltroRelatorio {
  dataInicio?: Date;
  dataFim?: Date;
}

export interface LinhaRelatorio {
  alunoId: number;
  alunoNome: string;
  matricula: string | null;
  totalSessoes: number;
  presencasConfirmadas: number;
  presencasPendentes: number;
  faltas: number;
  percentualPresenca: number;
  ultimaPresenca: string | null;
}

export interface RelatorioTurma {
  turma: {
    id: number;
    nome: string;
    disciplina: string;
    periodo: string;
  };
  filtro: FiltroRelatorio;
  geradoEm: string;
  totalSessoesConsideradas: number;
  linhas: LinhaRelatorio[];
}

export class RelatorioService {
  /**
   * Consolida a presença por aluno da turma no período informado.
   *
   * - Considera todas as sessões ENCERRADAS da turma no período
   * - Conta presenças por aluno (CONFIRMADO + PENDENTE)
   * - Calcula faltas como (total sessões - presenças do aluno)
   * - Calcula % de presença
   */
  static async consolidarPorTurma(
    turmaId: number,
    filtro: FiltroRelatorio = {},
    solicitanteId: number,
    solicitanteTipo: 'A' | 'P' | 'U',
  ): Promise<RelatorioTurma> {
    const turma = await prisma.turma.findUnique({
      where: { id: turmaId },
      select: {
        id: true,
        nome: true,
        disciplina: true,
        periodo: true,
        professorId: true,
      },
    });
    if (!turma) throw new NotFoundError('Turma');

    // Professor só vê relatório de turma própria; admin vê todas
    if (solicitanteTipo === 'P' && turma.professorId !== solicitanteId) {
      throw new ForbiddenError('Você só pode ver relatórios das suas turmas.');
    }
    if (solicitanteTipo === 'U') {
      throw new ForbiddenError('Alunos não acessam relatórios de turma.');
    }

    // Sessões ENCERRADAS da turma no período
    const sessoes = await prisma.sessaoChamada.findMany({
      where: {
        turmaId,
        status: 'ENCERRADA',
        ...(filtro.dataInicio || filtro.dataFim
          ? {
              dataAbertura: {
                ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
                ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
              },
            }
          : {}),
      },
      select: { id: true },
    });
    const totalSessoes = sessoes.length;
    const sessaoIds = sessoes.map((s: { id: number }) => s.id);

    // Alunos matriculados
    const matriculas = await prisma.matricula.findMany({
      where: { turmaId },
      include: {
        aluno: {
          select: { id: true, nome: true, matricula: true },
        },
      },
      orderBy: { aluno: { nome: 'asc' } },
    });

    // Presenças desses alunos nessas sessões
    const presencas =
      sessaoIds.length === 0
        ? []
        : await prisma.presenca.findMany({
            where: {
              sessaoId: { in: sessaoIds },
              alunoId: { in: matriculas.map((m: { alunoId: number }) => m.alunoId) },
            },
            select: {
              alunoId: true,
              status: true,
              marcadoEm: true,
            },
          });

    // Agrupa por aluno
    interface PorAluno {
      confirmadas: number;
      pendentes: number;
      ultima: Date | null;
    }
    const porAluno = new Map<number, PorAluno>();
    for (const p of presencas as Array<{
      alunoId: number;
      status: string;
      marcadoEm: Date;
    }>) {
      const atual = porAluno.get(p.alunoId) ?? { confirmadas: 0, pendentes: 0, ultima: null };
      if (p.status === 'CONFIRMADO') atual.confirmadas++;
      else if (p.status === 'PENDENTE') atual.pendentes++;
      if (!atual.ultima || p.marcadoEm > atual.ultima) atual.ultima = p.marcadoEm;
      porAluno.set(p.alunoId, atual);
    }

    const linhas: LinhaRelatorio[] = matriculas.map(
      (m: {
        aluno: { id: number; nome: string; matricula: string | null };
      }) => {
        const stats = porAluno.get(m.aluno.id) ?? { confirmadas: 0, pendentes: 0, ultima: null };
        const totalPresencas = stats.confirmadas + stats.pendentes;
        const faltas = Math.max(0, totalSessoes - totalPresencas);
        const percentual =
          totalSessoes > 0 ? Math.round((totalPresencas / totalSessoes) * 100) : 0;

        return {
          alunoId: m.aluno.id,
          alunoNome: m.aluno.nome,
          matricula: m.aluno.matricula,
          totalSessoes,
          presencasConfirmadas: stats.confirmadas,
          presencasPendentes: stats.pendentes,
          faltas,
          percentualPresenca: percentual,
          ultimaPresenca: stats.ultima ? stats.ultima.toISOString() : null,
        };
      },
    );

    return {
      turma: {
        id: turma.id,
        nome: turma.nome,
        disciplina: turma.disciplina,
        periodo: turma.periodo,
      },
      filtro,
      geradoEm: new Date().toISOString(),
      totalSessoesConsideradas: totalSessoes,
      linhas,
    };
  }

  /**
   * Gera string CSV (RFC 4180) a partir do relatório consolidado.
   * Codificação UTF-8 com BOM pra abrir bonito no Excel.
   */
  static gerarCSV(relatorio: RelatorioTurma): string {
    const escape = (v: string | number | null) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const linhas: string[] = [];
    linhas.push(`# Relatório de Presença — ${relatorio.turma.nome}`);
    linhas.push(`# Disciplina: ${relatorio.turma.disciplina} | Período: ${relatorio.turma.periodo}`);
    linhas.push(`# Sessões consideradas: ${relatorio.totalSessoesConsideradas}`);
    linhas.push(`# Gerado em: ${new Date(relatorio.geradoEm).toLocaleString('pt-BR')}`);
    linhas.push('');
    linhas.push(
      [
        'Aluno',
        'Matrícula',
        'Total sessões',
        'Presenças confirmadas',
        'Presenças em tolerância',
        'Faltas',
        '% de presença',
        'Última presença',
      ]
        .map(escape)
        .join(','),
    );

    for (const l of relatorio.linhas) {
      linhas.push(
        [
          l.alunoNome,
          l.matricula,
          l.totalSessoes,
          l.presencasConfirmadas,
          l.presencasPendentes,
          l.faltas,
          `${l.percentualPresenca}%`,
          l.ultimaPresenca ? new Date(l.ultimaPresenca).toLocaleString('pt-BR') : '—',
        ]
          .map(escape)
          .join(','),
      );
    }

    // BOM pra Excel reconhecer UTF-8
    return '\uFEFF' + linhas.join('\r\n');
  }

  /**
   * Gera Buffer de PDF estilo VAULT — header escuro com gradient, tabela limpa.
   */
  static async gerarPDF(relatorio: RelatorioTurma): Promise<Buffer> {
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // ============ Header ============
    doc.rect(0, 0, doc.page.width, 90).fill('#0A0A0F');
    doc.fillColor('#E8E8FF').fontSize(22).text('RUTh — Relatório de Presença', 40, 30);
    doc
      .fillColor('#A8A8C0')
      .fontSize(10)
      .text(`Gerado em ${new Date(relatorio.geradoEm).toLocaleString('pt-BR')}`, 40, 60);

    // ============ Faixa violeta sob o header ============
    doc.rect(0, 90, doc.page.width, 4).fill('#7F00FF');

    // ============ Bloco de info da turma ============
    let y = 120;
    doc.fillColor('#1A1A2E').rect(40, y, doc.page.width - 80, 60).fill();
    doc.fillColor('#A8A8C0').fontSize(8).text('TURMA', 50, y + 10);
    doc.fillColor('#E8E8FF').fontSize(14).text(relatorio.turma.nome, 50, y + 22);
    doc
      .fillColor('#A8A8C0')
      .fontSize(9)
      .text(
        `${relatorio.turma.disciplina}  ·  período ${relatorio.turma.periodo}  ·  ${relatorio.totalSessoesConsideradas} sessões`,
        50,
        y + 42,
      );

    y += 80;

    // ============ Cabeçalho da tabela ============
    doc.fillColor('#6E6E80').fontSize(8);
    const cols = {
      aluno: 50,
      matricula: 260,
      conf: 340,
      pend: 390,
      falt: 440,
      pct: 480,
    };
    doc.text('ALUNO', cols.aluno, y);
    doc.text('MATRÍCULA', cols.matricula, y);
    doc.text('CONF', cols.conf, y);
    doc.text('PEND', cols.pend, y);
    doc.text('FALT', cols.falt, y);
    doc.text('% PRES', cols.pct, y);

    y += 14;
    doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor('#2A2A3E').stroke();
    y += 8;

    // ============ Linhas ============
    doc.fontSize(9);
    for (const l of relatorio.linhas) {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 50;
      }
      doc.fillColor('#E8E8FF').text(l.alunoNome.substring(0, 35), cols.aluno, y);
      doc.fillColor('#A8A8C0').text(l.matricula ?? '—', cols.matricula, y);
      doc.fillColor('#E8E8FF').text(String(l.presencasConfirmadas), cols.conf, y);
      doc.fillColor('#E8E8FF').text(String(l.presencasPendentes), cols.pend, y);
      doc.fillColor('#E8E8FF').text(String(l.faltas), cols.falt, y);

      // % com cor por faixa
      const pctColor =
        l.percentualPresenca >= 75 ? '#34D399' : l.percentualPresenca >= 50 ? '#FBBF24' : '#FF2400';
      doc.fillColor(pctColor).text(`${l.percentualPresenca}%`, cols.pct, y);

      y += 14;
    }

    // ============ Footer ============
    doc.fontSize(8).fillColor('#6E6E80');
    doc.text(
      'RUTh · Sistema de Chamada Interativa · documento gerado automaticamente',
      40,
      doc.page.height - 30,
    );

    doc.end();
    return done;
  }
}
