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

// ============ Sessões ============

export type StatusSessao = 'ABERTA' | 'ENCERRADA' | 'PAUSADA';
export type StatusPresenca = 'CONFIRMADO' | 'PENDENTE' | 'INVALIDO';
export type TipoPergunta = 'MULTIPLA' | 'VF' | 'ENQUETE' | 'TEXTO';

export interface SessaoBasica {
  id: number;
  turmaId: number;
  professorId: number;
  dataAbertura: string;
  dataEncerramento: string | null;
  janelaMin: number;
  status: StatusSessao;
  codigo: string;
  turma: { id: number; nome: string; disciplina: string };
}

export interface PresencaItem {
  id: number;
  sessaoId: number;
  marcadoEm: string;
  atrasoMin: number;
  status: StatusPresenca;
  aluno: { id: number; nome: string; matricula: string | null };
}

export interface OpcaoPergunta {
  id: number;
  descricao: string;
}

export interface OpcaoPerguntaCompleta extends OpcaoPergunta {
  correta: boolean;
}

export interface PerguntaPublica {
  id: number;
  enunciado: string;
  tipo: TipoPergunta;
  ativa: boolean;
  opcoes: OpcaoPergunta[];
}

export interface ResultadoOpcao {
  opcaoId: number;
  descricao: string;
  correta: boolean;
  count: number;
  percentual: number;
}

export interface ResultadosPergunta {
  perguntaId: number;
  enunciado: string;
  tipo: TipoPergunta;
  ativa: boolean;
  totalRespostas: number;
  porOpcao: ResultadoOpcao[];
}

export interface SessaoDetalhe extends SessaoBasica {
  turma: {
    id: number;
    nome: string;
    disciplina: string;
    _count: { matriculas: number };
  };
  presencas: PresencaItem[];
  perguntas: Array<
    PerguntaPublica & {
      _count: { respostas: number };
      opcoes: OpcaoPerguntaCompleta[];
      criadaEm: string;
    }
  >;
}

// ============ Eventos Socket ============

export interface EventoPresencaNova {
  sessaoId: number;
  presenca: {
    id: number;
    aluno: { id: number; nome: string; matricula: string | null };
    marcadoEm: string;
    atrasoMin: number;
    status: StatusPresenca;
  };
}

export interface EventoPerguntaDisparada {
  sessaoId: number;
  pergunta: PerguntaPublica;
}

export interface EventoRespostaRecebida {
  perguntaId: number;
  alunoId: number;
  resultados: ResultadosPergunta;
}

export interface EventoSessaoEncerrada {
  sessaoId: number;
  encerradaEm: string;
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
