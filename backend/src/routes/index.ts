import { Router } from 'express';
import authRoutes from './auth.routes';
import usuariosRoutes from './usuarios.routes';
import turmasRoutes from './turmas.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/turmas', turmasRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

export default router;
