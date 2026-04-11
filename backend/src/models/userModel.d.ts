import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'student' | 'instructor' | 'admin';
    avatar?: string;
    xp: number;
    level: number;
    badges: mongoose.Types.ObjectId[];
    isDeleted: boolean;
    isActive: boolean;
    lastLogin?: Date;
    enrolledCourses: mongoose.Types.ObjectId[];
    createdCourses: mongoose.Types.ObjectId[];
    favoriteCourses: mongoose.Types.ObjectId[];
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