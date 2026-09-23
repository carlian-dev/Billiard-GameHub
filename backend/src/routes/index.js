import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { ok } from '../utils/errors.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Foundation RBAC probes (no business features).
// Used by foundation verification to prove backend role enforcement.
router.get('/admin/ping', requireAuth, requireRole('ADMIN'), (req, res) => {
  res.status(200).json(ok({ role: req.user.role, area: 'admin' }));
});

router.get('/cashier/ping', requireAuth, requireRole('CASHIER'), (req, res) => {
  res.status(200).json(ok({ role: req.user.role, area: 'cashier' }));
});

export default router;
