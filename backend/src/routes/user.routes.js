import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { postCreateCashier, getCashiers, patchCashier } from '../controllers/user.controller.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.post('/', postCreateCashier);
router.get('/', getCashiers);
router.patch('/:id', patchCashier);

export default router;