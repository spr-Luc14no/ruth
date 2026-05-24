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
  aprovado: boolean;
}

export interface RelatorioDisciplina {
  disciplina: {
    id: number;
    nome: string;
    turma: { id: number; nome: string; periodo: string };
    professor: { id: number; nome: string };
  };
  filtro: FiltroRelatorio;
  geradoEm: string;
  totalSessoesConsideradas: number;
  presencaMinima: number;
  linhas: LinhaRelatorio[];
}

export class RelatorioService {
  static async consolidarPorDisciplina(
    disciplinaId: number,
    filtro: FiltroRelatorio = {},
    solicitanteId: number,
    solicitanteTipo: 'A' | 'P' | 'U',
  ): Promise<RelatorioDisciplina> {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id: disciplinaId },
      select: {
        id: true,
        nome: true,
        turmaId: true,
        professorId: true,
        turma: { select: { id: true, nome: true, periodo: true } },
        professor: { select: { id: true, nome: true } },
      },
    });
    if (!disciplina) throw new NotFoundError('Disciplina');

    if (solicitanteTipo === 'P' && disciplina.professorId !== solicitanteId) {
      throw new ForbiddenError('Você só pode ver relatórios das suas disciplinas.');
    }
    if (solicitanteTipo === 'U') {
      throw new ForbiddenError('Alunos não acessam relatórios de disciplina.');
    }

    const sessoes = await prisma.sessaoChamada.findMany({
      where: {
        disciplinaId,
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

    const matriculas = await prisma.matricula.findMany({
      where: { turmaId: disciplina.turmaId },
      include: { aluno: { select: { id: true, nome: true, matricula: true } } },
      orderBy: { aluno: { nome: 'asc' } },
    });

    const presencas =
      sessaoIds.length === 0
        ? []
        : await prisma.presenca.findMany({
            where: {
              sessaoId: { in: sessaoIds },
              alunoId: { in: matriculas.map((m: { alunoId: number }) => m.alunoId) },
            },
            select: { alunoId: true, status: true, marcadoEm: true },
          });

    interface PorAluno {
      confirmadas: number;
      pendentes: number;
      ultima: Date | null;
    }
    const porAluno = new Map<number, PorAluno>();
    for (const p of presencas as Array<{ alunoId: number; status: string; marcadoEm: Date }>) {
      const atual = porAluno.get(p.alunoId) ?? { confirmadas: 0, pendentes: 0, ultima: null };
      if (p.status === 'CONFIRMADO') atual.confirmadas++;
      else if (p.status === 'PENDENTE') atual.pendentes++;
      if (!atual.ultima || p.marcadoEm > atual.ultima) atual.ultima = p.marcadoEm;
      porAluno.set(p.alunoId, atual);
    }

    const paramMinima = await prisma.parametro.findUnique({ where: { chave: 'presenca_minima' } });
    const presencaMinima = paramMinima ? Number(paramMinima.valor) : 75;

    const linhas: LinhaRelatorio[] = matriculas.map(
      (m: { aluno: { id: number; nome: string; matricula: string | null } }) => {
        const stats = porAluno.get(m.aluno.id) ?? { confirmadas: 0, pendentes: 0, ultima: null };
        const totalPresencas = stats.confirmadas + stats.pendentes;
        const faltas = Math.max(0, totalSessoes - totalPresencas);
        const percentual = totalSessoes > 0 ? Math.round((totalPresencas / totalSessoes) * 100) : 0;
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
          aprovado: totalSessoes > 0 && percentual >= presencaMinima,
        };
      },
    );

    return {
      disciplina: {
        id: disciplina.id,
        nome: disciplina.nome,
        turma: disciplina.turma,
        professor: disciplina.professor,
      },
      filtro,
      geradoEm: new Date().toISOString(),
      totalSessoesConsideradas: totalSessoes,
      presencaMinima,
      linhas,
    };
  }

  static gerarCSV(relatorio: RelatorioDisciplina): string {
    const escape = (v: string | number | null) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const linhas: string[] = [];
    linhas.push(`# Relatório de Presença — ${relatorio.disciplina.nome}`);
    linhas.push(`# Turma: ${relatorio.disciplina.turma.nome} (${relatorio.disciplina.turma.periodo}) | Professor: ${relatorio.disciplina.professor.nome}`);
    linhas.push(`# Sessões consideradas: ${relatorio.totalSessoesConsideradas}`);
    linhas.push(`# Presença mínima p/ aprovação: ${relatorio.presencaMinima}%`);
    linhas.push(`# Gerado em: ${new Date(relatorio.geradoEm).toLocaleString('pt-BR')}`);
    linhas.push('');
    linhas.push(
      ['Aluno', 'Matrícula', 'Total sessões', 'Presenças confirmadas', 'Presenças em tolerância', 'Faltas', '% de presença', 'Situação', 'Última presença']
        .map(escape).join(','),
    );
    for (const l of relatorio.linhas) {
      linhas.push(
        [l.alunoNome, l.matricula, l.totalSessoes, l.presencasConfirmadas, l.presencasPendentes, l.faltas, `${l.percentualPresenca}%`, l.aprovado ? 'Aprovado' : 'Reprovado', l.ultimaPresenca ? new Date(l.ultimaPresenca).toLocaleString('pt-BR') : '—']
          .map(escape).join(','),
      );
    }
    return '\uFEFF' + linhas.join('\r\n');
  }

  static async gerarPDF(relatorio: RelatorioDisciplina): Promise<Buffer> {
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    doc.rect(0, 0, doc.page.width, 90).fill('#0A0A0F');
    doc.fillColor('#E8E8FF').fontSize(22).text('RUTh — Relatório de Presença', 40, 30);
    doc.fillColor('#A8A8C0').fontSize(10).text(`Gerado em ${new Date(relatorio.geradoEm).toLocaleString('pt-BR')}`, 40, 60);
    doc.rect(0, 90, doc.page.width, 4).fill('#7F00FF');

    let y = 120;
    doc.fillColor('#1A1A2E').rect(40, y, doc.page.width - 80, 72).fill();
    doc.fillColor('#A8A8C0').fontSize(8).text('DISCIPLINA', 50, y + 10);
    doc.fillColor('#E8E8FF').fontSize(14).text(relatorio.disciplina.nome, 50, y + 22);
    doc.fillColor('#A8A8C0').fontSize(9).text(`${relatorio.disciplina.turma.nome} · ${relatorio.disciplina.turma.periodo} · prof. ${relatorio.disciplina.professor.nome}`, 50, y + 42);
    doc.fillColor('#6E6E80').fontSize(8).text(`${relatorio.totalSessoesConsideradas} sessoes · aprovacao >= ${relatorio.presencaMinima}%`, 50, y + 56);
    y += 92;

    doc.fillColor('#6E6E80').fontSize(8);
    const cols = { aluno: 50, mat: 230, conf: 320, falt: 370, pct: 415, sit: 470 };
    doc.text('ALUNO', cols.aluno, y);
    doc.text('MATRICULA', cols.mat, y);
    doc.text('PRES', cols.conf, y);
    doc.text('FALT', cols.falt, y);
    doc.text('%', cols.pct, y);
    doc.text('SITUACAO', cols.sit, y);
    y += 14;
    doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor('#2A2A3E').stroke();
    y += 8;

    doc.fontSize(9);
    for (const l of relatorio.linhas) {
      if (y > doc.page.height - 60) { doc.addPage(); y = 50; }
      doc.fillColor('#E8E8FF').text(l.alunoNome.substring(0, 32), cols.aluno, y);
      doc.fillColor('#A8A8C0').text(l.matricula ?? '—', cols.mat, y);
      doc.fillColor('#E8E8FF').text(String(l.presencasConfirmadas + l.presencasPendentes), cols.conf, y);
      doc.fillColor('#E8E8FF').text(String(l.faltas), cols.falt, y);
      const pctColor = l.percentualPresenca >= 75 ? '#34D399' : l.percentualPresenca >= 50 ? '#FBBF24' : '#FF2400';
      doc.fillColor(pctColor).text(`${l.percentualPresenca}%`, cols.pct, y);
      doc.fillColor(l.aprovado ? '#34D399' : '#FF2400').text(l.aprovado ? 'Aprovado' : 'Reprovado', cols.sit, y);
      y += 14;
    }

    doc.fontSize(8).fillColor('#6E6E80').text('RUTh · Sistema de Chamada Interativa · documento gerado automaticamente', 40, doc.page.height - 30);
    doc.end();
    return done;
  }
}
