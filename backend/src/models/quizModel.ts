import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  questionText: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[]; // Only for multiple-choice/true-false
  correctAnswerIndex?: number; // Only for multiple-choice/true-false
  correctAnswerText?: string; // For short answer
  points: number;
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId; // Optional - if attached to specific lesson
  
  questions: IQuestion[];
  
  // Settings & Gamification
  passingScore: number; // Percentage
  timeLimit?: number; // Minutes
  maxAttempts?: number;
  xpReward: number;
  
  // Status
  isPublished: boolean;
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', index: true },
    
    questions: [
      {
        questionText: { type: String, required: true },
        type: { 
          type: String, 
          enum: ['multiple-choice', 'true-false', 'short-answer'],
          default: 'multiple-choice'
        },
        options: [{ type: String }],
        correctAnswerIndex: { type: Number },
        correctAnswerText: { type: String },
        points: { type: Number, default: 1 }
      },
    ],
    
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    timeLimit: { type: Number, min: 0 },
    maxAttempts: { type: Number, default: 3, min: 1 },
    xpReward: { type: Number, default: 10, min: 0 },
    
    isPublished: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

quizSchema.pre(/^find/, function (this: any) {
  this.where({ isDeleted: { $ne: true } });

});

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

export interface IQuizResult extends Document {
  user: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  
  attemptNumber: number;
  score: number;
  totalPoints: number;
  percentage: number;
  isPassed: boolean;
  
  // Array of what they answered vs correct
  answers: {
    questionId: mongoose.Types.ObjectId; // if questions had explicit ids
    userAnswerIndex?: number;
    userAnswerText?: string;
    isCorrect: boolean;
  }[];

  timeSpent: number; // Minutes or Seconds
  xpEarned: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const quizResultSchema = new Schema<IQuizResult>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    
    attemptNumber: { type: Number, default: 1 },
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    isPassed: { type: Boolean, required: true },
    
    answers: [{
      questionId: { type: Schema.Types.ObjectId },
      userAnswerIndex: { type: Number },
      userAnswerText: { type: String },
      isCorrect: { type: Boolean }
    }],
    
    timeSpent: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizResultSchema.index({ user: 1, quiz: 1 });

export const QuizResult = mongoose.model<IQuizResult>('QuizResult', quizResultSchema);
