"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizById = exports.getQuizzes = exports.getQuizResults = exports.submitQuiz = exports.deleteQuizQuestion = exports.updateQuizQuestion = exports.addQuizQuestion = exports.deleteQuiz = exports.updateQuiz = exports.createQuiz = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const quizModel_1 = require("../models/quizModel");
const courseModel_1 = __importDefault(require("../models/courseModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const apiResponse_1 = require("../utils/apiResponse");
const assertQuizId = (value) => {
    return typeof value === 'string' ? value : '';
};
const assertQuestionId = (value) => {
    return typeof value === 'string' ? value : '';
};
const ensureCourseOwnership = async (courseId, user) => {
    const course = await courseModel_1.default.findById(courseId).select('instructor');
    if (!course) {
        const error = new Error('Course not found');
        error.statusCode = 404;
        throw error;
    }
    if (user.role !== 'admin' && course.instructor.toString() !== user._id.toString()) {
        const error = new Error('Not authorized for this course');
        error.statusCode = 403;
        throw error;
    }
};
const ensureQuizOwnership = async (quiz, user) => {
    const quizCourseId = typeof quiz.course === 'string' ? quiz.course : quiz.course?.toString();
    await ensureCourseOwnership(quizCourseId, user);
};
const normalizeQuestionPayload = (payload) => {
    const type = payload?.type || 'multiple-choice';
    const questionText = String(payload?.questionText || '').trim();
    const points = Number(payload?.points);
    const normalizedPoints = Number.isFinite(points) && points > 0 ? points : 1;
    if (!questionText) {
        throw new Error('Question text is required');
    }
    if (type === 'short-answer') {
        const correctAnswerText = String(payload?.correctAnswerText || '').trim();
        if (!correctAnswerText) {
            throw new Error('Short answer questions require a correct answer text');
        }
        return {
            questionText,
            type,
            correctAnswerText,
            points: normalizedPoints,
            options: [],
            correctAnswerIndex: undefined,
        };
    }
    if (type === 'true-false') {
        const correctAnswerIndex = Number(payload?.correctAnswerIndex);
        if (![0, 1].includes(correctAnswerIndex)) {
            throw new Error('True/false question requires correct answer index 0 or 1');
        }
        return {
            questionText,
            type,
            options: ['True', 'False'],
            correctAnswerIndex,
            correctAnswerText: undefined,
            points: normalizedPoints,
        };
    }
    const options = Array.isArray(payload?.options)
        ? payload.options.map((item) => String(item || '').trim()).filter(Boolean)
        : [];
    if (options.length < 2) {
        throw new Error('Multiple-choice question requires at least 2 options');
    }
    const correctAnswerIndex = Number(payload?.correctAnswerIndex);
    if (!Number.isInteger(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
        throw new Error('Correct answer index is out of range');
    }
    return {
        questionText,
        type: 'multiple-choice',
        options,
        correctAnswerIndex,
        correctAnswerText: undefined,
        points: normalizedPoints,
    };
};
exports.createQuiz = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, description, courseId, lessonId, questions, passingScore, timeLimit, maxAttempts, xpReward, isPublished } = req.body;
    await ensureCourseOwnership(String(courseId), req.user);
    const quiz = await quizModel_1.Quiz.create({
        title,
        description,
        course: courseId,
        lesson: lessonId,
        questions: Array.isArray(questions) ? questions : [],
        passingScore: passingScore || 70,
        timeLimit,
        maxAttempts: maxAttempts || 3,
        xpReward: xpReward || 10,
        isPublished: isPublished ?? false
    });
    (0, apiResponse_1.sendSuccess)(res, quiz, { statusCode: 201, message: 'Quiz created successfully' });
});
exports.updateQuiz = (0, express_async_handler_1.default)(async (req, res) => {
    const quizId = assertQuizId(req.params.id);
    if (!quizId) {
        res.status(400);
        throw new Error('Quiz ID is required');
    }
    const quiz = await quizModel_1.Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }
    await ensureQuizOwnership(quiz, req.user);
    const { title, description, courseId, lessonId, passingScore, timeLimit, maxAttempts, xpReward, isPublished } = req.body;
    if (courseId && courseId.toString() !== quiz.course.toString()) {
        await ensureCourseOwnership(String(courseId), req.user);
        quiz.course = courseId;
    }
    if (title !== undefined)
        quiz.title = title;
    if (description !== undefined)
        quiz.description = description;
    if (lessonId !== undefined)
        quiz.lesson = lessonId || undefined;
    if (passingScore !== undefined)
        quiz.passingScore = Number(passingScore);
    if (timeLimit !== undefined)
        quiz.timeLimit = Number(timeLimit) || undefined;
    if (maxAttempts !== undefined)
        quiz.maxAttempts = Number(maxAttempts);
    if (xpReward !== undefined)
        quiz.xpReward = Number(xpReward);
    if (typeof isPublished === 'boolean')
        quiz.isPublished = isPublished;
    const updated = await quiz.save();
    const populated = await quizModel_1.Quiz.findById(updated._id).populate('course', 'title coverImage');
    (0, apiResponse_1.sendSuccess)(res, populated || updated, { message: 'Quiz updated successfully' });
});
exports.deleteQuiz = (0, express_async_handler_1.default)(async (req, res) => {
    const quizId = assertQuizId(req.params.id);
    if (!quizId) {
        res.status(400);
        throw new Error('Quiz ID is required');
    }
    const quiz = await quizModel_1.Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }
    await ensureQuizOwnership(quiz, req.user);
    quiz.isDeleted = true;
    await quiz.save();
    (0, apiResponse_1.sendSuccess)(res, null, { message: 'Quiz deleted successfully' });
});
exports.addQuizQuestion = (0, express_async_handler_1.default)(async (req, res) => {
    const quizId = assertQuizId(req.params.id);
    if (!quizId) {
        res.status(400);
        throw new Error('Quiz ID is required');
    }
    const quiz = await quizModel_1.Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }
    await ensureQuizOwnership(quiz, req.user);
    let questionPayload;
    try {
        questionPayload = normalizeQuestionPayload(req.body);
    }
    catch (error) {
        res.status(400);
        throw new Error(error.message || 'Invalid question payload');
    }
    quiz.questions.push(questionPayload);
    const updated = await quiz.save();
    const populated = await quizModel_1.Quiz.findById(updated._id).populate('course', 'title coverImage');
    (0, apiResponse_1.sendSuccess)(res, populated || updated, { message: 'Question added successfully' });
});
exports.updateQuizQuestion = (0, express_async_handler_1.default)(async (req, res) => {
    const quizId = assertQuizId(req.params.id);
    const questionId = assertQuestionId(req.params.questionId);
    if (!quizId || !questionId) {
        res.status(400);
        throw new Error('Quiz ID and question ID are required');
    }
    const quiz = await quizModel_1.Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }
    await ensureQuizOwnership(quiz, req.user);
    const question = quiz.questions.id(questionId);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }
    let questionPayload;
    try {
        questionPayload = normalizeQuestionPayload({
            ...question.toObject(),
            ...req.body,
        });
    }
    catch (error) {
        res.status(400);
        throw new Error(error.message || 'Invalid question payload');
    }
    question.questionText = questionPayload.questionText;
    question.type = questionPayload.type;
    question.options = questionPayload.options;
    question.correctAnswerIndex = questionPayload.correctAnswerIndex;
    question.correctAnswerText = questionPayload.correctAnswerText;
    question.points = questionPayload.points;
    const updated = await quiz.save();
    const populated = await quizModel_1.Quiz.findById(updated._id).populate('course', 'title coverImage');
    (0, apiResponse_1.sendSuccess)(res, populated || updated, { message: 'Question updated successfully' });
});
exports.deleteQuizQuestion = (0, express_async_handler_1.default)(async (req, res) => {
    const quizId = assertQuizId(req.params.id);
    const questionId = assertQuestionId(req.params.questionId);
    if (!quizId || !questionId) {
        res.status(400);
        throw new Error('Quiz ID and question ID are required');
    }
    const quiz = await quizModel_1.Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }
    await ensureQuizOwnership(quiz, req.user);
    const question = quiz.questions.id(questionId);
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }
    question.deleteOne();
    const updated = await quiz.save();
    const populated = await quizModel_1.Quiz.findById(updated._id).populate('course', 'title coverImage');
    (0, apiResponse_1.sendSuccess)(res, populated || updated, { message: 'Question deleted successfully' });
});
exports.submitQuiz = (0, express_async_handler_1.default)(async (req, res) => {
    const quizId = assertQuizId(req.params.id);
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
    const quizId = assertQuizId(req.params.id);
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
    const quizId = assertQuizId(req.params.id);
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