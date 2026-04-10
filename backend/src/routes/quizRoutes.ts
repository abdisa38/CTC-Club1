import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import {
	createQuiz,
	submitQuiz,
	getQuizResults,
	getQuizzes,
	getQuizById,
	updateQuiz,
	deleteQuiz,
	addQuizQuestion,
	updateQuizQuestion,
	deleteQuizQuestion,
} from '../controllers/quizController';

const router = express.Router();

router.get('/', protect as any, getQuizzes as any);
router.get('/:id', protect as any, getQuizById as any);

router.post('/', protect as any, authorizeRoles('instructor', 'admin'), createQuiz as any);
router.put('/:id', protect as any, authorizeRoles('instructor', 'admin'), updateQuiz as any);
router.delete('/:id', protect as any, authorizeRoles('instructor', 'admin'), deleteQuiz as any);

router.post('/:id/questions', protect as any, authorizeRoles('instructor', 'admin'), addQuizQuestion as any);
router.put('/:id/questions/:questionId', protect as any, authorizeRoles('instructor', 'admin'), updateQuizQuestion as any);
router.delete('/:id/questions/:questionId', protect as any, authorizeRoles('instructor', 'admin'), deleteQuizQuestion as any);

router.post('/:id/submit', protect as any, submitQuiz as any);
// Make accessible to student so they can see their own past attempts, controller handles filtering
router.get('/:id/results', protect as any, getQuizResults as any);

export default router;
