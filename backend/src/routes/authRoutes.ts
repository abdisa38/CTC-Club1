import express from 'express';
import { registerUser, loginUser, getUserProfile, logoutUser } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema } from '../validators/authValidator';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect as any, getUserProfile as any);

export default router;
