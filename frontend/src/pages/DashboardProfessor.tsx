import { PlayCircle, BarChart3, Bell, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';

export default function DashboardProfessor() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-ink-50">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="animate-slide-up">
            <p className="section-number mb-3">painel — docente</p>
            <h1 className="display text-5xl tracking-tightest text-ink-900">
              Bom dia, {user?.nome.split(' ')[0]}.
            </h1>
            <p className="mt-3 max-w-xl text-base text-ink-600">
              Inicie uma chamada, dispare interações ou consulte o histórico de presença das suas
              turmas.
            </p>
          </div>

          <div className="rounded-sm border border-ink-200 bg-ink-50 p-4">
            <p className="section-number">próxima aula</p>
            <p className="display mt-1 text-2xl text-ink-900">— —</p>
            <p className="text-xs text-ink-500">
              Cadastre suas turmas para visualizar.
            </p>
          </div>
        </section>

        {/* Ação principal: abrir chamada */}
        <section className="mb-8">
          <button
            disabled
            className="group flex w-full items-center justify-between rounded-sm border-2 border-dashed border-ink-300 bg-ink-100/50 p-8 text-left transition-colors hover:border-ink-900 disabled:cursor-not-allowed disabled:hover:border-ink-300"
          >
            <div className="flex items-center gap-6">
              <div className="rounded-full bg-ink-200 p-4">
                <PlayCircle size={28} className="text-ink-500" />
              </div>
              <div>
                <p className="display text-3xl text-ink-500">Iniciar chamada</p>
                <p className="mt-1 text-sm text-ink-500">
                  Abra uma sessão pra uma turma e gere o código de check-in.
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
              em breve
            </span>
          </button>
        </section>

        {/* Cards menores */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-5">
            <Calendar size={18} className="mb-3 text-ink-400" />
            <p className="display text-xl text-ink-500">Histórico</p>
            <p className="mt-1 text-xs text-ink-500">Sessões anteriores e presenças.</p>
          </div>
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-5">
            <BarChart3 size={18} className="mb-3 text-ink-400" />
            <p className="display text-xl text-ink-500">Relatórios</p>
            <p className="mt-1 text-xs text-ink-500">Exportação em CSV ou PDF.</p>
          </div>
          <div className="rounded-sm border border-ink-200 bg-ink-50 p-5">
            <Bell size={18} className="mb-3 text-ink-400" />
            <p className="display text-xl text-ink-500">Interações</p>
            <p className="mt-1 text-xs text-ink-500">Perguntas e enquetes ao vivo.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
