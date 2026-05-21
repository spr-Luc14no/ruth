import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  AuditoriaController,
  filtroAuditoriaQuery,
} from '../controllers/AuditoriaController';

const router = Router();
router.use(authenticate);

// Auditoria — só admin
router.get(
  '/',
  rbac('A'),
  validate(filtroAuditoriaQuery, 'query'),
  AuditoriaController.listar,
);

export default router;
