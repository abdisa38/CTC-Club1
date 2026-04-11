import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
	getDashboardMetrics,
	getPublicStats,
	getAdminAnalytics,
	getLeaderboard,
	getDashboardResources,
	getDashboardAnnouncements,
	getInstructorStudents,
	getInstructorAnalytics,
	getAdminGlobalSearch,
	getInstructorGlobalSearch,
} from '../controllers/dashboardController';

const router = express.Router();

router.get('/public-stats', getPublicStats as any);
router.get('/announcements', getDashboardAnnouncements as any);
router.get('/metrics', protect as any, getDashboardMetrics as any);
router.get('/analytics', protect as any, getAdminAnalytics as any);
router.get('/leaderboard', protect as any, getLeaderboard as any);
router.get('/resources', protect as any, getDashboardResources as any);
router.get('/instructor/students', protect as any, getInstructorStudents as any);
router.get('/instructor/analytics', protect as any, getInstructorAnalytics as any);
router.get('/instructor/search', protect as any, getInstructorGlobalSearch as any);
router.get('/admin/search', protect as any, getAdminGlobalSearch as any);

export default router;