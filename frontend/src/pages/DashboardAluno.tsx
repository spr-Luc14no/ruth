import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, History, PlayCircle, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { OtpInput } from '@/components/OtpInput';
import { Button } from '@/components/ui/Button';
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

  useEffect(() => {
    sessoesApi
      .ativaDoAluno()
      .then(setSessaoAtiva)
      .catch(() => {
        // silencioso
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
    <div className="min-h-screen bg-bg-base">
      <DashboardHeader />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <section className="mb-10 animate-slide-up">
          <p className="section-number mb-3">painel — aluno</p>
          <h1 className="text-display-xl text-fg-primary">
            Olá, <span className="text-rgb">{user?.nome.split(' ')[0]}</span>.
          </h1>
          <p className="mt-3 text-base text-fg-secondary">
            Insira o código fornecido pelo professor para registrar sua presença.
          </p>
        </section>

        {/* Banner sessão ativa */}
        {!carregandoAtiva && sessaoAtiva && (
          <Link
            to={`/aluno/sessao/${sessaoAtiva.id}`}
            className="group mb-6 flex flex-wrap items-center justify-between gap-6 rounded-md border-2 border-primary-500/50 bg-bg-elevated p-6 shadow-glow-primary transition-all hover:border-primary-500 hover:bg-bg-hover animate-slide-up"
          >
            <div className="flex items-center gap-5">
              <div className="rounded-full bg-primary-500/15 p-3">
                <PlayCircle size={24} className="text-primary-400" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="indicator-live">ao vivo</span>
                  <span className="font-mono text-xs text-fg-muted">
                    código: {sessaoAtiva.codigo}
                  </span>
                </div>
                <p className="display text-2xl text-fg-primary">{sessaoAtiva.disciplina.nome}</p>
                <p className="text-sm text-fg-muted">{sessaoAtiva.disciplina.turma.nome}</p>
              </div>
            </div>
            <ArrowUpRight
              size={20}
              className="text-fg-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-400"
            />
          </Link>
        )}

        {/* OTP */}
        <section className="rounded-md border border-border bg-bg-elevated p-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="section-number">
              {sessaoAtiva ? '02 · entrar em outra sessão' : '01 · entrar na sessão'}
            </p>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-400">
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

          <p className="mt-4 text-center text-xs text-fg-muted">
            Quatro caracteres alfanuméricos — exemplo: <span className="font-mono text-primary-400">A2B3</span>
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2.5 text-center text-sm text-accent-400"
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

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-bg-elevated p-5">
            <CheckCircle2 size={18} className="mb-3 text-fg-muted" />
            <p className="display text-xl text-fg-secondary">Presenças</p>
            <p className="mt-1 text-xs text-fg-muted">Suas confirmações registradas (em breve).</p>
          </div>
          <div className="rounded-md border border-border bg-bg-elevated p-5">
            <History size={18} className="mb-3 text-fg-muted" />
            <p className="display text-xl text-fg-secondary">Histórico</p>
            <p className="mt-1 text-xs text-fg-muted">Sessões anteriores das suas turmas.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
