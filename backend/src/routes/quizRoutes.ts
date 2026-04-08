import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { createQuiz, submitQuiz, getQuizResults, getQuizzes, getQuizById } from '../controllers/quizController';

const router = express.Router();

router.get('/', protect as any, getQuizzes as any);
router.get('/:id', protect as any, getQuizById as any);

router.post('/', protect as any, authorizeRoles('instructor', 'admin'), createQuiz as any);
router.post('/:id/submit', protect as any, submitQuiz as any);
// Make accessible to student so they can see their own past attempts, controller handles filtering
router.get('/:id/results', protect as any, getQuizResults as any);

export default router;
