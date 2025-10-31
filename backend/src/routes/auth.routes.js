import { Router } from 'express';
import { register, login, logout, getProfile } from '../controllers/auth.controller.js';
import { authRequired } from '../middlewares/authRequired.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authRequired, getProfile);

export default router;
