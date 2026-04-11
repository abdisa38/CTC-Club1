import mongoose, { Document } from 'mongoose';
export interface ICourseReview extends Document {
    course: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const CourseReview: mongoose.Model<ICourseReview, {}, {}, {}, mongoose.Document<unknown, {}, ICourseReview, {}, mongoose.DefaultSchemaOptions> & ICourseReview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICourseReview>;
export default CourseReview;
//# sourceMappingURL=courseReviewModel.d.ts.map