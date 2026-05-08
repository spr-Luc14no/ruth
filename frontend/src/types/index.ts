// DTOs espelhando o backend RUTh
// Mantido manualmente em sincronia com backend/src/types

export type Perfil = 'A' | 'P' | 'U';

export const PERFIL_LABELS: Record<Perfil, string> = {
  A: 'Administrador',
  P: 'Professor',
  U: 'Aluno',
};

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  login: string;
  tipo: Perfil;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

// Padrão de resposta da API
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
