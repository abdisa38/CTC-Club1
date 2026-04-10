"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastNotification = exports.markAllNotificationsRead = exports.markNotificationRead = exports.getNotifications = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const communityModel_1 = require("../models/communityModel");
const apiResponse_1 = require("../utils/apiResponse");
// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = (0, express_async_handler_1.default)(async (req, res) => {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const filter = { user: req.user._id };
    const total = await notificationModel_1.default.countDocuments(filter);
    const notifications = await notificationModel_1.default.find(filter)
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
exports.markNotificationRead = (0, express_async_handler_1.default)(async (req, res) => {
    const notification = await notificationModel_1.default.findById(req.params.id);
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
    (0, apiResponse_1.sendSuccess)(res, notification, { message: 'Notification marked as read' });
});
// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = (0, express_async_handler_1.default)(async (req, res) => {
    await notificationModel_1.default.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    (0, apiResponse_1.sendSuccess)(res, null, { message: 'All notifications marked as read' });
});
// @desc    Broadcast notification to users
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
exports.broadcastNotification = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, message, type = 'system', role } = req.body;
    if (!title || !message) {
        res.status(400);
        throw new Error('Title and message are required');
    }
    const userFilter = { isDeleted: false };
    if (role) {
        userFilter.role = role;
    }
    const users = await userModel_1.default.find(userFilter).select('_id');
    if (users.length === 0) {
        (0, apiResponse_1.sendSuccess)(res, { count: 0 }, { message: 'No target users found' });
        return;
    }
    const documents = users.map((u) => ({
        user: u._id,
        title,
        message,
        type,
    }));
    await notificationModel_1.default.insertMany(documents);
    // Keep admin broadcasts visible in the public/admin announcement feed.
    await communityModel_1.CommunityPost.create({
        user: req.user._id,
        title,
        content: message,
        category: 'announcement',
        tags: ['broadcast', type, role || 'all'],
    });
    (0, apiResponse_1.sendSuccess)(res, { count: users.length }, { message: 'Broadcast sent successfully' });
});
//# sourceMappingURL=notificationController.js.map