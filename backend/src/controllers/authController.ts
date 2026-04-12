import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/userModel';
import Course from '../models/courseModel';
import Lesson from '../models/lessonModel';
import Ticket from '../models/ticketModel';
import { AuthRequest } from '../middleware/authMiddleware';
import generateToken, { clearToken } from '../utils/generateToken';
import { sendSuccess } from '../utils/apiResponse';
import { sendPasswordResetCodeEmail } from '../utils/email';

type OAuthProvider = 'google' | 'github';
type ThemePreference = 'system' | 'light' | 'dark';

const getServerUrl = () => process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const normalizeEmail = (value: unknown) => String(value || '').trim().toLowerCase();
const buildClientAuthRedirectUrl = (params: {
  status: 'success' | 'error';
  message?: string;
  email?: string;
  provider?: OAuthProvider;
}) => {
  const { status, message, email, provider } = params;
  const redirectUrl = new URL('/login', getClientUrl());
  redirectUrl.searchParams.set('oauth', status);

  if (message) {
    redirectUrl.searchParams.set('message', message);
  }

  if (email) {
    redirectUrl.searchParams.set('email', email);
  }

  if (provider) {
    redirectUrl.searchParams.set('provider', provider);
  }

  return redirectUrl.toString();
};

const oauthStateCookieName = (provider: OAuthProvider) => `oauth_state_${provider}`;
const setOAuthStateCookie = (res: Response, provider: OAuthProvider, state: string) => {
  res.cookie(oauthStateCookieName(provider), state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });
};
const clearOAuthStateCookie = (res: Response, provider: OAuthProvider) => {
  res.cookie(oauthStateCookieName(provider), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
  });
};

const createOAuthState = () => crypto.randomBytes(24).toString('hex');
const createRandomPassword = () => crypto.randomBytes(24).toString('hex');
const hashResetCode = (code: string) => crypto.createHash('sha256').update(code).digest('hex');
const DEFAULT_AVATAR_URL = 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';

const normalizeText = (value: unknown, maxLength = 2000) =>
  String(value ?? '').trim().slice(0, maxLength);

const normalizeHttpUrl = (value: unknown) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return '';
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
};

const normalizeThemePreference = (value: unknown): ThemePreference => {
  if (value === 'light' || value === 'dark') {
    return value;
  }

  return 'system';
};

const getMergedNotificationPreferences = (
  user: any,
  updates: Partial<{
    courseUpdates: boolean;
    assignmentFeedback: boolean;
    communityMentions: boolean;
    weeklySummary: boolean;
  }> = {}
) => {
  const current = user?.preferences?.notifications || {};

  return {
    courseUpdates: typeof updates.courseUpdates === 'boolean'
      ? updates.courseUpdates
      : typeof current.courseUpdates === 'boolean' ? current.courseUpdates : true,
    assignmentFeedback: typeof updates.assignmentFeedback === 'boolean'
      ? updates.assignmentFeedback
      : typeof current.assignmentFeedback === 'boolean' ? current.assignmentFeedback : true,
    communityMentions: typeof updates.communityMentions === 'boolean'
      ? updates.communityMentions
      : typeof current.communityMentions === 'boolean' ? current.communityMentions : false,
    weeklySummary: typeof updates.weeklySummary === 'boolean'
      ? updates.weeklySummary
      : typeof current.weeklySummary === 'boolean' ? current.weeklySummary : true,
  };
};

const PASSWORD_RESET_CODE_TTL_MINUTES = (() => {
  const value = Number(process.env.PASSWORD_RESET_CODE_TTL_MINUTES || 10);
  if (!Number.isFinite(value) || value <= 0) {
    return 10;
  }

  return Math.floor(value);
})();

