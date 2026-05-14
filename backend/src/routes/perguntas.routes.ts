import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  InteracaoController,
  responderSchema,
  idParam,
} from '../controllers/InteracaoController';

const router = Router();
router.use(authenticate);

// Encerrar pergunta — só professor (validado no service)
router.post(
  '/:id/encerrar',
  rbac('P'),
  validate(idParam, 'params'),
  InteracaoController.encerrar,
);

// Responder — aluno
router.post(
  '/:id/responder',
  rbac('U'),
  validate(idParam, 'params'),
  validate(responderSchema),
  InteracaoController.responder,
);

// Resultados — qualquer autenticado
router.get('/:id/resultados', validate(idParam, 'params'), InteracaoController.resultados);

export default router;
