import mongoose, { Document } from 'mongoose';
export interface ICourse extends Document {
    title: string;
    description: string;
    instructor: mongoose.Schema.Types.ObjectId;
    students: mongoose.Schema.Types.ObjectId[];
    coverImage?: string;
    category?: string;
    price?: number;
}
declare const Course: mongoose.Model<ICourse, {}, {}, {}, mongoose.Document<unknown, {}, ICourse, {}, mongoose.DefaultSchemaOptions> & ICourse & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICourse>;
export default Course;
//# sourceMappingURL=courseModel.d.ts.map