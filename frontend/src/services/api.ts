import axios, { AxiosError } from 'axios';
import { authStorage } from '@/lib/auth';
import type { ApiResponse, LoginResponse } from '@/types';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 15000,
});

// Anexa o token JWT em toda requisição
api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta — desloga em 401 (token expirado/inválido)
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && authStorage.getToken()) {
      authStorage.clear();
      // Redirecionamento "duro" pra evitar problemas de estado
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/**
 * Extrai mensagem amigável de erro de uma resposta da API.
 * Aceita tanto erros do nosso padrão {success:false, error:{...}}
 * quanto erros de rede/timeout.
 */
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiResponse<unknown> | undefined;
    if (data && data.success === false) {
      return data.error.message;
    }
    if (err.code === 'ECONNABORTED') return 'Tempo de resposta esgotado.';
    if (!err.response) return 'Sem conexão com o servidor.';
    return `Erro ${err.response.status}: ${err.response.statusText}`;
  }
  return 'Erro inesperado.';
}

// ============================================
// Endpoints tipados
// ============================================

export const authApi = {
  async login(login: string, senha: string): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      login,
      senha,
    });
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },

  async me(): Promise<{ user: { userId: number; tipo: 'A' | 'P' | 'U'; login: string } }> {
    const { data } =
      await api.get<ApiResponse<{ user: { userId: number; tipo: 'A' | 'P' | 'U'; login: string } }>>(
        '/auth/me'
      );
    if (!data.success) throw new Error(data.error.message);
    return data.data;
  },
};
