import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import Notification from '../models/notificationModel';
import User from '../models/userModel';
import { sendSuccess } from '../utils/apiResponse';

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;

  const filter = { user: req.user._id };
  const total = await Notification.countDocuments(filter);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: notifications,
    notifications,
    page,
    pages: Math.ceil(total / pageSize),
    total,
  });
});

// @desc    Mark one notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this notification');
  }

  notification.isRead = true;
  await notification.save();

  sendSuccess(res, notification, { message: 'Notification marked as read' });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
  sendSuccess(res, null, { message: 'All notifications marked as read' });
});

// @desc    Broadcast notification to users
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
export const broadcastNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, message, type = 'system', role } = req.body as {
    title?: string;
    message?: string;
    type?: 'system' | 'course_update' | 'project_graded' | 'achievement' | 'message';
    role?: 'student' | 'instructor' | 'admin';
  };

  if (!title || !message) {
    res.status(400);
    throw new Error('Title and message are required');
  }

  const userFilter: any = { isDeleted: false };
  if (role) {
    userFilter.role = role;
  }

  const users = await User.find(userFilter).select('_id');
  if (users.length === 0) {
    sendSuccess(res, { count: 0 }, { message: 'No target users found' });
    return;
  }

  const documents = users.map((u) => ({
    user: u._id,
    title,
    message,
    type,
  }));

  await Notification.insertMany(documents);

  sendSuccess(res, { count: users.length }, { message: 'Broadcast sent successfully' });
});
