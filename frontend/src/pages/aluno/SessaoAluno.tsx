import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sessoesApi, interacoesApi, extractErrorMessage } from '@/services/api';
import { useSessaoSocket } from '@/hooks/useSessaoSocket';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';
import type {
  SessaoDetalhe,
  PerguntaPublica,
  EventoPerguntaDisparada,
  EventoSessaoEncerrada,
} from '@/types';

export default function SessaoAluno() {
  const { id } = useParams<{ id: string }>();
  const sessaoId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sessao, setSessao] = useState<SessaoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [perguntaAtiva, setPerguntaAtiva] = useState<PerguntaPublica | null>(null);

  // Estado da resposta do aluno
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [perguntaEncerrada, setPerguntaEncerrada] = useState(false);

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
        setPerguntaAtiva({
          id: ativa.id,
          enunciado: ativa.enunciado,
          tipo: ativa.tipo,
          ativa: true,
          opcoes: ativa.opcoes.map((o) => ({ id: o.id, descricao: o.descricao })),
        });
        setPerguntaEncerrada(false);
      } else {
        setPerguntaAtiva(null);
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

  // Real-time: receber pergunta nova e encerramento
  useSessaoSocket(sessaoId || null, {
    onPerguntaDisparada: (payload) => {
      const evt = payload as EventoPerguntaDisparada;
      setPerguntaAtiva(evt.pergunta);
      setOpcaoSelecionada(null);
      setJaRespondeu(false);
      setPerguntaEncerrada(false);
      toast.success('Nova pergunta!', { icon: '✨' });
    },
    onPerguntaEncerrada: () => {
      setPerguntaEncerrada(true);
      toast('Pergunta encerrada.');
    },
    onSessaoEncerrada: (payload) => {
      const evt = payload as EventoSessaoEncerrada;
      setSessao((s) => (s ? { ...s, status: 'ENCERRADA', dataEncerramento: evt.encerradaEm } : s));
      toast('Sessão encerrada pelo professor.');
    },
  });

  async function responder() {
    if (!perguntaAtiva || !opcaoSelecionada) return;
    setEnviando(true);
    try {
      await interacoesApi.responder(perguntaAtiva.id, opcaoSelecionada);
      setJaRespondeu(true);
      toast.success('Resposta registrada.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setEnviando(false);
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

  const isEncerrada = sessao.status !== 'ABERTA';
  const minhaPresenca = sessao.presencas.find((p) => p.aluno.id === user?.id);

  return (
    <div className="min-h-screen bg-ink-50">
      <DashboardHeader />

      <main className="mx-auto max-w-2xl px-6 py-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft size={14} />
          Painel
        </button>

        {/* Header */}
        <header className="mb-8 animate-slide-up">
          <p className="section-number mb-3">sessão · {sessao.codigo}</p>
          <h1 className="display text-4xl tracking-tightest text-ink-900">{sessao.turma.nome}</h1>
          <p className="mt-1 text-sm text-ink-600">{sessao.turma.disciplina}</p>
        </header>

        {/* Status da presença */}
        <section
          className={cn(
            'mb-6 flex items-center gap-3 rounded-sm border p-4',
            minhaPresenca?.status === 'CONFIRMADO'
              ? 'border-stamp-100 bg-stamp-50'
              : 'border-ink-200 bg-ink-100',
          )}
        >
          {minhaPresenca?.status === 'CONFIRMADO' ? (
            <CheckCircle2 size={20} className="shrink-0 text-stamp-600" />
          ) : (
            <Clock size={20} className="shrink-0 text-ink-500" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-ink-900">
              {minhaPresenca
                ? minhaPresenca.status === 'CONFIRMADO'
                  ? 'Presença confirmada'
                  : 'Presença em tolerância'
                : 'Presença pendente'}
            </p>
            {minhaPresenca && minhaPresenca.atrasoMin > 0 && (
              <p className="text-xs text-ink-600">
                Registrada com {minhaPresenca.atrasoMin} min de atraso.
              </p>
            )}
          </div>
          {isEncerrada && <Badge variant="danger">sessão encerrada</Badge>}
        </section>

        {/* Pergunta ativa */}
        {perguntaAtiva && !isEncerrada ? (
          <section className="animate-slide-up rounded-sm border-2 border-ink-900 bg-ink-50 p-6">
            <div className="mb-5">
              <p className="section-number mb-2 flex items-center gap-1.5">
                <Sparkles size={11} />
                pergunta do professor
              </p>
              <h2 className="display text-2xl tracking-tightest text-ink-900">
                {perguntaAtiva.enunciado}
              </h2>
            </div>

            {jaRespondeu || perguntaEncerrada ? (
              <div
                className={cn(
                  'rounded-sm border p-4 text-center',
                  jaRespondeu
                    ? 'border-stamp-100 bg-stamp-50 text-stamp-700'
                    : 'border-ink-200 bg-ink-100 text-ink-700',
                )}
              >
                <p className="text-sm font-medium">
                  {jaRespondeu
                    ? '✓ Resposta enviada. Aguardando próxima interação.'
                    : 'Pergunta encerrada pelo professor.'}
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-2">
                  {perguntaAtiva.opcoes.map((opcao, i) => {
                    const selected = opcaoSelecionada === opcao.id;
                    return (
                      <li key={opcao.id}>
                        <button
                          type="button"
                          onClick={() => setOpcaoSelecionada(opcao.id)}
                          disabled={enviando}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-sm border-2 px-4 py-3 text-left transition-colors',
                            selected
                              ? 'border-ink-900 bg-ink-900 text-ink-50'
                              : 'border-ink-200 bg-ink-50 text-ink-900 hover:border-ink-700',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[10px]',
                              selected ? 'border-ink-50 bg-ink-50 text-ink-900' : 'border-ink-300',
                            )}
                          >
                            {selected ? <Check size={12} /> : String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-sm">{opcao.descricao}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  onClick={responder}
                  loading={enviando}
                  disabled={!opcaoSelecionada}
                  size="lg"
                  className="mt-5 w-full"
                >
                  Enviar resposta
                </Button>
              </>
            )}
          </section>
        ) : !isEncerrada ? (
          <section className="rounded-sm border border-dashed border-ink-300 bg-ink-100/30 px-6 py-12 text-center">
            <p className="section-number mb-3">aguardando</p>
            <p className="display text-2xl text-ink-500">Sem perguntas ativas</p>
            <p className="mt-2 text-sm text-ink-600">
              Fique nesta tela. Quando o professor disparar uma pergunta, ela aparecerá aqui
              automaticamente.
            </p>
          </section>
        ) : (
          <section className="rounded-sm border border-ink-200 bg-ink-50 px-6 py-12 text-center">
            <p className="display text-2xl text-ink-700">Sessão encerrada</p>
            <p className="mt-2 text-sm text-ink-600">
              Sua presença foi registrada. Você pode voltar ao painel.
            </p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Voltar ao painel
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
