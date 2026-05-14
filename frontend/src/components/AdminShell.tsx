import { type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Users, BookOpen, Sliders, ScrollText, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';

interface AdminShellProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', label: 'Início', icon: Home, marker: '00', enabled: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, marker: '01', enabled: true },
  { to: '/admin/turmas', label: 'Turmas', icon: BookOpen, marker: '02', enabled: true },
  { to: '/admin/parametros', label: 'Parâmetros', icon: Sliders, marker: '03', enabled: false },
  { to: '/admin/auditoria', label: 'Auditoria', icon: ScrollText, marker: '04', enabled: false },
];

export function AdminShell({ children }: AdminShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.success('Sessão encerrada.');
    navigate('/login', { replace: true });
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="flex min-h-screen">
        {/* ============ SIDEBAR ============ */}
        <aside className="hidden w-64 shrink-0 border-r border-ink-200 lg:flex lg:flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-ink-200 px-6">
            <Logo size="sm" />
          </div>

          {/* Identificação do usuário */}
          <div className="border-b border-ink-200 px-6 py-4">
            <p className="section-number">administrador</p>
            <p className="mt-1 truncate text-sm font-medium text-ink-900">{user.nome}</p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
          </div>

          {/* Navegação */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-0.5">
              {navItems.map((item) => (
                <li key={item.to}>
                  {item.enabled ? (
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-ink-900 text-ink-50'
                            : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              'font-mono text-[10px] uppercase tracking-widest',
                              isActive ? 'text-ink-300' : 'text-ink-400',
                            )}
                          >
                            {item.marker}
                          </span>
                          <item.icon size={15} />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ) : (
                    <div className="flex cursor-not-allowed items-center gap-3 rounded-sm px-3 py-2 text-sm text-ink-400">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-300">
                        {item.marker}
                      </span>
                      <item.icon size={15} />
                      <span>{item.label}</span>
                      <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-ink-300">
                        em breve
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="border-t border-ink-200 p-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </aside>

        {/* ============ CONTEÚDO ============ */}
        <main className="flex-1 overflow-x-hidden">
          {/* Header mobile (visível só no mobile, lg:hidden) */}
          <div className="flex h-16 items-center justify-between border-b border-ink-200 px-6 lg:hidden">
            <Logo size="sm" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm text-ink-700 hover:bg-ink-100"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>

          <div className="px-6 py-8 lg:px-10 lg:py-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
