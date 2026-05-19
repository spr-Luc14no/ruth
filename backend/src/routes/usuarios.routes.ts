import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  UsuarioController,
  criarUsuarioSchema,
  atualizarUsuarioSchema,
  listarUsuariosQuery,
  idParam,
} from '../controllers/UsuarioController';

const router = Router();

// Todas as rotas exigem autenticação + perfil Admin (RN05)
router.use(authenticate, rbac('A'));

router.get('/', validate(listarUsuariosQuery, 'query'), UsuarioController.listar);
router.get('/:id', validate(idParam, 'params'), UsuarioController.buscar);
router.post('/', validate(criarUsuarioSchema), UsuarioController.criar);
router.put(
  '/:id',
  validate(idParam, 'params'),
  validate(atualizarUsuarioSchema),
  UsuarioController.atualizar,
);
router.post('/:id/bloquear', validate(idParam, 'params'), UsuarioController.bloquear);
router.post('/:id/reativar', validate(idParam, 'params'), UsuarioController.reativar);

export default router;
