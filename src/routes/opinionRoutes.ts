import { Router } from 'express';
import { OpinionController } from '../controllers/OpinionController';

const router = Router();
const controller = new OpinionController();

router.get('/opinions', controller.getOpinions);

export default router;