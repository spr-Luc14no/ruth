import axios, { AxiosError } from 'axios';
import { authStorage } from '@/lib/auth';
import type {
  ApiResponse,
  LoginResponse,
  Usuario,
  StatusUsuario,
  Perfil,
  TurmaResumo,
  TurmaDetalhe,
  SessaoBasica,
  SessaoDetalhe,
  TipoPergunta,
  PerguntaPublica,
  ResultadosPergunta,
} from '@/types';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && authStorage.getToken()) {
      authStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

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

/**
 * Verifica se o erro recebido corresponde a um código específico
 * retornado pela API (`error.code`). Útil pra tratar erros de negócio
 * conhecidos como sucessos (ex: JA_REGISTRADO).
 */
export function isApiErrorCode(err: unknown, code: string): boolean {
  if (!axios.isAxiosError(err)) return false;
  const data = err.response?.data as ApiResponse<unknown> | undefined;
  return data?.success === false && data.error.code === code;
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.success) throw new Error(data.error.message);
  return data.data;
}

// ============================================
// Auth
// ============================================

export const authApi = {
  login: (login: string, senha: string) =>
    unwrap<LoginResponse>(api.post('/auth/login', { login, senha })),
  me: () =>
    unwrap<{ user: { userId: number; tipo: Perfil; login: string } }>(api.get('/auth/me')),
};

// ============================================
// Usuários
// ============================================

export interface ListarUsuariosParams {
  tipo?: Perfil;
  status?: StatusUsuario;
  busca?: string;
}

export interface CriarUsuarioPayload {
  nome: string;
  email: string;
  login: string;
  senha: string;
  tipo: Perfil;
  matricula?: string | null;
}

export interface AtualizarUsuarioPayload {
  nome?: string;
  email?: string;
  login?: string;
  senha?: string;
  matricula?: string | null;
  status?: StatusUsuario;
}

export const usuariosApi = {
  listar: (params: ListarUsuariosParams = {}) =>
    unwrap<Usuario[]>(api.get('/usuarios', { params })),
  buscar: (id: number) => unwrap<Usuario>(api.get(`/usuarios/${id}`)),
  criar: (payload: CriarUsuarioPayload) => unwrap<Usuario>(api.post('/usuarios', payload)),
  atualizar: (id: number, payload: AtualizarUsuarioPayload) =>
    unwrap<Usuario>(api.put(`/usuarios/${id}`, payload)),
  bloquear: (id: number) => unwrap<Usuario>(api.post(`/usuarios/${id}/bloquear`)),
  reativar: (id: number) => unwrap<Usuario>(api.post(`/usuarios/${id}/reativar`)),
};

// ============================================
// Turmas
// ============================================

export interface CriarTurmaPayload {
  nome: string;
  periodo: string;
  disciplina: string;
  professorId: number;
}

export interface AtualizarTurmaPayload {
  nome?: string;
  periodo?: string;
  disciplina?: string;
  professorId?: number;
}

export const turmasApi = {
  listar: () => unwrap<TurmaResumo[]>(api.get('/turmas')),
  buscar: (id: number) => unwrap<TurmaDetalhe>(api.get(`/turmas/${id}`)),
  criar: (payload: CriarTurmaPayload) => unwrap<TurmaResumo>(api.post('/turmas', payload)),
  atualizar: (id: number, payload: AtualizarTurmaPayload) =>
    unwrap<TurmaResumo>(api.put(`/turmas/${id}`, payload)),
  excluir: (id: number) => unwrap<{ id: number }>(api.delete(`/turmas/${id}`)),
  matricular: (turmaId: number, alunoId: number) =>
    unwrap<{ alunoId: number; turmaId: number }>(
      api.post(`/turmas/${turmaId}/matriculas`, { alunoId }),
    ),
  desmatricular: (turmaId: number, alunoId: number) =>
    unwrap<{ alunoId: number; turmaId: number }>(
      api.delete(`/turmas/${turmaId}/matriculas/${alunoId}`),
    ),
};

// ============================================
// Sessões
// ============================================

export interface CriarSessaoPayload {
  turmaId: number;
  janelaMin?: number;
}

export const sessoesApi = {
  listar: () =>
    unwrap<Array<SessaoBasica & { _count: { presencas: number } }>>(api.get('/sessoes')),
  criar: (payload: CriarSessaoPayload) => unwrap<SessaoBasica>(api.post('/sessoes', payload)),
  buscar: (id: number) => unwrap<SessaoDetalhe>(api.get(`/sessoes/${id}`)),
  buscarPorCodigo: (codigo: string) =>
    unwrap<SessaoBasica>(api.get(`/sessoes/codigo/${codigo.toUpperCase()}`)),
  /** Sessão ativa em que o aluno já tem presença registrada (ou null). */
  ativaDoAluno: () => unwrap<SessaoBasica | null>(api.get('/sessoes/ativa-do-aluno')),
  checkin: (sessaoId: number) =>
    unwrap<{
      id: number;
      sessaoId: number;
      status: string;
      atrasoMin: number;
      marcadoEm: string;
    }>(api.post(`/sessoes/${sessaoId}/checkin`)),
  encerrar: (sessaoId: number) =>
    unwrap<SessaoBasica>(api.post(`/sessoes/${sessaoId}/encerrar`)),
};

// ============================================
// Interações (perguntas)
// ============================================

export interface DispararPerguntaPayload {
  enunciado: string;
  tipo: TipoPergunta;
  opcoes?: Array<{ descricao: string; correta?: boolean }>;
}

export const interacoesApi = {
  disparar: (sessaoId: number, payload: DispararPerguntaPayload) =>
    unwrap<PerguntaPublica>(api.post(`/sessoes/${sessaoId}/perguntas`, payload)),
  encerrar: (perguntaId: number) =>
    unwrap<PerguntaPublica>(api.post(`/perguntas/${perguntaId}/encerrar`)),
  responder: (perguntaId: number, opcaoId?: number, textoLivre?: string) =>
    unwrap<{ resposta: unknown; resultados: ResultadosPergunta }>(
      api.post(`/perguntas/${perguntaId}/responder`, { opcaoId, textoLivre }),
    ),
  resultados: (perguntaId: number) =>
    unwrap<ResultadosPergunta>(api.get(`/perguntas/${perguntaId}/resultados`)),
};
