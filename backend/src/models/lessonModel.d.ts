import mongoose, { Document } from 'mongoose';
export interface ILesson extends Document {
    title: string;
    course: mongoose.Schema.Types.ObjectId;
    content: string;
    videoUrl?: string;
    order: number;
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