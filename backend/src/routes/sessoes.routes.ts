import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  SessaoController,
  criarSessaoSchema,
  idParam,
  codigoParam,
} from '../controllers/SessaoController';
import {
  InteracaoController,
  dispararPerguntaSchema,
  idParam as idParamP,
} from '../controllers/InteracaoController';

const router = Router();
router.use(authenticate);

// Listagem do professor (sessões dele)
router.get('/', rbac('P'), SessaoController.listarDoProfessor);

// Sessão ativa do aluno (precisa vir ANTES de /:id pra não bater na rota dinâmica)
router.get('/ativa-do-aluno', rbac('U'), SessaoController.ativaDoAluno);

// Criar sessão — só professor
router.post('/', rbac('P'), validate(criarSessaoSchema), SessaoController.criar);

// Encerrar — só professor (a propriedade é validada no service)
router.post(
  '/:id/encerrar',
  rbac('P'),
  validate(idParam, 'params'),
  SessaoController.encerrar,
);

// Buscar por código — aluno usa pra entrar
router.get(
  '/codigo/:codigo',
  rbac('U'),
  validate(codigoParam, 'params'),
  SessaoController.buscarPorCodigo,
);

// Check-in — aluno
router.post(
  '/:id/checkin',
  rbac('U'),
  validate(idParam, 'params'),
  SessaoController.checkin,
);

// Detalhes — qualquer autenticado (mas aluno só vê o que é dele em telas)
router.get('/:id', validate(idParam, 'params'), SessaoController.detalhar);

// Disparar pergunta na sessão — professor
router.post(
  '/:id/perguntas',
  rbac('P'),
  validate(idParamP, 'params'),
  validate(dispararPerguntaSchema),
  InteracaoController.dispararEm,
);

export default router;
