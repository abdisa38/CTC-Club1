"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizResults = exports.submitQuiz = exports.createQuiz = void 0;
const quizModel_1 = require("../models/quizModel");
const createQuiz = async (req, res) => {
    try {
        const { title, courseId, questions } = req.body;
        const quiz = await quizModel_1.Quiz.create({ title, course: courseId, questions });
        res.status(201).json(quiz);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createQuiz = createQuiz;
const submitQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const { answers } = req.body; // array of indexes
        const quiz = await quizModel_1.Quiz.findById(quizId);
        if (!quiz)
            return res.status(404).json({ message: 'Quiz not found' });
        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswerIndex)
                score += 1;
        });
        const result = await quizModel_1.QuizResult.create({
            user: req.user._id,
            quiz: quizId,
            score,
            total: quiz.questions.length,
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.submitQuiz = submitQuiz;
const getQuizResults = async (req, res) => {
    try {
        const results = await quizModel_1.QuizResult.find({ quiz: req.params.id }).populate('user', 'name email');
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getQuizResults = getQuizResults;
//# sourceMappingURL=quizController.js.map