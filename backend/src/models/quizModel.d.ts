import mongoose, { Document } from 'mongoose';
export interface IQuestion {
    questionText: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswerIndex?: number;
    correctAnswerText?: string;
    points: number;
}
export interface IQuiz extends Document {
    title: string;
    description?: string;
    course: mongoose.Types.ObjectId;
    lesson?: mongoose.Types.ObjectId;
    questions: IQuestion[];
    passingScore: number;
    timeLimit?: number;
    maxAttempts?: number;
    xpReward: number;
    isPublished: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Quiz: mongoose.Model<IQuiz, {}, {}, {}, mongoose.Document<unknown, {}, IQuiz, {}, mongoose.DefaultSchemaOptions> & IQuiz & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IQuiz>;
export interface IQuizResult extends Document {
    user: mongoose.Types.ObjectId;
    quiz: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    attemptNumber: number;
    score: number;
    totalPoints: number;
    percentage: number;
    isPassed: boolean;
    answers: {
        questionId: mongoose.Types.ObjectId;
        userAnswerIndex?: number;
        userAnswerText?: string;
        isCorrect: boolean;
    }[];
    timeSpent: number;
    xpEarned: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const QuizResult: mongoose.Model<IQuizResult, {}, {}, {}, mongoose.Document<unknown, {}, IQuizResult, {}, mongoose.DefaultSchemaOptions> & IQuizResult & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IQuizResult>;
//# sourceMappingURL=quizModel.d.ts.map