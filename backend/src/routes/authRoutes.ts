import express from 'express';
import {
	registerUser,
	loginUser,
	getUserProfile,
	logoutUser,
	getUsers,
	updateUserRole,
	updateUserStatus,
	softDeleteUser,
	getActivityLogs,
} from '../controllers/authController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema } from '../validators/authValidator';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect as any, getUserProfile as any);

router.get('/users', protect as any, authorizeRoles('admin'), getUsers as any);
router.put('/users/:id/role', protect as any, authorizeRoles('admin'), updateUserRole as any);
router.put('/users/:id/status', protect as any, authorizeRoles('admin'), updateUserStatus as any);
router.delete('/users/:id', protect as any, authorizeRoles('admin'), softDeleteUser as any);
router.get('/activity-logs', protect as any, authorizeRoles('admin'), getActivityLogs as any);

export default router;
