import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastNotification,
} from '../controllers/notificationController';

const router = express.Router();

router.get('/', protect as any, getNotifications as any);
router.patch('/read-all', protect as any, markAllNotificationsRead as any);
router.patch('/:id/read', protect as any, markNotificationRead as any);
router.post('/broadcast', protect as any, authorizeRoles('admin'), broadcastNotification as any);

export default router;
