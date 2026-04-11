import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseReview extends Document {
  course: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseReviewSchema = new Schema<ICourseReview>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

courseReviewSchema.index({ course: 1, user: 1 }, { unique: true });

const CourseReview = mongoose.model<ICourseReview>('CourseReview', courseReviewSchema);

export default CourseReview;
