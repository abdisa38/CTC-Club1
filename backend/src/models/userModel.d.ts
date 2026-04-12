import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'student' | 'instructor' | 'admin';
    oauthProvider?: 'google' | 'github';
    avatar?: string;
    headline?: string;
    bio?: string;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        website?: string;
    };
    preferences?: {
        notifications?: {
            courseUpdates?: boolean;
            assignmentFeedback?: boolean;
            communityMentions?: boolean;
            weeklySummary?: boolean;
        };
        appearance?: {
            theme?: 'system' | 'light' | 'dark';
        };
    };
    isPremium: boolean;
    premiumActivatedAt?: Date;
    xp: number;
    level: number;
    badges: mongoose.Types.ObjectId[];
    isDeleted: boolean;
    isActive: boolean;
    lastLogin?: Date;
    enrolledCourses: mongoose.Types.ObjectId[];
    createdCourses: mongoose.Types.ObjectId[];
    favoriteCourses: mongoose.Types.ObjectId[];
    favoriteResources: string[];
    passwordResetCodeHash?: string;
    passwordResetCodeExpiresAt?: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default User;
//# sourceMappingURL=userModel.d.ts.map