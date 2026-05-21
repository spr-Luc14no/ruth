import { Link } from 'react-router-dom';
import { Users, GraduationCap, BarChart3, Settings, ArrowUpRight, Sliders, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Badge } from '@/components/ui/Badge';

interface AdminCardProps {
  marker: string;
  title: string;
  description: string;
  icon: typeof Users;
  to?: string;
  disabled?: boolean;
}

function AdminCard({ marker, title, description, icon: Icon, to, disabled }: AdminCardProps) {
  const content = (
    <div
      className={`group relative h-full rounded-md border bg-bg-elevated p-6 transition-all ${
        disabled
          ? 'border-border opacity-60'
          : 'border-border hover:border-primary-500/60 hover:shadow-glow-soft hover:bg-bg-hover'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="section-number">{marker}</p>
        {disabled ? (
          <Badge variant="neutral">em breve</Badge>
        ) : (
          <ArrowUpRight
            size={16}
            className="text-fg-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-400"
          />
        )}
      </div>
      <Icon size={20} className={`mb-4 ${disabled ? 'text-fg-muted' : 'text-primary-400'}`} />
      <h3 className="display text-xl text-fg-primary">{title}</h3>
      <p className="mt-1.5 text-sm text-fg-muted">{description}</p>
    </div>
  );

  if (disabled || !to) return content;
  return <Link to={to}>{content}</Link>;
}

export default function DashboardAdmin() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-12 animate-slide-up">
          <p className="section-number mb-3">painel — administração</p>
          <h1 className="text-display-xl text-fg-primary">
            Bem-vindo, <span className="text-rgb">{user?.nome.split(' ')[0]}</span>.
          </h1>
          <p className="mt-3 max-w-xl text-base text-fg-secondary">
            Você está no painel de administração do RUTh. A partir daqui você gerencia
            usuários, turmas, parâmetros e auditoria do sistema.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <AdminCard
            marker="01"
            title="Usuários"
            description="Cadastro, edição e bloqueio de admins, professores e alunos."
            icon={Users}
            to="/admin/usuarios"
          />
          <AdminCard
            marker="02"
            title="Turmas"
            description="Criação de turmas, atribuição de professores e matrículas."
            icon={GraduationCap}
            to="/admin/turmas"
          />
          <AdminCard
            marker="03"
            title="Relatórios"
            description="Consolidados de presença, exportação CSV e PDF."
            icon={BarChart3}
            to="/admin/relatorios"
          />
          <AdminCard
            marker="04"
            title="Parâmetros"
            description="Tolerância de atraso, presença mínima, regras do sistema."
            icon={Sliders}
            to="/admin/parametros"
          />
          <AdminCard
            marker="05"
            title="Auditoria"
            description="Histórico imutável de todas as ações sensíveis."
            icon={ShieldCheck}
            to="/admin/auditoria"
          />
          <AdminCard
            marker="06"
            title="Configurações"
            description="Preferências e personalização do sistema."
            icon={Settings}
            disabled
          />
        </section>
      </main>
    </div>
  );
}
