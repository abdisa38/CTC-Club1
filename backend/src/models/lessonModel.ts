import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  course: mongoose.Schema.Types.ObjectId;
  content: string;
  videoUrl?: string;
  order: number;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Lesson content is required'],
    },
    videoUrl: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);

export default Lesson;
