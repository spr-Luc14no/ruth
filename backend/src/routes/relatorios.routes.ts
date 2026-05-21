import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  RelatorioController,
  idParam,
  filtroQuery,
} from '../controllers/RelatorioController';

const router = Router();
router.use(authenticate);

// Apenas admin e professor podem ver relatórios.
// O service valida ownership do professor sobre a turma.

router.get(
  '/turmas/:id',
  rbac('A', 'P'),
  validate(idParam, 'params'),
  validate(filtroQuery, 'query'),
  RelatorioController.resumo,
);

router.get(
  '/turmas/:id/csv',
  rbac('A', 'P'),
  validate(idParam, 'params'),
  validate(filtroQuery, 'query'),
  RelatorioController.csv,
);

router.get(
  '/turmas/:id/pdf',
  rbac('A', 'P'),
  validate(idParam, 'params'),
  validate(filtroQuery, 'query'),
  RelatorioController.pdf,
);

export default router;
