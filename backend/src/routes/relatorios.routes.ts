import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { RelatorioController, idParam, filtroQuery } from '../controllers/RelatorioController';

const router = Router();
router.use(authenticate);
router.get('/disciplinas/:id', rbac('A', 'P'), validate(idParam, 'params'), validate(filtroQuery, 'query'), RelatorioController.resumo);
router.get('/disciplinas/:id/csv', rbac('A', 'P'), validate(idParam, 'params'), validate(filtroQuery, 'query'), RelatorioController.csv);
router.get('/disciplinas/:id/pdf', rbac('A', 'P'), validate(idParam, 'params'), validate(filtroQuery, 'query'), RelatorioController.pdf);
export default router;
