import mongoose, { Document } from 'mongoose';
export interface IQuiz extends Document {
    title: string;
    course: mongoose.Schema.Types.ObjectId;
    questions: {
        questionText: string;
        options: string[];
        correctAnswerIndex: number;
    }[];
}
export declare const Quiz: mongoose.Model<IQuiz, {}, {}, {}, mongoose.Document<unknown, {}, IQuiz, {}, mongoose.DefaultSchemaOptions> & IQuiz & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IQuiz>;
export interface IQuizResult extends Document {
    user: mongoose.Schema.Types.ObjectId;
    quiz: mongoose.Schema.Types.ObjectId;
    score: number;
    total: number;
}
export declare const QuizResult: mongoose.Model<IQuizResult, {}, {}, {}, mongoose.Document<unknown, {}, IQuizResult, {}, mongoose.DefaultSchemaOptions> & IQuizResult & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IQuizResult>;
//# sourceMappingURL=quizModel.d.ts.map