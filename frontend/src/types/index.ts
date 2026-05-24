// DTOs espelhando o backend RUTh — PR7 (estrutura com Disciplinas)

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

export interface DisciplinaResumo {
  id: number;
  nome: string;
  turmaId: number;
  professorId: number;
  professor: { id: number; nome: string; email?: string };
  toleranciaAtrasoMin?: number | null;
  janelaPadraoMin?: number | null;
  _count?: { sessoes: number };
}

export interface DisciplinaDoProfessor {
  id: number;
  nome: string;
  turmaId: number;
  professorId: number;
  turma: { id: number; nome: string; periodo: string };
  _count?: { sessoes: number };
}

export interface TurmaResumo {
  id: number;
  nome: string;
  periodo: string;
  disciplinas: DisciplinaResumo[];
  _count: { matriculas: number };
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

export type StatusSessao = 'ABERTA' | 'ENCERRADA' | 'PAUSADA';
export type StatusPresenca = 'CONFIRMADO' | 'PENDENTE' | 'INVALIDO';
export type TipoPergunta =
  | 'MULTIPLA'
  | 'MULTIPLA_MULTI'
  | 'VF'
  | 'ENQUETE'
  | 'TEXTO'
  | 'IMAGEM';

export interface SessaoDisciplina {
  id: number;
  nome: string;
  turma: { id: number; nome: string; periodo: string };
}

export interface SessaoBasica {
  id: number;
  disciplinaId: number;
  professorId: number;
  dataAbertura: string;
  dataEncerramento: string | null;
  janelaMin: number;
  status: StatusSessao;
  codigo: string;
  disciplina: SessaoDisciplina;
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

export interface SessaoDetalhe extends Omit<SessaoBasica, 'disciplina'> {
  disciplina: {
    id: number;
    nome: string;
    turma: {
      id: number;
      nome: string;
      periodo: string;
      _count: { matriculas: number };
    };
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

export interface LinhaRelatorio {
  alunoId: number;
  alunoNome: string;
  matricula: string | null;
  totalSessoes: number;
  presencasConfirmadas: number;
  presencasPendentes: number;
  faltas: number;
  percentualPresenca: number;
  ultimaPresenca: string | null;
  aprovado: boolean;
}

export interface RelatorioDisciplina {
  disciplina: {
    id: number;
    nome: string;
    turma: { id: number; nome: string; periodo: string };
    professor: { id: number; nome: string };
  };
  filtro: { dataInicio?: string; dataFim?: string };
  geradoEm: string;
  totalSessoesConsideradas: number;
  presencaMinima: number;
  linhas: LinhaRelatorio[];
}

export interface Parametro {
  id: number;
  chave: string;
  descricao: string;
  valor: string;
  tipo: string;
  ativo: boolean;
}

export interface LogAuditoria {
  id: number;
  usuarioId: number | null;
  acao: string;
  entidade: string;
  dataEvento: string;
  detalhes: string | null;
  ip: string | null;
  usuario: { id: number; nome: string; login: string } | null;
}

export interface ListaAuditoria {
  logs: LogAuditoria[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

export interface ResultadoImportacao {
  total: number;
  criados: number;
  matriculados: number;
  erros: Array<{ linha: number; nome: string; motivo: string }>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
