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
exports.getActivityLogs = exports.softDeleteUser = exports.updateUserStatus = exports.updateUserRole = exports.getUsers = exports.removeFavoriteResource = exports.addFavoriteResource = exports.getFavoriteResources = exports.removeFavoriteCourse = exports.addFavoriteCourse = exports.getFavoriteCourses = exports.getUserProfile = exports.logoutUser = exports.resetPasswordWithCode = exports.requestPasswordResetCode = exports.githubOAuthCallback = exports.startGitHubOAuth = exports.googleOAuthCallback = exports.startGoogleOAuth = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const userModel_1 = __importDefault(require("../models/userModel"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const lessonModel_1 = __importDefault(require("../models/lessonModel"));
const ticketModel_1 = __importDefault(require("../models/ticketModel"));
const generateToken_1 = __importStar(require("../utils/generateToken"));
const apiResponse_1 = require("../utils/apiResponse");
const email_1 = require("../utils/email");
const getServerUrl = () => process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const buildClientAuthRedirectUrl = (params) => {
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
const oauthStateCookieName = (provider) => `oauth_state_${provider}`;
const setOAuthStateCookie = (res, provider, state) => {
    res.cookie(oauthStateCookieName(provider), state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
    });
};
const clearOAuthStateCookie = (res, provider) => {
    res.cookie(oauthStateCookieName(provider), '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
    });
};
const createOAuthState = () => crypto_1.default.randomBytes(24).toString('hex');
const createRandomPassword = () => crypto_1.default.randomBytes(24).toString('hex');
const hashResetCode = (code) => crypto_1.default.createHash('sha256').update(code).digest('hex');
const PASSWORD_RESET_CODE_TTL_MINUTES = (() => {
    const value = Number(process.env.PASSWORD_RESET_CODE_TTL_MINUTES || 10);
    if (!Number.isFinite(value) || value <= 0) {
        return 10;
    }
    return Math.floor(value);
})();
const upsertOAuthUser = async (input) => {
    const email = normalizeEmail(input.email);
    const displayName = (input.name || email.split('@')[0] || 'Student').trim();
    let user = await userModel_1.default.findOne({ email });
    if (!user) {
        const createInput = {
            name: displayName,
            email,
            password: createRandomPassword(),
            role: 'student',
            oauthProvider: input.provider,
        };
        if (input.avatar) {
            createInput.avatar = input.avatar;
        }
        user = await userModel_1.default.create(createInput);
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
const fetchGoogleProfile = async (code) => {
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
    const tokenPayload = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenPayload?.access_token) {
        throw new Error('Google sign-in failed while exchanging authorization code.');
    }
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${tokenPayload.access_token}`,
        },
    });
    const profile = await profileResponse.json().catch(() => ({}));
    if (!profileResponse.ok || !profile?.email) {
        throw new Error('Google profile fetch failed.');
    }
    return {
        email: normalizeEmail(profile.email),
        name: String(profile.name || profile.email || '').trim(),
        avatar: String(profile.picture || ''),
    };
};
const fetchGitHubProfile = async (code) => {
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
    const tokenPayload = await tokenResponse.json().catch(() => ({}));
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
    const userPayload = await userResponse.json().catch(() => ({}));
    const emailPayload = await emailsResponse.json().catch(() => []);
    const emails = Array.isArray(emailPayload) ? emailPayload : [];
    const primaryEmail = emails.find((item) => item?.primary && item?.verified)?.email;
    const fallbackVerified = emails.find((item) => item?.verified)?.email;
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
exports.registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const userExists = await userModel_1.default.findOne({ email: normalizedEmail });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    // Hardcode "student" so anonymous public API cannot create admin
    const user = await userModel_1.default.create({
        name,
        email: normalizedEmail,
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
    const normalizedEmail = normalizeEmail(email);
    const user = await userModel_1.default.findOne({ email: normalizedEmail });
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
// @desc    Start Google OAuth login
// @route   GET /api/auth/oauth/google
// @access  Public
exports.startGoogleOAuth = (0, express_async_handler_1.default)(async (_req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        res.status(500);
        throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
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
exports.googleOAuthCallback = (0, express_async_handler_1.default)(async (req, res) => {
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
        (0, generateToken_1.default)(res, user._id.toString(), user.role);
        res.redirect(buildClientAuthRedirectUrl({
            status: 'success',
            email: user.email,
            provider: 'google',
        }));
    }
    catch (error) {
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
exports.startGitHubOAuth = (0, express_async_handler_1.default)(async (_req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        res.status(500);
        throw new Error('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.');
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
exports.githubOAuthCallback = (0, express_async_handler_1.default)(async (req, res) => {
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
        (0, generateToken_1.default)(res, user._id.toString(), user.role);
        res.redirect(buildClientAuthRedirectUrl({
            status: 'success',
            email: user.email,
            provider: 'github',
        }));
    }
    catch (error) {
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
exports.requestPasswordResetCode = (0, express_async_handler_1.default)(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }
    const user = await userModel_1.default.findOne({ email }).select('+passwordResetCodeHash +passwordResetCodeExpiresAt');
    if (!user) {
        (0, apiResponse_1.sendSuccess)(res, { sent: true }, { message: 'If that email is registered, a reset code has been sent.' });
        return;
    }
    const resetCode = String(Math.floor(100000 + Math.random() * 900000));
    user.passwordResetCodeHash = hashResetCode(resetCode);
    user.passwordResetCodeExpiresAt = new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MINUTES * 60 * 1000);
    await user.save();
    try {
        await (0, email_1.sendPasswordResetCodeEmail)({
            to: user.email,
            name: user.name,
            code: resetCode,
            expiresInMinutes: PASSWORD_RESET_CODE_TTL_MINUTES,
        });
    }
    catch (error) {
        user.set('passwordResetCodeHash', undefined);
        user.set('passwordResetCodeExpiresAt', undefined);
        await user.save();
        res.status(500);
        throw new Error(error?.message || 'Failed to send password reset email');
    }
    (0, apiResponse_1.sendSuccess)(res, { sent: true }, { message: 'Password reset code sent successfully.' });
});
// @desc    Reset password with code
// @route   POST /api/auth/password/reset
// @access  Public
exports.resetPasswordWithCode = (0, express_async_handler_1.default)(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const code = String(req.body?.code || '').trim();
    const newPassword = String(req.body?.newPassword || '');
    if (!email || !code || !newPassword) {
        res.status(400);
        throw new Error('Email, code, and new password are required');
    }
    const user = await userModel_1.default.findOne({ email }).select('+password +passwordResetCodeHash +passwordResetCodeExpiresAt');
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
    (0, generateToken_1.default)(res, user._id.toString(), user.role);
    (0, apiResponse_1.sendSuccess)(res, {
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
// @desc    Get current user's favorite courses
// @route   GET /api/auth/favorites/courses
// @access  Private
exports.getFavoriteCourses = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await userModel_1.default.findById(req.user._id)
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
    const favorites = Array.isArray(user.favoriteCourses)
        ? user.favoriteCourses.filter(Boolean)
        : [];
    (0, apiResponse_1.sendSuccess)(res, favorites);
});
// @desc    Add course to favorites
// @route   POST /api/auth/favorites/courses/:courseId
// @access  Private
exports.addFavoriteCourse = (0, express_async_handler_1.default)(async (req, res) => {
    const courseIdParam = req.params.courseId;
    if (typeof courseIdParam !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(courseIdParam)) {
        res.status(400);
        throw new Error('Invalid course id');
    }
    const courseId = courseIdParam;
    const course = await courseModel_1.default.findOne({ _id: courseId, isDeleted: false });
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    const user = await userModel_1.default.findByIdAndUpdate(req.user._id, { $addToSet: { favoriteCourses: course._id } }, { new: true }).select('_id');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    (0, apiResponse_1.sendSuccess)(res, {
        courseId: course._id.toString(),
        isFavorite: true,
    }, { message: 'Course added to favorites' });
});
// @desc    Remove course from favorites
// @route   DELETE /api/auth/favorites/courses/:courseId
// @access  Private
exports.removeFavoriteCourse = (0, express_async_handler_1.default)(async (req, res) => {
    const courseIdParam = req.params.courseId;
    if (typeof courseIdParam !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(courseIdParam)) {
        res.status(400);
        throw new Error('Invalid course id');
    }
    const courseId = courseIdParam;
    const user = await userModel_1.default.findByIdAndUpdate(req.user._id, { $pull: { favoriteCourses: courseId } }, { new: true }).select('_id');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    (0, apiResponse_1.sendSuccess)(res, {
        courseId,
        isFavorite: false,
    }, { message: 'Course removed from favorites' });
});
const resourceIdPattern = /^attachment-([a-fA-F0-9]{24})-(\d+)$/;
const parseResourceReference = (resourceId) => {
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
const isVideoAttachment = (fileType, url) => {
    const type = String(fileType || '').toLowerCase();
    const safeUrl = String(url || '');
    return type.includes('video') || /(\.mp4|\.mov|\.avi|\.mkv|\.webm)(\?|$)/i.test(safeUrl);
};
const resolveResourceId = async (resourceId, userRole) => {
    const parsed = parseResourceReference(resourceId);
    if (!parsed) {
        return null;
    }
    const lesson = await lessonModel_1.default.findById(parsed.lessonId).select('attachments isPublished');
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
exports.getFavoriteResources = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await userModel_1.default.findById(req.user._id).select('favoriteResources');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    const favorites = Array.isArray(user.favoriteResources)
        ? user.favoriteResources
        : [];
    if (favorites.length === 0) {
        (0, apiResponse_1.sendSuccess)(res, []);
        return;
    }
    const validated = await Promise.all(favorites.map((resourceId) => resolveResourceId(resourceId, req.user.role)));
    const validResourceIds = validated.filter((resourceId) => Boolean(resourceId));
    const invalidResourceIds = favorites.filter((resourceId) => !validResourceIds.includes(resourceId));
    if (invalidResourceIds.length > 0) {
        await userModel_1.default.findByIdAndUpdate(req.user._id, {
            $pull: { favoriteResources: { $in: invalidResourceIds } },
        });
    }
    (0, apiResponse_1.sendSuccess)(res, validResourceIds);
});
// @desc    Add resource to favorites
// @route   POST /api/auth/favorites/resources/:resourceId
// @access  Private
exports.addFavoriteResource = (0, express_async_handler_1.default)(async (req, res) => {
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
    const user = await userModel_1.default.findByIdAndUpdate(req.user._id, { $addToSet: { favoriteResources: resourceId } }, { new: true }).select('_id');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    (0, apiResponse_1.sendSuccess)(res, {
        resourceId,
        isFavorite: true,
    }, { message: 'Resource added to favorites' });
});
// @desc    Remove resource from favorites
// @route   DELETE /api/auth/favorites/resources/:resourceId
// @access  Private
exports.removeFavoriteResource = (0, express_async_handler_1.default)(async (req, res) => {
    const rawResourceId = typeof req.params.resourceId === 'string'
        ? decodeURIComponent(req.params.resourceId)
        : '';
    if (!rawResourceId) {
        res.status(400);
        throw new Error('Resource id is required');
    }
    const user = await userModel_1.default.findByIdAndUpdate(req.user._id, { $pull: { favoriteResources: rawResourceId } }, { new: true }).select('_id');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    (0, apiResponse_1.sendSuccess)(res, {
        resourceId: rawResourceId,
        isFavorite: false,
    }, { message: 'Resource removed from favorites' });
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