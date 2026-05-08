import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authStorage } from '@/lib/auth';
import { authApi } from '@/services/api';
import type { Usuario } from '@/types';

interface AuthContextValue {
  user: Usuario | null;
  loading: boolean;
  login: (loginInput: string, senha: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => authStorage.getUser());
  const [loading, setLoading] = useState(true);

  // Ao montar: se há token, valida com /auth/me. Se inválido, desloga.
  useEffect(() => {
    let cancelled = false;
    const token = authStorage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(() => {
        if (!cancelled) setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          authStorage.clear();
          setUser(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (loginInput: string, senha: string) => {
    const result = await authApi.login(loginInput, senha);
    authStorage.setToken(result.token);
    authStorage.setUser(result.usuario);
    setUser(result.usuario);
    return result.usuario;
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
