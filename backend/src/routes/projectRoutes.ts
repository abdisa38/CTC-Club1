import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { createProject, submitProject, reviewProject } from '../controllers/projectController';

const router = express.Router();

router.post('/', protect as any, authorizeRoles('instructor', 'admin'), createProject as any);
router.post('/:id/submit', protect as any, submitProject as any);
router.put('/submissions/:submissionId/review', protect as any, authorizeRoles('instructor', 'admin'), reviewProject as any);

export default router;
