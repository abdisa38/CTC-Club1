import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  course: mongoose.Schema.Types.ObjectId;
  questions: {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
  }[];
}

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

export interface IQuizResult extends Document {
  user: mongoose.Schema.Types.ObjectId;
  quiz: mongoose.Schema.Types.ObjectId;
  score: number;
  total: number;
}

const quizResultSchema = new Schema<IQuizResult>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export const QuizResult = mongoose.model<IQuizResult>('QuizResult', quizResultSchema);
