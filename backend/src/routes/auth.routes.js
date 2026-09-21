import { Router } from 'express';
import { postLogin, postLogout, getMe } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', postLogin);
router.post('/logout', postLogout);
router.get('/me', getMe);

export default router;
