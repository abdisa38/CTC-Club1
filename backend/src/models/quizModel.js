"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizResult = exports.Quiz = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const quizSchema = new mongoose_1.Schema({
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lesson: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lesson', index: true },
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
}, { timestamps: true });
quizSchema.pre(/^find/, function () {
    this.where({ isDeleted: { $ne: true } });
});
exports.Quiz = mongoose_1.default.model('Quiz', quizSchema);
const quizResultSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quiz: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    attemptNumber: { type: Number, default: 1 },
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    isPassed: { type: Boolean, required: true },
    answers: [{
            questionId: { type: mongoose_1.Schema.Types.ObjectId },
            userAnswerIndex: { type: Number },
            userAnswerText: { type: String },
            isCorrect: { type: Boolean }
        }],
    timeSpent: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
}, { timestamps: true });
quizResultSchema.index({ user: 1, quiz: 1 });
exports.QuizResult = mongoose_1.default.model('QuizResult', quizResultSchema);
//# sourceMappingURL=quizModel.js.map