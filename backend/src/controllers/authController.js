"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityLogs = exports.softDeleteUser = exports.updateUserStatus = exports.updateUserRole = exports.getUsers = exports.getUserProfile = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const ticketModel_1 = __importDefault(require("../models/ticketModel"));
const generateToken_1 = __importStar(require("../utils/generateToken"));
const apiResponse_1 = require("../utils/apiResponse");
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await userModel_1.default.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    // Hardcode "student" so anonymous public API cannot create admin
    const user = await userModel_1.default.create({
        name,
        email,
        password,
        role: 'student',
    });
    if (user) {
        (0, generateToken_1.default)(res, user._id.toString(), user.role);
        (0, apiResponse_1.sendSuccess)(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        }, { statusCode: 201, message: 'User registered successfully' });
    }
    else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel_1.default.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        (0, generateToken_1.default)(res, user._id.toString(), user.role);
        user.lastLogin = new Date();
        await user.save();
        (0, apiResponse_1.sendSuccess)(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        }, { message: 'Login successful' });
    }
    else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});
// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logoutUser = (0, express_async_handler_1.default)(async (req, res) => {
    (0, generateToken_1.clearToken)(res);
    (0, apiResponse_1.sendSuccess)(res, null, { message: 'Logged out successfully' });
});
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await userModel_1.default.findById(req.user._id).select('-password');
    if (user) {
        (0, apiResponse_1.sendSuccess)(res, user);
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Get users for admin table
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = (0, express_async_handler_1.default)(async (req, res) => {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword : '';
    const role = typeof req.query.role === 'string' ? req.query.role : '';
    const isActiveQuery = typeof req.query.isActive === 'string' ? req.query.isActive : undefined;
    const filter = { isDeleted: false };
    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
        ];
    }
    if (role && role !== 'all') {
        filter.role = role;
    }
    if (isActiveQuery !== undefined) {
        filter.isActive = isActiveQuery === 'true';
    }
    const total = await userModel_1.default.countDocuments(filter);
    const users = await userModel_1.default.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    (0, apiResponse_1.sendSuccess)(res, users, {
        meta: {
            pagination: {
                page,
                pages: Math.ceil(total / pageSize),
                total,
                limit: pageSize,
            },
        },
    });
});
// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
exports.updateUserRole = (0, express_async_handler_1.default)(async (req, res) => {
    const { role } = req.body;
    if (!role || !['student', 'instructor', 'admin'].includes(role)) {
        res.status(400);
        throw new Error('Valid role is required');
    }
    const user = await userModel_1.default.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.role = role;
    await user.save();
    (0, apiResponse_1.sendSuccess)(res, user, { message: 'User role updated' });
});
// @desc    Update user status (active/suspended)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
        res.status(400);
        throw new Error('isActive boolean is required');
    }
    const user = await userModel_1.default.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.isActive = isActive;
    await user.save();
    (0, apiResponse_1.sendSuccess)(res, user, { message: `User ${isActive ? 'activated' : 'suspended'} successfully` });
});
// @desc    Soft delete a user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.softDeleteUser = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await userModel_1.default.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.isDeleted = true;
    await user.save();
    (0, apiResponse_1.sendSuccess)(res, null, { message: 'User deleted successfully' });
});
// @desc    Get admin activity log feed
// @route   GET /api/auth/activity-logs
// @access  Private/Admin
exports.getActivityLogs = (0, express_async_handler_1.default)(async (req, res) => {
    const [recentUsers, recentCourses, recentTickets] = await Promise.all([
        userModel_1.default.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(25).select('name email role createdAt lastLogin'),
        courseModel_1.default.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(25).populate('instructor', 'name email'),
        ticketModel_1.default.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(25).populate('user', 'name email'),
    ]);
    const userLogs = recentUsers.map((u) => ({
        id: `user-${u._id}`,
        action: 'User registered',
        category: 'user',
        user: u.name,
        timestamp: u.createdAt,
        details: `${u.email} joined as ${u.role}`,
        severity: 'success',
    }));
    const courseLogs = recentCourses.map((c) => ({
        id: `course-${c._id}`,
        action: 'Course created',
        category: 'course',
        user: c.instructor?.name || 'Instructor',
        timestamp: c.createdAt,
        details: `${c.title} (${c.status})`,
        severity: c.status === 'published' ? 'success' : 'info',
    }));
    const ticketLogs = recentTickets.map((t) => ({
        id: `ticket-${t._id}`,
        action: 'Support ticket opened',
        category: 'system',
        user: t.user?.name || 'User',
        timestamp: t.createdAt,
        details: `${t.subject} (${t.status})`,
        severity: t.priority === 'urgent' ? 'error' : t.priority === 'high' ? 'warning' : 'info',
    }));
    const logs = [...userLogs, ...courseLogs, ...ticketLogs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);
    (0, apiResponse_1.sendSuccess)(res, logs);
});
//# sourceMappingURL=authController.js.map