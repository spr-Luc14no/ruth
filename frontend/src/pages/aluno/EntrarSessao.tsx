import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/OtpInput';
import { sessoesApi, extractErrorMessage, isApiErrorCode } from '@/services/api';

export default function EntrarSessao() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function entrar(codigoFinal: string) {
    setError(null);
    setSubmitting(true);
    try {
      const sessao = await sessoesApi.buscarPorCodigo(codigoFinal);
      try {
        await sessoesApi.checkin(sessao.id);
        toast.success('Presença registrada!');
      } catch (checkinErr) {
        // Se já tem presença, é só re-entrar
        if (isApiErrorCode(checkinErr, 'JA_REGISTRADO')) {
          toast.success('Voltando à sessão…');
        } else {
          throw checkinErr;
        }
      }
      navigate(`/aluno/sessao/${sessao.id}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
      setSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.length !== 4) {
      setError('O código tem 4 caracteres.');
      return;
    }
    entrar(codigo);
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardHeader />

      <main className="mx-auto max-w-xl px-6 py-12">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-fg-secondary hover:text-fg-primary"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <header className="mb-12 text-center animate-slide-up">
          <p className="section-number mb-3">presença — 01</p>
          <h1 className="display text-5xl tracking-tightest text-fg-primary">Entrar na sessão</h1>
          <p className="mt-3 text-base text-fg-secondary">
            Digite o código de 4 caracteres mostrado pelo professor.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <OtpInput
            value={codigo}
            onChange={(v) => {
              setCodigo(v);
              setError(null);
            }}
            onComplete={entrar}
            disabled={submitting}
            autoFocus
          />

          {error && (
            <div
              role="alert"
              className="rounded-sm border border-accent-500/40 bg-accent-500/10 px-3 py-2.5 text-center text-sm text-accent-400"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            loading={submitting}
            disabled={codigo.length !== 4}
            className="w-full"
          >
            {submitting ? 'Validando…' : 'Confirmar presença'}
          </Button>

          <p className="text-center text-xs text-bg-base0">
            O código diferencia maiúsculas/minúsculas? Não — é case-insensitive.
          </p>
        </form>
      </main>
    </div>
  );
}
