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
  DisciplinaResumo,
  DisciplinaDoProfessor,
  SessaoBasica,
  SessaoDetalhe,
  TipoPergunta,
  PerguntaPublica,
  ResultadosPergunta,
  RelatorioDisciplina,
  Parametro,
  ListaAuditoria,
  ResultadoImportacao,
} from '@/types';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = axios.create({ baseURL: `${baseURL}/api`, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
    if (data && data.success === false) return data.error.message;
    if (err.code === 'ECONNABORTED') return 'Tempo de resposta esgotado.';
    if (!err.response) return 'Sem conexão com o servidor.';
    return `Erro ${err.response.status}: ${err.response.statusText}`;
  }
  return 'Erro inesperado.';
}

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

export const authApi = {
  login: (login: string, senha: string) =>
    unwrap<LoginResponse>(api.post('/auth/login', { login, senha })),
  me: () => unwrap<{ user: { userId: number; tipo: Perfil; login: string } }>(api.get('/auth/me')),
};

export interface ListarUsuariosParams { tipo?: Perfil; status?: StatusUsuario; busca?: string; }
export interface CriarUsuarioPayload { nome: string; email: string; login: string; senha: string; tipo: Perfil; matricula?: string | null; }
export interface AtualizarUsuarioPayload { nome?: string; email?: string; login?: string; senha?: string; matricula?: string | null; status?: StatusUsuario; }

export const usuariosApi = {
  listar: (params: ListarUsuariosParams = {}) => unwrap<Usuario[]>(api.get('/usuarios', { params })),
  buscar: (id: number) => unwrap<Usuario>(api.get(`/usuarios/${id}`)),
  criar: (payload: CriarUsuarioPayload) => unwrap<Usuario>(api.post('/usuarios', payload)),
  atualizar: (id: number, payload: AtualizarUsuarioPayload) => unwrap<Usuario>(api.put(`/usuarios/${id}`, payload)),
  bloquear: (id: number) => unwrap<Usuario>(api.post(`/usuarios/${id}/bloquear`)),
  reativar: (id: number) => unwrap<Usuario>(api.post(`/usuarios/${id}/reativar`)),
};

export interface CriarTurmaPayload { nome: string; periodo: string; }
export interface AtualizarTurmaPayload { nome?: string; periodo?: string; }

export const turmasApi = {
  listar: () => unwrap<TurmaResumo[]>(api.get('/turmas')),
  buscar: (id: number) => unwrap<TurmaDetalhe>(api.get(`/turmas/${id}`)),
  criar: (payload: CriarTurmaPayload) => unwrap<TurmaResumo>(api.post('/turmas', payload)),
  atualizar: (id: number, payload: AtualizarTurmaPayload) => unwrap<TurmaResumo>(api.put(`/turmas/${id}`, payload)),
  excluir: (id: number) => unwrap<{ id: number }>(api.delete(`/turmas/${id}`)),
  disciplinas: (turmaId: number) => unwrap<DisciplinaResumo[]>(api.get(`/turmas/${turmaId}/disciplinas`)),
  matricular: (turmaId: number, alunoId: number) =>
    unwrap<{ alunoId: number; turmaId: number }>(api.post(`/turmas/${turmaId}/matriculas`, { alunoId })),
  desmatricular: (turmaId: number, alunoId: number) =>
    unwrap<{ alunoId: number; turmaId: number }>(api.delete(`/turmas/${turmaId}/matriculas/${alunoId}`)),
  importarAlunos: (csv: string, turmaId?: number) =>
    unwrap<ResultadoImportacao>(api.post('/turmas/importar-alunos', { csv, turmaId })),
};

export interface CriarDisciplinaPayload { nome: string; turmaId: number; professorId: number; toleranciaAtrasoMin?: number | null; janelaPadraoMin?: number | null; }
export interface AtualizarDisciplinaPayload { nome?: string; professorId?: number; toleranciaAtrasoMin?: number | null; janelaPadraoMin?: number | null; }

