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
import { turmasApi, relatoriosApi, extractErrorMessage } from '@/services/api';
import type { RelatorioTurma, TurmaResumo } from '@/types';
import { cn } from '@/lib/cn';

/**
 * Wrapper que escolhe o shell conforme o perfil:
 * - Admin vê com sidebar de admin
 * - Professor vê com só DashboardHeader + link de voltar pro painel
 */
function PageShell({ tipo, children }: { tipo: 'A' | 'P' | 'U' | undefined; children: ReactNode }) {
  if (tipo === 'A') {
    return <AdminShell>{children}</AdminShell>;
  }
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

export default function Relatorios() {
  const { user } = useAuth();

  const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
  const [loadingTurmas, setLoadingTurmas] = useState(true);

  const [turmaId, setTurmaId] = useState<number | ''>('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [relatorio, setRelatorio] = useState<RelatorioTurma | null>(null);
  const [gerando, setGerando] = useState(false);
  const [exportando, setExportando] = useState<'csv' | 'pdf' | null>(null);

  useEffect(() => {
    turmasApi
      .listar()
      .then((t) => {
        setTurmas(t);
        if (t.length === 1) setTurmaId(t[0].id);
      })
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoadingTurmas(false));
  }, []);

  async function gerar() {
    if (!turmaId) {
      toast.error('Escolha uma turma.');
      return;
    }
    setGerando(true);
    try {
      const r = await relatoriosApi.resumo(turmaId, {
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      });
      setRelatorio(r);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setGerando(false);
    }
  }

  async function exportar(formato: 'csv' | 'pdf') {
    if (!turmaId || !relatorio) return;
    setExportando(formato);
    try {
      const filtro = {
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      };
      if (formato === 'csv') await relatoriosApi.downloadCSV(turmaId, filtro);
      else await relatoriosApi.downloadPDF(turmaId, filtro);
      toast.success(`${formato.toUpperCase()} baixado.`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setExportando(null);
    }
  }

  return (
    <PageShell tipo={user?.tipo}>
      <header className="mb-8 animate-slide-up">
        {user?.tipo === 'A' && <p className="section-number mb-3">administração — 03</p>}
        <h1 className="text-display-lg text-fg-primary">Relatórios de Presença</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {user?.tipo === 'P'
            ? 'Consolidação de presença das suas turmas, com filtros de período e exportação em CSV e PDF.'
            : 'Consolidação de presença por turma, com filtros de período e exportação em CSV e PDF.'}
        </p>
      </header>

      <section className="card-vault mb-6 p-6">
        <p className="section-number mb-4">filtros — 01</p>
        <div className="grid gap-4 sm:grid-cols-[1fr_220px_220px_auto]">
          <Select
            label="Turma"
            marker="01"
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value ? Number(e.target.value) : '')}
            options={turmas.map((t) => ({ value: t.id, label: `${t.nome} · ${t.disciplina}` }))}
            placeholder={loadingTurmas ? 'Carregando…' : 'Escolha uma turma'}
            disabled={loadingTurmas || gerando}
            required
          />
          <Input
            label="Data início"
            marker="02"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            disabled={gerando}
          />
          <Input
            label="Data fim"
            marker="03"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            disabled={gerando}
          />
          <div className="flex items-end">
            <Button onClick={gerar} loading={gerando} disabled={!turmaId}>
              <Search size={14} />
              Gerar
            </Button>
          </div>
        </div>
      </section>

      {!relatorio ? (
        <EmptyState
          icon={BarChart3}
          title="Nenhum relatório gerado"
          description="Escolha uma turma e período acima, depois clique em 'Gerar'."
        />
      ) : (
        <>
          <section className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="card-vault p-4">
              <p className="section-number">sessões consideradas</p>
              <p className="display mt-1 text-3xl tabular-nums text-fg-primary">
                {relatorio.totalSessoesConsideradas}
              </p>
            </div>
            <div className="card-vault p-4">
              <p className="section-number">alunos analisados</p>
              <p className="display mt-1 text-3xl tabular-nums text-fg-primary">
                {relatorio.linhas.length}
              </p>
            </div>
            <div className="card-vault p-4">
              <p className="section-number">presença média</p>
              <p className="display mt-1 text-3xl tabular-nums text-rgb">
                {relatorio.linhas.length === 0
                  ? '—'
                  : Math.round(
                      relatorio.linhas.reduce((acc, l) => acc + l.percentualPresenca, 0) /
                        relatorio.linhas.length,
                    ) + '%'}
              </p>
            </div>
          </section>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="display text-xl text-fg-primary">{relatorio.turma.nome}</p>
              <p className="text-sm text-fg-muted">
                {relatorio.turma.disciplina} · período {relatorio.turma.periodo}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => exportar('csv')}
                loading={exportando === 'csv'}
                disabled={exportando !== null}
              >
                <FileSpreadsheet size={14} />
                CSV
              </Button>
              <Button
                onClick={() => exportar('pdf')}
                loading={exportando === 'pdf'}
                disabled={exportando !== null}
              >
                <FileText size={14} />
                PDF
              </Button>
            </div>
          </div>

          <Table
            columns={[
              {
                header: 'aluno',
                cell: (l) => (
                  <div>
                    <p className="font-medium text-fg-primary">{l.alunoNome}</p>
                    {l.matricula && (
                      <p className="font-mono text-[11px] text-fg-muted">mat. {l.matricula}</p>
                    )}
                  </div>
                ),
              },
              {
                header: 'confirmadas',
                align: 'center',
                cell: (l) => (
                  <span className="font-mono tabular-nums text-fg-primary">
                    {l.presencasConfirmadas}
                  </span>
                ),
              },
              {
                header: 'tolerância',
                align: 'center',
                cell: (l) => (
                  <span className="font-mono tabular-nums text-fg-secondary">
                    {l.presencasPendentes}
                  </span>
                ),
              },
              {
                header: 'faltas',
                align: 'center',
                cell: (l) => (
                  <span className="font-mono tabular-nums text-fg-secondary">{l.faltas}</span>
                ),
              },
              {
                header: '% presença',
                align: 'right',
                cell: (l) => (
                  <Badge
                    variant={
                      l.percentualPresenca >= 75
                        ? 'success'
                        : l.percentualPresenca >= 50
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {l.percentualPresenca}%
                  </Badge>
                ),
              },
              {
                header: 'última presença',
                align: 'right',
                cell: (l) => (
                  <span
                    className={cn(
                      'font-mono text-xs',
                      l.ultimaPresenca ? 'text-fg-secondary' : 'text-fg-muted',
                    )}
                  >
                    {l.ultimaPresenca
                      ? new Date(l.ultimaPresenca).toLocaleDateString('pt-BR')
                      : '—'}
                  </span>
                ),
              },
            ]}
            data={relatorio.linhas}
            rowKey={(l) => l.alunoId}
            empty={
              <EmptyState
                title="Sem matrículas"
                description="Não há alunos matriculados nesta turma."
              />
            }
          />
        </>
      )}
    </PageShell>
  );
}
