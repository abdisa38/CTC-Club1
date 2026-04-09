import mongoose, { Document } from 'mongoose';
export interface ICourse extends Document {
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    instructor: mongoose.Types.ObjectId;
    students: mongoose.Types.ObjectId[];
    coverImage?: string;
    category: string;
    tags: string[];
    price: number;
    currency: string;
    isPublished: boolean;
    status: 'draft' | 'published' | 'archived';
    level: 'beginner' | 'intermediate' | 'advanced';
    xpReward: number;
    prerequisites: string[];
    totalDuration?: number;
    rating: number;
    numReviews: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
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