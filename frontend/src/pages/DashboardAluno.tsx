import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, History, PlayCircle, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { OtpInput } from '@/components/OtpInput';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sessoesApi, extractErrorMessage, isApiErrorCode } from '@/services/api';
import type { SessaoBasica } from '@/types';

export default function DashboardAluno() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoBasica | null>(null);
  const [carregandoAtiva, setCarregandoAtiva] = useState(true);

  const [codigo, setCodigo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ao montar: verifica se já tem sessão em andamento
  useEffect(() => {
    sessoesApi
      .ativaDoAluno()
      .then(setSessaoAtiva)
      .catch(() => {
        // silencioso — não bloqueia o dashboard se a checagem falhar
      })
      .finally(() => setCarregandoAtiva(false));
  }, []);

  async function entrar(codigoFinal: string) {
    setError(null);
    setSubmitting(true);
    try {
      const sessao = await sessoesApi.buscarPorCodigo(codigoFinal);
      try {
        await sessoesApi.checkin(sessao.id);
        toast.success('Presença registrada!');
      } catch (checkinErr) {
        // Se já tem presença nesta sessão, NÃO é erro — só reentra.
        if (isApiErrorCode(checkinErr, 'JA_REGISTRADO')) {
          toast.success('Voltando à sessão…');
        } else {
          throw checkinErr;
        }
      }
      navigate(`/aluno/sessao/${sessao.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <DashboardHeader />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <section className="mb-10 animate-slide-up">
          <p className="section-number mb-3">painel — aluno</p>
          <h1 className="display text-5xl tracking-tightest text-ink-900">
            Olá, {user?.nome.split(' ')[0]}.
          </h1>
          <p className="mt-3 text-base text-ink-600">
            Insira o código fornecido pelo professor para registrar sua presença.
          </p>
        </section>

        {/* Banner de sessão em andamento */}
        {!carregandoAtiva && sessaoAtiva && (
          <Link
            to={`/aluno/sessao/${sessaoAtiva.id}`}
            className="mb-6 flex flex-wrap items-center justify-between gap-6 rounded-sm border-2 border-ink-900 bg-ink-50 p-6 transition-colors hover:bg-ink-100 animate-slide-up"
          >
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-stamp-50 p-3">
                <PlayCircle size={24} className="text-stamp-700" />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="stamp">você está nesta sessão</Badge>
                  <span className="font-mono text-xs text-ink-500">
                    código: {sessaoAtiva.codigo}
                  </span>
                </div>
                <p className="display text-2xl text-ink-900">{sessaoAtiva.turma.nome}</p>
                <p className="text-sm text-ink-600">{sessaoAtiva.turma.disciplina}</p>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-ink-700" />
          </Link>
        )}

        {/* Bloco principal: inserir código */}
        <section className="rounded-sm border border-ink-200 bg-ink-50 p-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="section-number">
              {sessaoAtiva ? '02 · entrar em outra sessão' : '01 · entrar na sessão'}
            </p>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stamp-600">
              ✓ disponível
            </span>
          </div>

          <OtpInput
            value={codigo}
            onChange={(v) => {
              setCodigo(v);
              setError(null);
            }}
            onComplete={entrar}
            disabled={submitting}
          />

          <p className="mt-4 text-center text-xs text-ink-500">
            Quatro caracteres alfanuméricos — exemplo: <span className="font-mono">A2B3</span>.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-center text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <Button
            onClick={() => entrar(codigo)}
            loading={submitting}
            disabled={codigo.length !== 4}
            size="lg"
            className="mt-5 w-full"
          >
            Confirmar presença
          </Button>
        </section>

        {/* Histórico */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-5">
            <CheckCircle2 size={18} className="mb-3 text-ink-400" />
            <p className="display text-xl text-ink-500">Presenças</p>
            <p className="mt-1 text-xs text-ink-500">Suas confirmações registradas (em breve).</p>
          </div>
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-5">
            <History size={18} className="mb-3 text-ink-400" />
            <p className="display text-xl text-ink-500">Histórico</p>
            <p className="mt-1 text-xs text-ink-500">Sessões anteriores das suas turmas.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
