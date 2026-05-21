import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  ParametroController,
  idParam,
  atualizarParametroSchema,
} from '../controllers/ParametroController';

const router = Router();
router.use(authenticate);

// Parâmetros — só admin
router.get('/', rbac('A'), ParametroController.listar);
router.put(
  '/:id',
  rbac('A'),
  validate(idParam, 'params'),
  validate(atualizarParametroSchema),
  ParametroController.atualizar,
);

export default router;
