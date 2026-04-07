import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { createQuiz, submitQuiz, getQuizResults } from '../controllers/quizController';

const router = express.Router();

router.post('/', protect as any, authorizeRoles('instructor', 'admin'), createQuiz as any);
router.post('/:id/submit', protect as any, submitQuiz as any);
router.get('/:id/results', protect as any, authorizeRoles('instructor', 'admin'), getQuizResults as any);

export default router;
