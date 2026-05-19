import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Perfil } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Se informado, restringe acesso a estes perfis. */
  perfis?: Perfil[];
}

export function ProtectedRoute({ children, perfis }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base">
        <div className="font-display text-2xl text-fg-muted">aguarde…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (perfis && !perfis.includes(user.tipo)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
