import mongoose, { Document } from 'mongoose';
export interface IProgress extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    completedLessons: mongoose.Types.ObjectId[];
    completedQuizzes: mongoose.Types.ObjectId[];
    lastAccessedLesson?: mongoose.Types.ObjectId;
    progressPercentage: number;
    isCompleted: boolean;
    completionDate?: Date;
    earnedXp: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const Progress: mongoose.Model<IProgress, {}, {}, {}, mongoose.Document<unknown, {}, IProgress, {}, mongoose.DefaultSchemaOptions> & IProgress & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProgress>;
export default Progress;
//# sourceMappingURL=progressModel.d.ts.map