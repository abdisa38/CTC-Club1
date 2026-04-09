import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import Course from '../models/courseModel';
import Ticket from '../models/ticketModel';
import { AuthRequest } from '../middleware/authMiddleware';
import generateToken, { clearToken } from '../utils/generateToken';
import { sendSuccess } from '../utils/apiResponse';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hardcode "student" so anonymous public API cannot create admin
  const user = await User.create({
    name,
    email,
    password,
    role: 'student',
  });

  if (user) {
    generateToken(res, user._id.toString(), user.role);

    sendSuccess(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    }, { statusCode: 201, message: 'User registered successfully' });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id.toString(), user.role);

    user.lastLogin = new Date();
    await user.save();

    sendSuccess(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    }, { message: 'Login successful' });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  clearToken(res);
  sendSuccess(res, null, { message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    sendSuccess(res, user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get users for admin table
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;

  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword : '';
  const role = typeof req.query.role === 'string' ? req.query.role : '';
  const isActiveQuery = typeof req.query.isActive === 'string' ? req.query.isActive : undefined;

  const filter: any = { isDeleted: false };
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

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  sendSuccess(res, users, {
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
export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role } = req.body as { role?: 'student' | 'instructor' | 'admin' };

  if (!role || !['student', 'instructor', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Valid role is required');
  }

  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role;
  await user.save();

  sendSuccess(res, user, { message: 'User role updated' });
});

// @desc    Update user status (active/suspended)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body as { isActive?: boolean };

  if (typeof isActive !== 'boolean') {
    res.status(400);
    throw new Error('isActive boolean is required');
  }

  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = isActive;
  await user.save();

  sendSuccess(res, user, { message: `User ${isActive ? 'activated' : 'suspended'} successfully` });
});

// @desc    Soft delete a user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const softDeleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isDeleted = true;
  await user.save();

  sendSuccess(res, null, { message: 'User deleted successfully' });
});

// @desc    Get admin activity log feed
// @route   GET /api/auth/activity-logs
// @access  Private/Admin
export const getActivityLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [recentUsers, recentCourses, recentTickets] = await Promise.all([
    User.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(25).select('name email role createdAt lastLogin'),
    Course.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(25).populate('instructor', 'name email'),
    Ticket.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(25).populate('user', 'name email'),
  ]);

  const userLogs = recentUsers.map((u) => ({
    id: `user-${u._id}`,
    action: 'User registered',
    category: 'user',
    user: u.name,
    timestamp: (u as any).createdAt,
    details: `${u.email} joined as ${u.role}`,
    severity: 'success',
  }));

  const courseLogs = recentCourses.map((c: any) => ({
    id: `course-${c._id}`,
    action: 'Course created',
    category: 'course',
    user: c.instructor?.name || 'Instructor',
    timestamp: c.createdAt,
    details: `${c.title} (${c.status})`,
    severity: c.status === 'published' ? 'success' : 'info',
  }));

  const ticketLogs = recentTickets.map((t: any) => ({
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

  sendSuccess(res, logs);
});
