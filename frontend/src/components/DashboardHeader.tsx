import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Badge } from '@/components/ui/Badge';
import { PERFIL_LABELS } from '@/types';

export function DashboardHeader() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <Logo size={28} />
          <span className="hidden text-xs text-fg-muted sm:inline">
            Sistema de Chamada
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-fg-primary">{user.nome}</p>
            <div className="flex items-center justify-end gap-1.5">
              <Badge variant={user.tipo === 'A' ? 'accent' : 'primary'}>
                {PERFIL_LABELS[user.tipo]}
              </Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-elevated px-3 py-1.5 text-xs text-fg-secondary transition-all hover:border-accent-500/50 hover:text-accent-400"
          >
            <LogOut size={12} />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
