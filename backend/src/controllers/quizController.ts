import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Quiz, QuizResult } from '../models/quizModel';

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { title, courseId, questions } = req.body;
    const quiz = await Quiz.create({ title, course: courseId, questions });
    res.status(201).json(quiz);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const quizId = req.params.id;
    const { answers } = req.body; // array of indexes
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    quiz.questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correctAnswerIndex) score += 1;
    });

    const result = await QuizResult.create({
      user: req.user._id,
      quiz: quizId,
      score,
      total: quiz.questions.length,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizResults = async (req: AuthRequest, res: Response) => {
  try {
    const results = await QuizResult.find({ quiz: req.params.id }).populate('user', 'name email');
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