const upsertOAuthUser = async (input: {
  provider: OAuthProvider;
  email: string;
  name?: string;
  avatar?: string;
}) => {
  const email = normalizeEmail(input.email);
  const displayName = (input.name || email.split('@')[0] || 'Student').trim();

  let user = await User.findOne({ email });
  if (!user) {
    const createInput: Record<string, unknown> = {
      name: displayName,
      email,
      password: createRandomPassword(),
      role: 'student',
      oauthProvider: input.provider,
    };

    if (input.avatar) {
      createInput.avatar = input.avatar;
    }

    user = await User.create(createInput);

    return user;
  }

  if (!user.oauthProvider) {
    user.oauthProvider = input.provider;
  }

  if (input.avatar) {
    user.avatar = input.avatar;
  }

  if (!user.name && displayName) {
    user.name = displayName;
  }

  await user.save();
  return user;
};

const fetchGoogleProfile = async (code: string) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }

  const callbackUrl = `${getServerUrl()}/api/auth/oauth/google/callback`;
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    }),
  });

  const tokenPayload: any = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenPayload?.access_token) {
    throw new Error('Google sign-in failed while exchanging authorization code.');
  }

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  });

  const profile: any = await profileResponse.json().catch(() => ({}));
  if (!profileResponse.ok || !profile?.email) {
    throw new Error('Google profile fetch failed.');
  }

  return {
    email: normalizeEmail(profile.email),
    name: String(profile.name || profile.email || '').trim(),
    avatar: String(profile.picture || ''),
  };
};

const fetchGitHubProfile = async (code: string) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.');
  }

  const callbackUrl = `${getServerUrl()}/api/auth/oauth/github/callback`;
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: callbackUrl,
    }),
  });

  const tokenPayload: any = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenPayload?.access_token) {
    throw new Error('GitHub sign-in failed while exchanging authorization code.');
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${tokenPayload.access_token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const [userResponse, emailsResponse] = await Promise.all([
    fetch('https://api.github.com/user', { headers }),
    fetch('https://api.github.com/user/emails', { headers }),
  ]);

  const userPayload: any = await userResponse.json().catch(() => ({}));
  const emailPayload: any = await emailsResponse.json().catch(() => []);

  const emails = Array.isArray(emailPayload) ? emailPayload : [];
  const primaryEmail = emails.find((item: any) => item?.primary && item?.verified)?.email;
  const fallbackVerified = emails.find((item: any) => item?.verified)?.email;
  const email = normalizeEmail(primaryEmail || fallbackVerified || userPayload?.email);

  if (!userResponse.ok || !email) {
    throw new Error('GitHub profile fetch failed. Ensure your GitHub account has a verified email.');
  }

  return {
    email,
    name: String(userPayload?.name || userPayload?.login || email).trim(),
    avatar: String(userPayload?.avatar_url || ''),
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hardcode "student" so anonymous public API cannot create admin
  const user = await User.create({
    name,
    email: normalizedEmail,
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
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail });

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

// @desc    Start Google OAuth login
// @route   GET /api/auth/oauth/google
// @access  Public
export const startGoogleOAuth = asyncHandler(async (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.redirect(buildClientAuthRedirectUrl({
      status: 'error',
      message: 'Google login is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend .env.',
      provider: 'google',
    }));
    return;
  }

  const callbackUrl = `${getServerUrl()}/api/auth/oauth/google/callback`;
  const state = createOAuthState();

  setOAuthStateCookie(res, 'google', state);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('prompt', 'select_account');

  res.redirect(authUrl.toString());
});

// @desc    Google OAuth callback
// @route   GET /api/auth/oauth/google/callback
// @access  Public
export const googleOAuthCallback = asyncHandler(async (req: Request, res: Response) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const expectedState = req.cookies?.[oauthStateCookieName('google')];

  clearOAuthStateCookie(res, 'google');

  if (!code || !state || !expectedState || state !== expectedState) {
    res.redirect(buildClientAuthRedirectUrl({
      status: 'error',
      message: 'Google sign-in validation failed.',
      provider: 'google',
    }));
    return;
  }

  try {
    const profile = await fetchGoogleProfile(code);
    const user = await upsertOAuthUser({
      provider: 'google',
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
    });

    user.lastLogin = new Date();
    await user.save();

    generateToken(res, user._id.toString(), user.role);
    res.redirect(buildClientAuthRedirectUrl({
      status: 'success',
      email: user.email,
      provider: 'google',
    }));
  } catch (error) {
    res.redirect(buildClientAuthRedirectUrl({
      status: 'error',
      message: 'Google sign-in failed. Please try again.',
      provider: 'google',
    }));
  }
});

// @desc    Start GitHub OAuth login
// @route   GET /api/auth/oauth/github
// @access  Public
export const startGitHubOAuth = asyncHandler(async (_req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.redirect(buildClientAuthRedirectUrl({
      status: 'error',
      message: 'GitHub login is not configured yet. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend .env.',
      provider: 'github',
    }));
    return;
  }

  const callbackUrl = `${getServerUrl()}/api/auth/oauth/github/callback`;
  const state = createOAuthState();

  setOAuthStateCookie(res, 'github', state);

  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('scope', 'read:user user:email');
  authUrl.searchParams.set('state', state);

  res.redirect(authUrl.toString());
});