export const disciplinasApi = {
  minhas: () => unwrap<DisciplinaDoProfessor[]>(api.get('/disciplinas/minhas')),
  criar: (payload: CriarDisciplinaPayload) => unwrap<DisciplinaResumo>(api.post('/disciplinas', payload)),
  atualizar: (id: number, payload: AtualizarDisciplinaPayload) => unwrap<DisciplinaResumo>(api.put(`/disciplinas/${id}`, payload)),
  excluir: (id: number) => unwrap<{ id: number }>(api.delete(`/disciplinas/${id}`)),
};

export interface CriarSessaoPayload { disciplinaId: number; janelaMin?: number; }

export const sessoesApi = {
  listar: () => unwrap<Array<SessaoBasica & { _count: { presencas: number } }>>(api.get('/sessoes')),
  criar: (payload: CriarSessaoPayload) => unwrap<SessaoBasica>(api.post('/sessoes', payload)),
  buscar: (id: number) => unwrap<SessaoDetalhe>(api.get(`/sessoes/${id}`)),
  buscarPorCodigo: (codigo: string) => unwrap<SessaoBasica>(api.get(`/sessoes/codigo/${codigo.toUpperCase()}`)),
  ativaDoAluno: () => unwrap<SessaoBasica | null>(api.get('/sessoes/ativa-do-aluno')),
  checkin: (sessaoId: number) =>
    unwrap<{ id: number; sessaoId: number; status: string; atrasoMin: number; marcadoEm: string }>(api.post(`/sessoes/${sessaoId}/checkin`)),
  encerrar: (sessaoId: number) => unwrap<SessaoBasica>(api.post(`/sessoes/${sessaoId}/encerrar`)),
};

export interface DispararPerguntaPayload { enunciado: string; tipo: TipoPergunta; opcoes?: Array<{ descricao: string; correta?: boolean }>; }

export const interacoesApi = {
  disparar: (sessaoId: number, payload: DispararPerguntaPayload) => unwrap<PerguntaPublica>(api.post(`/sessoes/${sessaoId}/perguntas`, payload)),
  encerrar: (perguntaId: number) => unwrap<PerguntaPublica>(api.post(`/perguntas/${perguntaId}/encerrar`)),
  responder: (perguntaId: number, opcaoId?: number, textoLivre?: string) =>
    unwrap<{ resposta: unknown; resultados: ResultadosPergunta }>(api.post(`/perguntas/${perguntaId}/responder`, { opcaoId, textoLivre })),
  resultados: (perguntaId: number) => unwrap<ResultadosPergunta>(api.get(`/perguntas/${perguntaId}/resultados`)),
};

export interface FiltroRelatorio { dataInicio?: string; dataFim?: string; }

export const relatoriosApi = {
  resumo: (disciplinaId: number, filtro: FiltroRelatorio = {}) =>
    unwrap<RelatorioDisciplina>(api.get(`/relatorios/disciplinas/${disciplinaId}`, { params: filtro })),
  downloadCSV: async (disciplinaId: number, filtro: FiltroRelatorio = {}) => {
    const response = await api.get(`/relatorios/disciplinas/${disciplinaId}/csv`, { params: filtro, responseType: 'blob' });
    triggerDownload(response.data, extractFilename(response, 'relatorio.csv'));
  },
  downloadPDF: async (disciplinaId: number, filtro: FiltroRelatorio = {}) => {
    const response = await api.get(`/relatorios/disciplinas/${disciplinaId}/pdf`, { params: filtro, responseType: 'blob' });
    triggerDownload(response.data, extractFilename(response, 'relatorio.pdf'));
  },
};

export interface AtualizarParametroPayload { valor: string; ativo?: boolean; }

export const parametrosApi = {
  listar: () => unwrap<Parametro[]>(api.get('/parametros')),
  atualizar: (id: number, payload: AtualizarParametroPayload) => unwrap<Parametro>(api.put(`/parametros/${id}`, payload)),
};

export interface FiltroAuditoria { acao?: string; entidade?: string; usuarioId?: number; dataInicio?: string; dataFim?: string; pagina?: number; porPagina?: number; }

export const auditoriaApi = {
  listar: (filtro: FiltroAuditoria = {}) => unwrap<ListaAuditoria>(api.get('/auditoria', { params: filtro })),
};

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

function extractFilename(response: { headers: Record<string, unknown> }, fallback: string): string {
  const disposition = response.headers['content-disposition'];
  if (typeof disposition === 'string') {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match) return match[1];
  }
  return fallback;
}
