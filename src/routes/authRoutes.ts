import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

// API-001: 投稿用認証 (Login cho nhân viên)
router.post('/employee/login', login);

export default router;