// @desc    GitHub OAuth callback
// @route   GET /api/auth/oauth/github/callback
// @access  Public
export const githubOAuthCallback = asyncHandler(async (req: Request, res: Response) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const expectedState = req.cookies?.[oauthStateCookieName('github')];

  clearOAuthStateCookie(res, 'github');

  if (!code || !state || !expectedState || state !== expectedState) {
    res.redirect(buildClientAuthRedirectUrl({
      status: 'error',
      message: 'GitHub sign-in validation failed.',
      provider: 'github',
    }));
    return;
  }

  try {
    const profile = await fetchGitHubProfile(code);
    const user = await upsertOAuthUser({
      provider: 'github',
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
    });

    user.lastLogin = new Date();
    await user.save();

    generateToken(res, user._id.toString(), user.role);
    res.redirect(buildClientAuthRedirectUrl({
      status: 'success',
      email: user.email,
      provider: 'github',
    }));
  } catch (error) {
    res.redirect(buildClientAuthRedirectUrl({
      status: 'error',
      message: 'GitHub sign-in failed. Please try again.',
      provider: 'github',
    }));
  }
});

// @desc    Send reset code to email
// @route   POST /api/auth/password/forgot
// @access  Public
export const requestPasswordResetCode = asyncHandler(async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email }).select('+passwordResetCodeHash +passwordResetCodeExpiresAt');
  if (!user) {
    sendSuccess(res, { sent: true }, { message: 'If that email is registered, a reset code has been sent.' });
    return;
  }

  const resetCode = String(Math.floor(100000 + Math.random() * 900000));

  user.passwordResetCodeHash = hashResetCode(resetCode);
  user.passwordResetCodeExpiresAt = new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MINUTES * 60 * 1000);
  await user.save();

  try {
    await sendPasswordResetCodeEmail({
      to: user.email,
      name: user.name,
      code: resetCode,
      expiresInMinutes: PASSWORD_RESET_CODE_TTL_MINUTES,
    });
  } catch (error: any) {
    user.set('passwordResetCodeHash', undefined);
    user.set('passwordResetCodeExpiresAt', undefined);
    await user.save();

    res.status(500);
    throw new Error(error?.message || 'Failed to send password reset email');
  }

  sendSuccess(res, { sent: true }, { message: 'Password reset code sent successfully.' });
});

