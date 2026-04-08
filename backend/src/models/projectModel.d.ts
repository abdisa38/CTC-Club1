import mongoose, { Document } from 'mongoose';
export interface IProject extends Document {
    title: string;
    description: string;
    course: mongoose.Schema.Types.ObjectId;
    deadline?: Date;
}
export declare const Project: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, mongoose.DefaultSchemaOptions> & IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProject>;
export interface IProjectSubmission extends Document {
    student: mongoose.Schema.Types.ObjectId;
    project: mongoose.Schema.Types.ObjectId;
    repoUrl: string;
    files?: string;
    grade?: number;
    feedback?: string;
    status: 'submitted' | 'reviewed';
}
export declare const ProjectSubmission: mongoose.Model<IProjectSubmission, {}, {}, {}, mongoose.Document<unknown, {}, IProjectSubmission, {}, mongoose.DefaultSchemaOptions> & IProjectSubmission & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProjectSubmission>;
//# sourceMappingURL=projectModel.d.ts.map