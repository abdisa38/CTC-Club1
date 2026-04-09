"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizById = exports.getQuizzes = exports.getQuizResults = exports.submitQuiz = exports.createQuiz = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const quizModel_1 = require("../models/quizModel");
const courseModel_1 = __importDefault(require("../models/courseModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const apiResponse_1 = require("../utils/apiResponse");
exports.createQuiz = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, description, courseId, lessonId, questions, passingScore, timeLimit, maxAttempts, xpReward, isPublished } = req.body;
    const course = await courseModel_1.default.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    // Authorize instructor
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to add quiz to this course');
    }
    const quiz = await quizModel_1.Quiz.create({
        title,
        description,
        course: courseId,
        lesson: lessonId,
        questions,
        passingScore: passingScore || 70,
        timeLimit,
        maxAttempts: maxAttempts || 3,
        xpReward: xpReward || 10,
        isPublished: isPublished ?? false
    });
    (0, apiResponse_1.sendSuccess)(res, quiz, { statusCode: 201, message: 'Quiz created successfully' });
});
exports.submitQuiz = (0, express_async_handler_1.default)(async (req, res) => {
    const quizId = typeof req.params.id === 'string' ? req.params.id : '';
    const { answers, timeSpent } = req.body;
    // answers format: [{ questionId, userAnswerIndex, userAnswerText }]
    if (!quizId) {
        res.status(400);
        throw new Error('Quiz ID is required');
    }
    const quiz = await quizModel_1.Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }
    // Get previous attempts count
    const attemptsCount = await quizModel_1.QuizResult.countDocuments({ user: req.user._id, quiz: quizId });
    if (quiz.maxAttempts && attemptsCount >= quiz.maxAttempts) {
        res.status(400);
        throw new Error('Maximum attempts reached for this quiz.');
    }
    let score = 0;
    let totalPoints = 0;
    const processedAnswers = [];
    quiz.questions.forEach((q, i) => {
        // Find the corresponding answer from the user
        const userAnswer = answers.find((a) => (a.questionId && a.questionId.toString() === q._id?.toString()) ||
            (answers[i] !== undefined && !a.questionId) // fallback if frontend sends ordered array instead of IDs
        );
        let isCorrect = false;
        const actualAnswer = userAnswer || answers[i];
        totalPoints += q.points || 1;
        if (q.type === 'multiple-choice' || q.type === 'true-false') {
            if (actualAnswer && actualAnswer.userAnswerIndex === q.correctAnswerIndex) {
                isCorrect = true;
                score += q.points || 1;
            }
        }
        else if (q.type === 'short-answer') {
            if (actualAnswer && actualAnswer.userAnswerText &&
                actualAnswer.userAnswerText.toLowerCase().trim() === q.correctAnswerText?.toLowerCase().trim()) {
                isCorrect = true;
                score += q.points || 1;
            }
        }
        processedAnswers.push({
            questionId: q._id,
            userAnswerIndex: actualAnswer?.userAnswerIndex,
            userAnswerText: actualAnswer?.userAnswerText,
            isCorrect
        });
    });
    const percentage = (score / totalPoints) * 100;
    const isPassed = percentage >= quiz.passingScore;
    let xpEarned = 0;
    if (isPassed && attemptsCount === 0) { // Maybe 100% XP on first try, less on subsequent
        xpEarned = quiz.xpReward;
    }
    else if (isPassed) {
        xpEarned = Math.floor(quiz.xpReward * 0.5); // Half XP for retries
    }
    const result = await quizModel_1.QuizResult.create({
        user: req.user._id,
        quiz: quizId,
        course: quiz.course,
        attemptNumber: attemptsCount + 1,
        score,
        totalPoints,
        percentage,
        isPassed,
        answers: processedAnswers,
        timeSpent: timeSpent || 0,
        xpEarned
    });
    if (xpEarned > 0) {
        await userModel_1.default.findByIdAndUpdate(req.user._id, {
            $inc: { xp: xpEarned }
        });
    }
    (0, apiResponse_1.sendSuccess)(res, result, { statusCode: 201, message: 'Quiz submitted successfully' });
});
exports.getQuizResults = (0, express_async_handler_1.default)(async (req, res) => {
    // Can be used by instructor to see all results for a quiz, or student to see their own
    const quizId = typeof req.params.id === 'string' ? req.params.id : '';
    if (!quizId) {
        res.status(400);
        throw new Error('Quiz ID is required');
    }
    let filter = { quiz: quizId };
    if (req.user.role === 'student') {
        filter.user = req.user._id;
    }
    const results = await quizModel_1.QuizResult.find(filter)
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 });
    (0, apiResponse_1.sendSuccess)(res, results);
});
exports.getQuizzes = (0, express_async_handler_1.default)(async (req, res) => {
    let filter = { isDeleted: false };
    if (req.user.role === 'student') {
        filter.isPublished = true;
    }
    else if (req.user.role === 'instructor') {
        const instructorCourses = await courseModel_1.default.find({ instructor: req.user._id }).select('_id');
        filter.course = { $in: instructorCourses.map(c => c._id) };
    }
    const quizzes = await quizModel_1.Quiz.find(filter).populate('course', 'title coverImage').sort({ createdAt: -1 });
    (0, apiResponse_1.sendSuccess)(res, quizzes);
});
exports.getQuizById = (0, express_async_handler_1.default)(async (req, res) => {
    const quizId = typeof req.params.id === 'string' ? req.params.id : '';
    if (!quizId) {
        res.status(400);
        throw new Error('Quiz ID is required');
    }
    const quizDoc = await quizModel_1.Quiz.findById(quizId).populate('course', 'title');
    if (!quizDoc) {
        res.status(404);
        throw new Error('Quiz not found');
    }
    const quiz = quizDoc.toObject();
    // Remove correct answers if student
    if (req.user.role === 'student') {
        quiz.questions.forEach((q) => {
            q.correctAnswerIndex = undefined;
            q.correctAnswerText = undefined;
        });
    }
    (0, apiResponse_1.sendSuccess)(res, quiz);
});
//# sourceMappingURL=quizController.js.map