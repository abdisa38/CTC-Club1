import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import {
	createProject,
	updateProject,
	deleteProject,
	submitProject,
	reviewProject,
	getProjects,
	getProjectSubmissions,
} from '../controllers/projectController';

const router = express.Router();

router.get('/', protect as any, getProjects as any);
router.get('/submissions', protect as any, getProjectSubmissions as any);

router.post('/', protect as any, authorizeRoles('instructor', 'admin'), createProject as any);
router.put('/:id', protect as any, authorizeRoles('instructor', 'admin'), updateProject as any);
router.delete('/:id', protect as any, authorizeRoles('instructor', 'admin'), deleteProject as any);
router.post('/:id/submit', protect as any, submitProject as any);
router.put('/submissions/:submissionId/review', protect as any, authorizeRoles('instructor', 'admin'), reviewProject as any);

export default router;
