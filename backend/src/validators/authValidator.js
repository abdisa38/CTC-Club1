"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppearancePreferenceSchema = exports.updateNotificationPreferencesSchema = exports.changeEmailSchema = exports.changePasswordSchema = exports.updateProfileSettingsSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        // Notice: we do not accept 'role' in public registration here for security reasons.
        // If we need an admin creating users, we'd create a separate admin-only endpoint.
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        code: zod_1.z.string().regex(/^\d{6}$/, 'Reset code must be 6 digits'),
        newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
const optionalUrl = zod_1.z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), 'Invalid URL');
exports.updateProfileSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(2).max(80).optional(),
        firstName: zod_1.z.string().trim().max(40).optional(),
        lastName: zod_1.z.string().trim().max(40).optional(),
        headline: zod_1.z.string().trim().max(120).optional(),
        bio: zod_1.z.string().trim().max(2000).optional(),
        avatar: optionalUrl,
        socialLinks: zod_1.z.object({
            github: optionalUrl,
            linkedin: optionalUrl,
            website: optionalUrl,
        }).optional(),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
    }),
});
exports.changeEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
    }),
});
exports.updateNotificationPreferencesSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseUpdates: zod_1.z.boolean().optional(),
        assignmentFeedback: zod_1.z.boolean().optional(),
        communityMentions: zod_1.z.boolean().optional(),
        weeklySummary: zod_1.z.boolean().optional(),
    }),
});
exports.updateAppearancePreferenceSchema = zod_1.z.object({
    body: zod_1.z.object({
        theme: zod_1.z.enum(['system', 'light', 'dark']),
    }),
});
//# sourceMappingURL=authValidator.js.map