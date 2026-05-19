import { Users, BookOpen, Sliders, ScrollText, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  icon: typeof Users;
  to?: string;
}

function FeatureCard({ number, title, description, icon: Icon, to }: FeatureCardProps) {
  const isAvailable = Boolean(to);

  const content = (
    <>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <span className="section-number">{number}</span>
          <Icon size={18} className={isAvailable ? 'text-ink-900' : 'text-ink-400'} />
        </div>
        <h3 className={`display text-2xl ${isAvailable ? 'text-ink-900' : 'text-ink-500'}`}>
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{description}</p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
            isAvailable ? 'text-stamp-600' : 'text-ink-400'
          }`}
        >
          {isAvailable ? '✓ disponível' : '— em breve'}
        </span>
        {isAvailable && (
          <ArrowUpRight
            size={16}
            className="text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink-900"
          />
        )}
      </div>
    </>
  );

  const baseClasses =
    'group relative flex h-full flex-col justify-between rounded-sm border bg-ink-50 p-6 transition-colors';

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} border-ink-300 hover:border-ink-900`}>
        {content}
      </Link>
    );
  }
  return (
    <article className={`${baseClasses} cursor-not-allowed border-ink-200`}>{content}</article>
  );
}

export default function DashboardAdmin() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-ink-50">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-12 max-w-2xl animate-slide-up">
          <p className="section-number mb-3">painel — administração</p>
          <h1 className="display text-5xl tracking-tightest text-ink-900">
            Olá, {user?.nome.split(' ')[0]}.
          </h1>
          <p className="mt-3 text-base text-ink-600">
            Gerencie usuários, turmas, parâmetros e revise os logs de auditoria do sistema.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            number="01"
            title="Usuários"
            description="Cadastre administradores, professores e alunos."
            icon={Users}
            to="/admin/usuarios"
          />
          <FeatureCard
            number="02"
            title="Turmas"
            description="Configure turmas, períodos, disciplinas e matrículas."
            icon={BookOpen}
            to="/admin/turmas"
          />
          <FeatureCard
            number="03"
            title="Parâmetros"
            description="Janela padrão, tolerância de atraso, presença mínima e pesos."
            icon={Sliders}
          />
          <FeatureCard
            number="04"
            title="Auditoria"
            description="Logs de login, alterações e operações sensíveis do sistema."
            icon={ScrollText}
          />
        </section>

        <section className="mt-12 border-t border-ink-200 pt-8">
          <p className="section-number mb-4">próximas entregas</p>
          <div className="grid gap-4 text-sm text-ink-600 sm:grid-cols-3">
            <div>
              <span className="font-mono text-xs text-ink-900">PR 4</span>
              <p>Sessões de chamada em tempo real</p>
            </div>
            <div>
              <span className="font-mono text-xs text-ink-900">PR 5</span>
              <p>Interações e relatórios</p>
            </div>
            <div>
              <span className="font-mono text-xs text-ink-900">PR 6</span>
              <p>Parâmetros e auditoria UI</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
