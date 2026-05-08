import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { PERFIL_LABELS } from '@/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.success('Sessão encerrada.');
    navigate('/login', { replace: true });
  }

  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-ink-200 bg-ink-50/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo size="sm" />
          <div className="hidden h-4 w-px bg-ink-200 sm:block" />
          <p className="hidden text-sm text-ink-600 sm:block">
            <span className="section-number mr-2">{user.tipo === 'A' ? 'admin' : user.tipo === 'P' ? 'docente' : 'aluno'}</span>
            {user.nome}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs uppercase tracking-widest text-ink-500 md:inline">
            {PERFIL_LABELS[user.tipo]}
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-sm text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
