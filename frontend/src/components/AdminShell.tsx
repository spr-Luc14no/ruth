import { Link, useLocation } from 'react-router-dom';
import { Users, GraduationCap, BarChart3, Sliders, ShieldCheck, Home } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { DashboardHeader } from './DashboardHeader';

interface AdminShellProps {
  children: ReactNode;
}

const nav = [
  { to: '/', label: 'Painel', icon: Home, marker: '00' },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, marker: '01' },
  { to: '/admin/turmas', label: 'Turmas', icon: GraduationCap, marker: '02' },
  { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3, marker: '03' },
  { to: '/admin/parametros', label: 'Parâmetros', icon: Sliders, marker: '04' },
  { to: '/admin/auditoria', label: 'Auditoria', icon: ShieldCheck, marker: '05' },
];

export function AdminShell({ children }: AdminShellProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardHeader />

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <p className="section-number mb-3">administração</p>
          <nav className="space-y-0.5">
            {nav.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all',
                    isActive
                      ? 'bg-primary-500/15 text-primary-300 shadow-glow-soft'
                      : 'text-fg-secondary hover:bg-bg-elevated hover:text-fg-primary',
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-[10px] tabular-nums',
                      isActive ? 'text-primary-400' : 'text-fg-muted',
                    )}
                  >
                    {item.marker}
                  </span>
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-md border border-border bg-bg-elevated p-4">
            <p className="section-number mb-2">próximas etapas</p>
            <ul className="space-y-1.5 text-xs text-fg-muted">
              <li>· Banco de perguntas (PR7)</li>
              <li>· Gamificação (PR8)</li>
              <li>· Música & sons (PR9)</li>
            </ul>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
