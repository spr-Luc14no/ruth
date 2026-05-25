import { Router } from 'express';
import authRoutes from './auth.routes';
import usuariosRoutes from './usuarios.routes';
import turmasRoutes from './turmas.routes';
import disciplinasRoutes from './disciplinas.routes';
import sessoesRoutes from './sessoes.routes';
import perguntasRoutes from './perguntas.routes';
import relatoriosRoutes from './relatorios.routes';
import parametrosRoutes from './parametros.routes';
import auditoriaRoutes from './auditoria.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/turmas', turmasRoutes);
router.use('/disciplinas', disciplinasRoutes);
router.use('/sessoes', sessoesRoutes);
router.use('/perguntas', perguntasRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/parametros', parametrosRoutes);
router.use('/auditoria', auditoriaRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

export default router;
