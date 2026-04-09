import mongoose, { Document } from 'mongoose';
export interface ILesson extends Document {
    title: string;
    course: mongoose.Types.ObjectId;
    chapter?: mongoose.Types.ObjectId;
    content: string;
    videoUrl?: string;
    duration?: number;
    order: number;
    attachments: {
        title: string;
        url: string;
        fileType: string;
    }[];
    isPublished: boolean;
    isFreePreview: boolean;
    xpReward: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Lesson: mongoose.Model<ILesson, {}, {}, {}, mongoose.Document<unknown, {}, ILesson, {}, mongoose.DefaultSchemaOptions> & ILesson & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILesson>;
export default Lesson;
//# sourceMappingURL=lessonModel.d.ts.map