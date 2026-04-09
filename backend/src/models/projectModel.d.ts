import mongoose, { Document } from 'mongoose';
export interface IProject extends Document {
    title: string;
    description: string;
    course: mongoose.Types.ObjectId;
    lesson?: mongoose.Types.ObjectId;
    instructions: string;
    requirements: string[];
    xpReward: number;
    maxPoints: number;
    deadline?: Date;
    isPublished: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Project: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, mongoose.DefaultSchemaOptions> & IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProject>;
export interface IProjectSubmission extends Document {
    student: mongoose.Types.ObjectId;
    project: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    repoUrl?: string;
    liveUrl?: string;
    files?: string[];
    comments?: string;
    grade?: number;
    feedback?: string;
    status: 'pending' | 'submitted' | 'under_review' | 'graded';
    xpEarned: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProjectSubmission: mongoose.Model<IProjectSubmission, {}, {}, {}, mongoose.Document<unknown, {}, IProjectSubmission, {}, mongoose.DefaultSchemaOptions> & IProjectSubmission & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProjectSubmission>;
//# sourceMappingURL=projectModel.d.ts.map