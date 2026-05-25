import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, FileText, FileSpreadsheet, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AdminShell } from '@/components/AdminShell';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  turmasApi,
  disciplinasApi,
  relatoriosApi,
  extractErrorMessage,
} from '@/services/api';
import type { RelatorioDisciplina } from '@/types';
import { cn } from '@/lib/cn';

function PageShell({ tipo, children }: { tipo: 'A' | 'P' | 'U' | undefined; children: ReactNode }) {
  if (tipo === 'A') return <AdminShell>{children}</AdminShell>;
  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-fg-secondary transition-colors hover:text-fg-primary"
        >
          <ArrowLeft size={14} />
          Voltar ao painel
        </Link>
        {children}
      </main>
    </div>
  );
}

interface OpcaoDisciplina {
  id: number;
  nome: string;
  turmaNome: string;
}

export default function Relatorios() {
  const { user } = useAuth();
  const tipo = user?.tipo;

  const [disciplinas, setDisciplinas] = useState<OpcaoDisciplina[]>([]);
  const [disciplinaId, setDisciplinaId] = useState<number | ''>('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [relatorio, setRelatorio] = useState<RelatorioDisciplina | null>(null);
  const [loading, setLoading] = useState(false);
  const [baixando, setBaixando] = useState<'csv' | 'pdf' | null>(null);

  // Carrega disciplinas conforme perfil
  useEffect(() => {
    async function carregar() {
      try {
        if (tipo === 'P') {
          const minhas = await disciplinasApi.minhas();
          setDisciplinas(
            minhas.map((d) => ({ id: d.id, nome: d.nome, turmaNome: d.turma.nome })),
          );
        } else if (tipo === 'A') {
          const turmas = await turmasApi.listar();
          const lista: OpcaoDisciplina[] = [];
          turmas.forEach((t) =>
            t.disciplinas.forEach((d) =>
              lista.push({ id: d.id, nome: d.nome, turmaNome: t.nome }),
            ),
          );
          setDisciplinas(lista);
        }
      } catch (err) {
        toast.error(extractErrorMessage(err));
      }
    }
    if (tipo) carregar();
  }, [tipo]);

  const filtro = {
    ...(dataInicio ? { dataInicio } : {}),
    ...(dataFim ? { dataFim } : {}),
  };

  async function gerar() {
    if (!disciplinaId) {
      toast.error('Escolha uma disciplina.');
      return;
    }
    setLoading(true);
    try {
      setRelatorio(await relatoriosApi.resumo(Number(disciplinaId), filtro));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function baixar(formato: 'csv' | 'pdf') {
    if (!disciplinaId) return;
    setBaixando(formato);
    try {
      if (formato === 'csv') await relatoriosApi.downloadCSV(Number(disciplinaId), filtro);
      else await relatoriosApi.downloadPDF(Number(disciplinaId), filtro);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBaixando(null);
    }
  }

  return (
    <PageShell tipo={tipo}>
      <header className="mb-8 animate-slide-up">
        <p className="section-number mb-3">relatórios</p>
        <h1 className="text-display-lg text-fg-primary">Presença por disciplina</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Consolida as sessões encerradas e marca aprovação por presença mínima.
        </p>
      </header>

      {/* Filtros */}
      <div className="card-vault mb-6 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Disciplina"
            marker="01"
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value ? Number(e.target.value) : '')}
            options={disciplinas.map((d) => ({ value: d.id, label: `${d.nome} · ${d.turmaNome}` }))}
            placeholder="Escolha uma disciplina"
          />
          <Input
            label="De"
            marker="02"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <Input
            label="Até"
            marker="03"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={gerar} loading={loading} disabled={!disciplinaId} className="w-full">
              <Search size={16} />
              Gerar
            </Button>
          </div>
        </div>
      </div>

      {/* Resultado */}
      {!relatorio ? (
        <EmptyState
          icon={BarChart3}
          title="Nenhum relatório gerado"
          description="Escolha uma disciplina e clique em Gerar para consolidar a presença."
        />
      ) : (
        <div className="animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="display text-2xl text-fg-primary">{relatorio.disciplina.nome}</h2>
              <p className="text-sm text-fg-muted">
                {relatorio.disciplina.turma.nome} · {relatorio.disciplina.turma.periodo} ·{' '}
                {relatorio.totalSessoesConsideradas} sessões · aprovação ≥{' '}
                {relatorio.presencaMinima}%
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => baixar('csv')}
                loading={baixando === 'csv'}
              >
                <FileSpreadsheet size={14} />
                CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => baixar('pdf')}
                loading={baixando === 'pdf'}
              >
                <FileText size={14} />
                PDF
              </Button>
            </div>
          </div>

          {relatorio.linhas.length === 0 ? (
            <div className="card-vault p-8 text-center text-sm text-fg-muted">
              Nenhum aluno matriculado nesta turma.
            </div>
          ) : (
            <Table
              data={relatorio.linhas}
              rowKey={(l) => l.alunoId}
              columns={[
                { header: 'Aluno', cell: (l) => <span className="font-medium text-fg-primary">{l.alunoNome}</span> },
                { header: 'Matrícula', cell: (l) => <span className="font-mono text-xs text-fg-muted">{l.matricula ?? '—'}</span> },
                {
                  header: 'Presenças',
                  align: 'center',
                  cell: (l) => `${l.presencasConfirmadas + l.presencasPendentes}/${l.totalSessoes}`,
                },
                { header: 'Faltas', align: 'center', cell: (l) => <span className="text-fg-secondary">{l.faltas}</span> },
                {
                  header: '%',
                  align: 'center',
                  cell: (l) => (
                    <span
                      className={cn(
                        'font-mono font-semibold',
                        l.percentualPresenca >= 75
                          ? 'text-success-400'
                          : l.percentualPresenca >= 50
                            ? 'text-warning-400'
                            : 'text-accent-400',
                      )}
                    >
                      {l.percentualPresenca}%
                    </span>
                  ),
                },
                {
                  header: 'Situação',
                  align: 'center',
                  cell: (l) => (
                    <Badge variant={l.aprovado ? 'success' : 'danger'}>
                      {l.aprovado ? 'Aprovado' : 'Reprovado'}
                    </Badge>
                  ),
                },
              ]}
            />
          )}
        </div>
      )}
    </PageShell>
  );
}
