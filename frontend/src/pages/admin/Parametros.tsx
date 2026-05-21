import { useEffect, useState } from 'react';
import { Sliders, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminShell } from '@/components/AdminShell';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { parametrosApi, extractErrorMessage } from '@/services/api';
import type { Parametro } from '@/types';

interface EdicaoState {
  id: number;
  valor: string;
  ativo: boolean;
}

const TIPO_LABELS: Record<string, string> = {
  MIN: 'minutos',
  P: 'percentual',
  INT: 'inteiro',
  STR: 'texto',
};

const TIPO_VARIANTES: Record<string, 'primary' | 'accent' | 'neutral' | 'success' | 'warning'> = {
  MIN: 'primary',
  P: 'success',
  INT: 'neutral',
  STR: 'warning',
};

export default function Parametros() {
  const [params, setParams] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);
  const [edicao, setEdicao] = useState<EdicaoState | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const lista = await parametrosApi.listar();
      setParams(lista);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function iniciarEdicao(p: Parametro) {
    setEdicao({ id: p.id, valor: p.valor, ativo: p.ativo });
  }

  async function salvar() {
    if (!edicao) return;
    setSalvando(true);
    try {
      await parametrosApi.atualizar(edicao.id, {
        valor: edicao.valor,
        ativo: edicao.ativo,
      });
      toast.success('Parâmetro atualizado.');
      setEdicao(null);
      carregar();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AdminShell>
      <header className="mb-8 animate-slide-up">
        <p className="section-number mb-3">administração — 04</p>
        <h1 className="text-display-lg text-fg-primary">Parâmetros do Sistema</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Tolerância de atraso, presença mínima, regras de negócio configuráveis.
        </p>
      </header>

      {loading ? (
        <div className="card-vault p-12 text-center text-sm text-fg-muted">Carregando…</div>
      ) : params.length === 0 ? (
        <EmptyState
          icon={Sliders}
          title="Nenhum parâmetro cadastrado"
          description="O sistema não tem parâmetros registrados no banco."
        />
      ) : (
        <ul className="space-y-3">
          {params.map((p) => {
            const sendoEditado = edicao?.id === p.id;
            return (
              <li key={p.id} className="card-vault p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <code className="font-mono text-sm text-primary-300">{p.chave}</code>
                      <Badge variant={TIPO_VARIANTES[p.tipo] ?? 'neutral'}>
                        {TIPO_LABELS[p.tipo] ?? p.tipo}
                      </Badge>
                      {!p.ativo && <Badge variant="danger">inativo</Badge>}
                    </div>
                    <p className="text-sm text-fg-secondary">{p.descricao}</p>
                  </div>

                  {!sendoEditado ? (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="section-number">valor atual</p>
                        <p className="display mt-0.5 text-2xl tabular-nums text-fg-primary">
                          {p.valor}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(p)}
                        aria-label="Editar"
                        className="rounded-md border border-border bg-bg-elevated p-2 text-fg-secondary transition-colors hover:border-primary-500/50 hover:text-primary-400"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={edicao!.valor}
                        onChange={(e) => setEdicao((s) => (s ? { ...s, valor: e.target.value } : s))}
                        disabled={salvando}
                        autoFocus
                        className="w-32 rounded-md border border-primary-500/50 bg-bg-base px-3 py-2 text-center font-mono text-lg text-fg-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                      />
                      <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-fg-secondary">
                        <input
                          type="checkbox"
                          checked={edicao!.ativo}
                          onChange={(e) =>
                            setEdicao((s) => (s ? { ...s, ativo: e.target.checked } : s))
                          }
                          disabled={salvando}
                          className="h-4 w-4 cursor-pointer accent-primary-500"
                        />
                        ativo
                      </label>
                      <button
                        type="button"
                        onClick={salvar}
                        disabled={salvando}
                        aria-label="Salvar"
                        className="rounded-md bg-primary-500 p-2 text-fg-primary transition-all hover:bg-primary-400 hover:shadow-glow-primary disabled:opacity-50"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEdicao(null)}
                        disabled={salvando}
                        aria-label="Cancelar"
                        className="rounded-md border border-border bg-bg-elevated p-2 text-fg-secondary transition-colors hover:border-accent-500/50 hover:text-accent-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
