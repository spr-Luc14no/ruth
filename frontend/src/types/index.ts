// DTOs espelhando o backend RUTh
// Mantido manualmente em sincronia com backend/src/types

export type Perfil = 'A' | 'P' | 'U';
export type StatusUsuario = 'A' | 'B';

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
  status?: StatusUsuario;
  matricula?: string | null;
  criadoEm?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

// ============ Turmas ============

export interface TurmaResumo {
  id: number;
  nome: string;
  periodo: string;
  disciplina: string;
  professorId: number;
  professor: { id: number; nome: string; email?: string };
  _count: { matriculas: number; sessoes: number };
}

export interface AlunoMatriculado {
  id: number;
  nome: string;
  email: string;
  matricula: string | null;
  status: StatusUsuario;
}

export interface MatriculaItem {
  alunoId: number;
  turmaId: number;
  aluno: AlunoMatriculado;
}

export interface TurmaDetalhe extends TurmaResumo {
  matriculas: MatriculaItem[];
}

// ============ Padrão de resposta da API ============

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
