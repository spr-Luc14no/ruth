import { useEffect, useState } from 'react';
import { ShieldCheck, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminShell } from '@/components/AdminShell';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { auditoriaApi, extractErrorMessage } from '@/services/api';
import type { ListaAuditoria } from '@/types';

const ENTIDADES = [
  { value: '', label: 'Todas as entidades' },
  { value: 'Usuario', label: 'Usuário' },
  { value: 'Turma', label: 'Turma' },
  { value: 'Matricula', label: 'Matrícula' },
  { value: 'SessaoChamada', label: 'Sessão' },
  { value: 'Presenca', label: 'Presença' },
  { value: 'Pergunta', label: 'Pergunta' },
  { value: 'Parametro', label: 'Parâmetro' },
  { value: 'Auth', label: 'Autenticação' },
];

const ACAO_VARIANTES: Record<string, 'primary' | 'accent' | 'success' | 'warning' | 'neutral' | 'danger'> = {
  LOGIN_SUCESSO: 'success',
  LOGIN_FALHA: 'danger',
  USUARIO_CRIADO: 'primary',
  USUARIO_BLOQUEADO: 'accent',
  USUARIO_REATIVADO: 'success',
  TURMA_CRIADA: 'primary',
  SESSAO_ABERTA: 'primary',
  SESSAO_ENCERRADA: 'neutral',
  PRESENCA_REGISTRADA: 'success',
  PERGUNTA_DISPARADA: 'primary',
  PARAMETRO_ATUALIZADO: 'warning',
};

export default function Auditoria() {
  const [resultado, setResultado] = useState<ListaAuditoria | null>(null);
  const [loading, setLoading] = useState(false);

  const [busca, setBusca] = useState('');
  const [entidade, setEntidade] = useState('');
  const [pagina, setPagina] = useState(1);

  async function carregar() {
    setLoading(true);
    try {
      const r = await auditoriaApi.listar({
        acao: busca.trim() || undefined,
        entidade: entidade || undefined,
        pagina,
        porPagina: 25,
      });
      setResultado(r);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, entidade, pagina]);

  return (
    <AdminShell>
      <header className="mb-8 animate-slide-up">
        <p className="section-number mb-3">administração — 05</p>
        <h1 className="text-display-lg text-fg-primary">Auditoria</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Histórico imutável de todas as ações sensíveis no sistema.
        </p>
      </header>

      {/* Filtros */}
      <section className="card-vault mb-6 p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_280px]">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
            />
            <Input
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por ação (ex: LOGIN, SESSAO, PRESENCA)…"
              className="pl-9"
            />
          </div>
          <Select
            value={entidade}
            onChange={(e) => {
              setEntidade(e.target.value);
              setPagina(1);
            }}
            options={ENTIDADES}
          />
        </div>
      </section>

      {/* Tabela */}
      {loading ? (
        <div className="card-vault p-12 text-center text-sm text-fg-muted">Carregando…</div>
      ) : !resultado || resultado.logs.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhum registro encontrado"
          description={busca || entidade ? 'Tente refinar os filtros.' : 'Ainda não há registros de auditoria.'}
        />
      ) : (
        <>
          <Table
            columns={[
              {
                header: 'data',
                width: 'w-44',
                cell: (log) => (
                  <span className="font-mono text-xs text-fg-secondary">
                    {new Date(log.dataEvento).toLocaleString('pt-BR')}
                  </span>
                ),
              },
              {
                header: 'usuário',
                cell: (log) =>
                  log.usuario ? (
                    <div>
                      <p className="text-sm text-fg-primary">{log.usuario.nome}</p>
                      <p className="font-mono text-[10px] text-fg-muted">{log.usuario.login}</p>
                    </div>
                  ) : (
                    <span className="font-mono text-xs text-fg-muted">—</span>
                  ),
              },
              {
                header: 'ação',
                cell: (log) => (
                  <Badge variant={ACAO_VARIANTES[log.acao] ?? 'neutral'}>{log.acao}</Badge>
                ),
              },
              {
                header: 'entidade',
                cell: (log) => (
                  <span className="font-mono text-xs text-fg-secondary">{log.entidade}</span>
                ),
              },
              {
                header: 'detalhes',
                cell: (log) => (
                  <span className="font-mono text-[11px] text-fg-muted">{log.detalhes ?? '—'}</span>
                ),
              },
              {
                header: 'ip',
                cell: (log) => (
                  <span className="font-mono text-[11px] text-fg-muted">{log.ip ?? '—'}</span>
                ),
              },
            ]}
            data={resultado.logs}
            rowKey={(log) => log.id}
          />

          {/* Paginação */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-fg-muted">
              Página{' '}
              <span className="font-mono tabular-nums text-fg-primary">{resultado.pagina}</span>{' '}
              de{' '}
              <span className="font-mono tabular-nums text-fg-primary">
                {resultado.totalPaginas}
              </span>
              {' · '}
              <span className="font-mono tabular-nums">{resultado.total}</span> registros
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={resultado.pagina <= 1}
              >
                <ChevronLeft size={14} />
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPagina((p) => p + 1)}
                disabled={resultado.pagina >= resultado.totalPaginas}
              >
                Próxima
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
