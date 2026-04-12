import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        code: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateProfileSettingsSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        headline: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
        socialLinks: z.ZodOptional<z.ZodObject<{
            github: z.ZodOptional<z.ZodString>;
            linkedin: z.ZodOptional<z.ZodString>;
            website: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const changeEmailSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateNotificationPreferencesSchema: z.ZodObject<{
    body: z.ZodObject<{
        courseUpdates: z.ZodOptional<z.ZodBoolean>;
        assignmentFeedback: z.ZodOptional<z.ZodBoolean>;
        communityMentions: z.ZodOptional<z.ZodBoolean>;
        weeklySummary: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateAppearancePreferenceSchema: z.ZodObject<{
    body: z.ZodObject<{
        theme: z.ZodEnum<{
            system: "system";
            light: "light";
            dark: "dark";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=authValidator.d.ts.map