import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  
  completedLessons: mongoose.Types.ObjectId[];
  completedQuizzes: mongoose.Types.ObjectId[];
  
  lastAccessedLesson?: mongoose.Types.ObjectId;
  progressPercentage: number;
  
  isCompleted: boolean;
  completionDate?: Date;
  
  earnedXp: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        index: true,
      },
    ],
    completedQuizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
      },
    ],
    lastAccessedLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completionDate: {
      type: Date,
    },
    earnedXp: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound uniquely index for a user and course (1 progress per user/course mapping)
progressSchema.index({ user: 1, course: 1 }, { unique: true });

const Progress = mongoose.model<IProgress>('Progress', progressSchema);

export default Progress;