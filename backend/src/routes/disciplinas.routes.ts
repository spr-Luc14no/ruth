import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { DisciplinaController, criarDisciplinaSchema, atualizarDisciplinaSchema, idParam } from '../controllers/DisciplinaController';

const router = Router();
router.use(authenticate);
router.get('/minhas', rbac('P'), DisciplinaController.minhas);
router.post('/', rbac('A'), validate(criarDisciplinaSchema), DisciplinaController.criar);
router.put('/:id', rbac('A'), validate(idParam, 'params'), validate(atualizarDisciplinaSchema), DisciplinaController.atualizar);
router.delete('/:id', rbac('A'), validate(idParam, 'params'), DisciplinaController.excluir);
export default router;
