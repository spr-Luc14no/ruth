import { CheckCircle2, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';

export default function DashboardAluno() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-ink-50">
      <DashboardHeader />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <section className="mb-12 animate-slide-up">
          <p className="section-number mb-3">painel — aluno</p>
          <h1 className="display text-5xl tracking-tightest text-ink-900">
            Olá, {user?.nome.split(' ')[0]}.
          </h1>
          <p className="mt-3 text-base text-ink-600">
            Insira o código fornecido pelo professor para registrar sua presença.
          </p>
        </section>

        {/* Bloco principal: inserir código (placeholder) */}
        <section className="rounded-sm border border-ink-200 bg-ink-50 p-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="section-number">01 · entrar na sessão</p>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
              em breve
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-sm border-2 border-dashed border-ink-300 bg-ink-100/50"
                aria-hidden="true"
              />
            ))}
          </div>

          <p className="mt-4 text-xs text-ink-500">
            Quatro caracteres alfanuméricos — exemplo: <span className="font-mono">0xff</span>.
          </p>
        </section>

        {/* Histórico */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-5">
            <CheckCircle2 size={18} className="mb-3 text-ink-400" />
            <p className="display text-xl text-ink-500">Presenças</p>
            <p className="mt-1 text-xs text-ink-500">Suas confirmações registradas.</p>
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
