import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getDashboardMetrics } from '../controllers/dashboardController';

const router = express.Router();

router.get('/metrics', protect as any, getDashboardMetrics as any);

export default router;