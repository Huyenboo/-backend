
import { Router } from 'express';
import { submitForm } from '../controllers/submissionController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
//API005 投稿完了
router.post('/complete', authMiddleware, submitForm);

export default router;