// @desc    Reset password with code
// @route   POST /api/auth/password/reset
// @access  Public
export const resetPasswordWithCode = asyncHandler(async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  const code = String(req.body?.code || '').trim();
  const newPassword = String(req.body?.newPassword || '');

  if (!email || !code || !newPassword) {
    res.status(400);
    throw new Error('Email, code, and new password are required');
  }

  const user = await User.findOne({ email }).select('+password +passwordResetCodeHash +passwordResetCodeExpiresAt');
  if (!user || !user.passwordResetCodeHash || !user.passwordResetCodeExpiresAt) {
    res.status(400);
    throw new Error('Invalid or expired reset code');
  }

  if (user.passwordResetCodeExpiresAt.getTime() < Date.now()) {
    user.set('passwordResetCodeHash', undefined);
    user.set('passwordResetCodeExpiresAt', undefined);
    await user.save();

    res.status(400);
    throw new Error('Reset code has expired');
  }

  if (hashResetCode(code) !== user.passwordResetCodeHash) {
    res.status(400);
    throw new Error('Invalid reset code');
  }

  user.password = newPassword;
  user.lastLogin = new Date();
  user.set('passwordResetCodeHash', undefined);
  user.set('passwordResetCodeExpiresAt', undefined);

  await user.save();
  generateToken(res, user._id.toString(), user.role);

  sendSuccess(res, {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }, { message: 'Password reset successful' });
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

// @desc    Update current user profile settings
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const nameInput = normalizeText(req.body?.name, 80);
  const firstNameInput = normalizeText(req.body?.firstName, 40);
  const lastNameInput = normalizeText(req.body?.lastName, 40);
  const combinedName = `${firstNameInput} ${lastNameInput}`.trim();
  const nextName = nameInput || combinedName;

  if (nextName) {
    user.name = nextName;
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'headline')) {
    user.headline = normalizeText(req.body?.headline, 120);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'bio')) {
    user.bio = normalizeText(req.body?.bio, 2000);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'avatar')) {
    const normalizedAvatar = normalizeHttpUrl(req.body?.avatar);
    user.avatar = normalizedAvatar || DEFAULT_AVATAR_URL;
  }

  if (req.body?.socialLinks && typeof req.body.socialLinks === 'object') {
    const currentLinks = (user.socialLinks || {}) as Record<string, unknown>;
    const socialInput = req.body.socialLinks as Record<string, unknown>;

    user.socialLinks = {
      github: Object.prototype.hasOwnProperty.call(socialInput, 'github')
        ? normalizeHttpUrl(socialInput.github)
        : String(currentLinks.github || ''),
      linkedin: Object.prototype.hasOwnProperty.call(socialInput, 'linkedin')
        ? normalizeHttpUrl(socialInput.linkedin)
        : String(currentLinks.linkedin || ''),
      website: Object.prototype.hasOwnProperty.call(socialInput, 'website')
        ? normalizeHttpUrl(socialInput.website)
        : String(currentLinks.website || ''),
    };
  }

  await user.save();
  sendSuccess(res, user, { message: 'Profile updated successfully' });
});

// @desc    Change current user password
// @route   PUT /api/auth/password/change
// @access  Private
export const changeUserPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentPassword = String(req.body?.currentPassword || '');
  const newPassword = String(req.body?.newPassword || '');

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isCurrentPasswordValid = await user.matchPassword(currentPassword);
  if (!isCurrentPasswordValid) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, { message: 'Password updated successfully' });
});

// @desc    Update notification preferences
// @route   PUT /api/auth/preferences/notifications
// @access  Private
export const updateNotificationPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const mergedNotifications = getMergedNotificationPreferences(user, {
    courseUpdates: req.body?.courseUpdates,
    assignmentFeedback: req.body?.assignmentFeedback,
    communityMentions: req.body?.communityMentions,
    weeklySummary: req.body?.weeklySummary,
  });

  const currentTheme = normalizeThemePreference(user?.preferences?.appearance?.theme);
  user.preferences = {
    notifications: mergedNotifications,
    appearance: {
      theme: currentTheme,
    },
  };

  await user.save();
  sendSuccess(res, user.preferences.notifications, { message: 'Notification preferences updated' });
});

// @desc    Update appearance preferences
// @route   PUT /api/auth/preferences/appearance
// @access  Private
export const updateAppearancePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const theme = normalizeThemePreference(req.body?.theme);
  const mergedNotifications = getMergedNotificationPreferences(user);

  user.preferences = {
    notifications: mergedNotifications,
    appearance: {
      theme,
    },
  };

  await user.save();
  sendSuccess(res, user.preferences.appearance, { message: 'Appearance preferences updated' });
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
