import { z } from 'zod';

const isGoogleEmail = (value: string) => /@(gmail\.com|googlemail\.com)$/i.test(value.trim().toLowerCase());

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .email('Invalid email address')
      .refine((value) => isGoogleEmail(value), 'Registration requires a Google email address (gmail.com).'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    // Notice: we do not accept 'role' in public registration here for security reasons.
    // If we need an admin creating users, we'd create a separate admin-only endpoint.
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().regex(/^\d{6}$/, 'Reset code must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), 'Invalid URL');

export const updateProfileSettingsSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    firstName: z.string().trim().max(40).optional(),
    lastName: z.string().trim().max(40).optional(),
    headline: z.string().trim().max(120).optional(),
    bio: z.string().trim().max(2000).optional(),
    avatar: optionalUrl,
    socialLinks: z.object({
      github: optionalUrl,
      linkedin: optionalUrl,
      website: optionalUrl,
    }).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const changeEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const updateNotificationPreferencesSchema = z.object({
  body: z.object({
    courseUpdates: z.boolean().optional(),
    assignmentFeedback: z.boolean().optional(),
    communityMentions: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
  }),
});

export const updateAppearancePreferenceSchema = z.object({
  body: z.object({
    theme: z.enum(['system', 'light', 'dark']),
  }),
});
