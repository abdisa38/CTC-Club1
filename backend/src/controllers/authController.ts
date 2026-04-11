import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/userModel';
import Course from '../models/courseModel';
import Lesson from '../models/lessonModel';
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

// @desc    Get current user's favorite courses
// @route   GET /api/auth/favorites/courses
// @access  Private
export const getFavoriteCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id)
    .select('favoriteCourses')
    .populate({
      path: 'favoriteCourses',
      match: { isDeleted: false, status: 'published' },
      options: { sort: { createdAt: -1 } },
      populate: { path: 'instructor', select: 'name email avatar' },
    });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const favorites = Array.isArray((user as any).favoriteCourses)
    ? (user as any).favoriteCourses.filter(Boolean)
    : [];

  sendSuccess(res, favorites);
});

// @desc    Add course to favorites
// @route   POST /api/auth/favorites/courses/:courseId
// @access  Private
export const addFavoriteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const courseIdParam = req.params.courseId;

  if (typeof courseIdParam !== 'string' || !mongoose.Types.ObjectId.isValid(courseIdParam)) {
    res.status(400);
    throw new Error('Invalid course id');
  }

  const courseId = courseIdParam;

  const course = await Course.findOne({ _id: courseId, isDeleted: false });
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favoriteCourses: course._id } },
    { new: true }
  ).select('_id');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  sendSuccess(res, {
    courseId: course._id.toString(),
    isFavorite: true,
  }, { message: 'Course added to favorites' });
});

// @desc    Remove course from favorites
// @route   DELETE /api/auth/favorites/courses/:courseId
// @access  Private
export const removeFavoriteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const courseIdParam = req.params.courseId;

  if (typeof courseIdParam !== 'string' || !mongoose.Types.ObjectId.isValid(courseIdParam)) {
    res.status(400);
    throw new Error('Invalid course id');
  }

  const courseId = courseIdParam;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favoriteCourses: courseId } },
    { new: true }
  ).select('_id');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  sendSuccess(res, {
    courseId,
    isFavorite: false,
  }, { message: 'Course removed from favorites' });
});

const resourceIdPattern = /^attachment-([a-fA-F0-9]{24})-(\d+)$/;

const parseResourceReference = (resourceId: string) => {
  const match = resourceIdPattern.exec(resourceId);
  if (!match) {
    return null;
  }

  const lessonId = match[1];
  const attachmentIndex = Number(match[2]);
  if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0) {
    return null;
  }

  return { lessonId, attachmentIndex };
};

const isVideoAttachment = (fileType?: string, url?: string) => {
  const type = String(fileType || '').toLowerCase();
  const safeUrl = String(url || '');
  return type.includes('video') || /(\.mp4|\.mov|\.avi|\.mkv|\.webm)(\?|$)/i.test(safeUrl);
};

const resolveResourceId = async (resourceId: string, userRole: string) => {
  const parsed = parseResourceReference(resourceId);
  if (!parsed) {
    return null;
  }

  const lesson = await Lesson.findById(parsed.lessonId).select('attachments isPublished');
  if (!lesson) {
    return null;
  }

  if (userRole === 'student' && lesson.isPublished !== true) {
    return null;
  }

  const attachments = Array.isArray(lesson.attachments) ? lesson.attachments : [];
  const attachment = attachments[parsed.attachmentIndex];
  if (!attachment?.url) {
    return null;
  }

  if (isVideoAttachment(attachment.fileType, attachment.url)) {
    return null;
  }

  return resourceId;
};

// @desc    Get current user's favorite resource IDs
// @route   GET /api/auth/favorites/resources
// @access  Private
export const getFavoriteResources = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id).select('favoriteResources');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const favorites = Array.isArray((user as any).favoriteResources)
    ? ((user as any).favoriteResources as string[])
    : [];

  if (favorites.length === 0) {
    sendSuccess(res, []);
    return;
  }

  const validated = await Promise.all(
    favorites.map((resourceId) => resolveResourceId(resourceId, req.user.role))
  );

  const validResourceIds = validated.filter((resourceId): resourceId is string => Boolean(resourceId));
  const invalidResourceIds = favorites.filter((resourceId) => !validResourceIds.includes(resourceId));

  if (invalidResourceIds.length > 0) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favoriteResources: { $in: invalidResourceIds } },
    });
  }

  sendSuccess(res, validResourceIds);
});

// @desc    Add resource to favorites
// @route   POST /api/auth/favorites/resources/:resourceId
// @access  Private
export const addFavoriteResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rawResourceId = typeof req.params.resourceId === 'string'
    ? decodeURIComponent(req.params.resourceId)
    : '';

  if (!rawResourceId) {
    res.status(400);
    throw new Error('Resource id is required');
  }

  const resourceId = await resolveResourceId(rawResourceId, req.user.role);
  if (!resourceId) {
    res.status(404);
    throw new Error('Resource not found');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favoriteResources: resourceId } },
    { new: true }
  ).select('_id');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  sendSuccess(res, {
    resourceId,
    isFavorite: true,
  }, { message: 'Resource added to favorites' });
});

// @desc    Remove resource from favorites
// @route   DELETE /api/auth/favorites/resources/:resourceId
// @access  Private
export const removeFavoriteResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rawResourceId = typeof req.params.resourceId === 'string'
    ? decodeURIComponent(req.params.resourceId)
    : '';

  if (!rawResourceId) {
    res.status(400);
    throw new Error('Resource id is required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favoriteResources: rawResourceId } },
    { new: true }
  ).select('_id');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  sendSuccess(res, {
    resourceId: rawResourceId,
    isFavorite: false,
  }, { message: 'Resource removed from favorites' });
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
