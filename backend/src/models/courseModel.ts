import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Schema.Types.ObjectId;
  students: mongoose.Schema.Types.ObjectId[];
  coverImage?: string;
  category?: string;
  price?: number;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    coverImage: {
      type: String,
    },
    category: {
      type: String,
      default: 'General',
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
