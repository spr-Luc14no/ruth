import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  TurmaController,
  criarTurmaSchema,
  atualizarTurmaSchema,
  idParam,
  matriculaParam,
  matricularSchema,
} from '../controllers/TurmaController';

const router = Router();

router.use(authenticate);

// Listar e ver: Admin e Professor (controller filtra por professorId quando é P)
router.get('/', rbac('A', 'P'), TurmaController.listar);
router.get('/:id', rbac('A', 'P'), validate(idParam, 'params'), TurmaController.buscar);

// Criar/Editar/Excluir: só Admin
router.post('/', rbac('A'), validate(criarTurmaSchema), TurmaController.criar);
router.put(
  '/:id',
  rbac('A'),
  validate(idParam, 'params'),
  validate(atualizarTurmaSchema),
  TurmaController.atualizar,
);
router.delete('/:id', rbac('A'), validate(idParam, 'params'), TurmaController.excluir);

// Matrículas: só Admin
router.post(
  '/:id/matriculas',
  rbac('A'),
  validate(idParam, 'params'),
  validate(matricularSchema),
  TurmaController.matricular,
);
router.delete(
  '/:id/matriculas/:alunoId',
  rbac('A'),
  validate(matriculaParam, 'params'),
  TurmaController.desmatricular,
);

export default router;
