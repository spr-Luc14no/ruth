import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquarePlus, PowerOff, CheckCircle2, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CodigoSessaoDisplay } from '@/components/CodigoSessaoDisplay';
import { PerguntaForm } from '@/components/PerguntaForm';
import { ResultadosPergunta } from '@/components/ResultadosPergunta';
import { sessoesApi, interacoesApi, extractErrorMessage } from '@/services/api';
import { useSessaoSocket } from '@/hooks/useSessaoSocket';
import type {
  SessaoDetalhe,
  PresencaItem,
  EventoPresencaNova,
  EventoRespostaRecebida,
  ResultadosPergunta as TResultadosPergunta,
} from '@/types';

export default function SessaoAtiva() {
  const { id } = useParams<{ id: string }>();
  const sessaoId = Number(id);
  const navigate = useNavigate();

  const [sessao, setSessao] = useState<SessaoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  const [formAberto, setFormAberto] = useState(false);
  const [confirmEncerrar, setConfirmEncerrar] = useState(false);
  const [encerrando, setEncerrando] = useState(false);

  // Resultados da pergunta atualmente ativa (atualizado por socket)
  const [resultadosAtivos, setResultadosAtivos] = useState<TResultadosPergunta | null>(null);

  const carregar = useCallback(async () => {
    if (Number.isNaN(sessaoId)) {
      navigate('/', { replace: true });
      return;
    }
    try {
      const data = await sessoesApi.buscar(sessaoId);
      setSessao(data);
      const ativa = data.perguntas.find((p) => p.ativa);
      if (ativa) {
        const r = await interacoesApi.resultados(ativa.id);
        setResultadosAtivos(r);
      } else {
        setResultadosAtivos(null);
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [sessaoId, navigate]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Real-time: ouvir presenças novas, respostas e encerramentos
  useSessaoSocket(sessaoId || null, {
    onPresencaNova: (payload) => {
      const evt = payload as EventoPresencaNova;
      setSessao((s) => {
        if (!s) return s;
        // Evita duplicado se já chegou pela API
        if (s.presencas.some((p) => p.id === evt.presenca.id)) return s;
        return {
          ...s,
          presencas: [
            ...s.presencas,
            {
              id: evt.presenca.id,
              sessaoId: evt.sessaoId,
              marcadoEm: evt.presenca.marcadoEm,
              atrasoMin: evt.presenca.atrasoMin,
              status: evt.presenca.status,
              aluno: evt.presenca.aluno,
            } as PresencaItem,
          ],
        };
      });
      toast.success(`✓ ${evt.presenca.aluno.nome}`);
    },
    onRespostaRecebida: (payload) => {
      const evt = payload as EventoRespostaRecebida;
      setResultadosAtivos(evt.resultados);
    },
    onPerguntaEncerrada: () => {
      // Já consultaremos no próximo carregar; mas marcamos vazio
      setResultadosAtivos((r) => (r ? { ...r, ativa: false } : null));
    },
  });

  async function handleDispararCriada() {
    setFormAberto(false);
    await carregar();
  }

  async function encerrarPerguntaAtiva() {
    if (!resultadosAtivos) return;
    try {
      await interacoesApi.encerrar(resultadosAtivos.perguntaId);
      toast.success('Pergunta encerrada.');
      carregar();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function encerrarSessao() {
    setEncerrando(true);
    try {
      await sessoesApi.encerrar(sessaoId);
      toast.success('Sessão encerrada.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setEncerrando(false);
      setConfirmEncerrar(false);
    }
  }

  if (loading || !sessao) {
    return (
      <div className="min-h-screen bg-ink-50">
        <DashboardHeader />
        <div className="flex h-64 items-center justify-center text-sm text-ink-500">Carregando…</div>
      </div>
    );
  }

  const totalMatriculados = sessao.turma._count.matriculas;
  const totalPresentes = sessao.presencas.filter((p) => p.status === 'CONFIRMADO').length;
  const totalPendentes = sessao.presencas.filter((p) => p.status === 'PENDENTE').length;
  const isEncerrada = sessao.status !== 'ABERTA';

  return (
    <div className="min-h-screen bg-ink-50">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        {/* Header */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 animate-slide-up">
          <div>
            <p className="section-number mb-3">sessão #{sessao.id} · ao vivo</p>
            <h1 className="display text-5xl tracking-tightest text-ink-900">{sessao.turma.nome}</h1>
            <p className="mt-1 text-sm text-ink-600">{sessao.turma.disciplina}</p>
          </div>
          <div className="flex gap-2">
            {!isEncerrada && (
              <Button variant="secondary" onClick={() => setFormAberto(true)}>
                <MessageSquarePlus size={16} />
                Disparar pergunta
              </Button>
            )}
            {!isEncerrada ? (
              <Button
                onClick={() => setConfirmEncerrar(true)}
                className="!bg-red-700 hover:!bg-red-800"
              >
                <PowerOff size={16} />
                Encerrar sessão
              </Button>
            ) : (
              <Badge variant="danger">Sessão encerrada</Badge>
            )}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* COLUNA ESQUERDA */}
          <div className="space-y-8">
            {/* Código gigante */}
            <section className="rounded-sm border border-ink-200 bg-ink-50 px-6 py-10">
              <CodigoSessaoDisplay codigo={sessao.codigo} />
            </section>

            {/* Pergunta ativa + resultados ao vivo */}
            {resultadosAtivos && (
              <section className="animate-slide-up rounded-sm border-2 border-ink-900 bg-ink-50 p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="section-number mb-2">pergunta ao vivo</p>
                    <h2 className="display text-2xl tracking-tightest text-ink-900">
                      {resultadosAtivos.enunciado}
                    </h2>
                  </div>
                  {resultadosAtivos.ativa && (
                    <Button variant="secondary" onClick={encerrarPerguntaAtiva} size="sm">
                      Encerrar
                    </Button>
                  )}
                </div>
                <ResultadosPergunta resultados={resultadosAtivos} mostrarCorreta />
              </section>
            )}

            {/* Histórico de perguntas encerradas */}
            {sessao.perguntas.filter((p) => !p.ativa).length > 0 && (
              <section>
                <p className="section-number mb-3">perguntas encerradas</p>
                <ul className="space-y-2">
                  {sessao.perguntas
                    .filter((p) => !p.ativa)
                    .map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between rounded-sm border border-ink-200 bg-ink-50 px-4 py-3"
                      >
                        <p className="truncate text-sm text-ink-800">{p.enunciado}</p>
                        <span className="font-mono text-xs tabular-nums text-ink-500">
                          {p._count.respostas} resp.
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </div>

          {/* COLUNA DIREITA — Presenças */}
          <aside className="space-y-4">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-sm bg-ink-200">
              <div className="bg-ink-50 p-4 text-center">
                <p className="section-number">presentes</p>
                <p className="display mt-1 text-3xl tabular-nums text-stamp-700">
                  {totalPresentes}
                </p>
              </div>
              <div className="bg-ink-50 p-4 text-center">
                <p className="section-number">tolerância</p>
                <p className="display mt-1 text-3xl tabular-nums text-ink-600">{totalPendentes}</p>
              </div>
              <div className="bg-ink-50 p-4 text-center">
                <p className="section-number">total</p>
                <p className="display mt-1 text-3xl tabular-nums text-ink-900">
                  {totalMatriculados}
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-ink-200 bg-ink-50">
              <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
                <p className="section-number flex items-center gap-2">
                  <Users size={12} />
                  presenças
                </p>
                <span className="font-mono text-[10px] tabular-nums text-ink-500">
                  {sessao.presencas.length} / {totalMatriculados}
                </span>
              </div>
              {sessao.presencas.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-ink-500">
                  Aguardando primeiro check-in…
                </div>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {sessao.presencas.map((p, i) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 animate-fade-in"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="font-mono text-[10px] tabular-nums text-ink-400">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink-900">
                            {p.aluno.nome}
                          </p>
                          {p.aluno.matricula && (
                            <p className="font-mono text-[11px] text-ink-500">
                              mat. {p.aluno.matricula}
                            </p>
                          )}
                        </div>
                      </div>
                      {p.status === 'CONFIRMADO' ? (
                        <CheckCircle2 size={16} className="shrink-0 text-stamp-600" />
                      ) : (
                        <Clock size={16} className="shrink-0 text-ink-400" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>

      <PerguntaForm
        open={formAberto}
        onClose={() => setFormAberto(false)}
        onCreated={handleDispararCriada}
        sessaoId={sessaoId}
      />

      <ConfirmDialog
        open={confirmEncerrar}
        onClose={() => setConfirmEncerrar(false)}
        onConfirm={encerrarSessao}
        title="Encerrar sessão"
        description="Após encerrar, nenhum aluno poderá mais fazer check-in nem responder perguntas. Esta ação não pode ser desfeita."
        confirmLabel="Encerrar"
        destructive
        loading={encerrando}
      />
    </div>
  );
}
