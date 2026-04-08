import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { Quiz, QuizResult } from '../models/quizModel';
import Course from '../models/courseModel';
import User from '../models/userModel';

export const createQuiz = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, courseId, lessonId, questions, passingScore, timeLimit, maxAttempts, xpReward, isPublished } = req.body;
  
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Authorize instructor
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add quiz to this course');
  }

  const quiz = await Quiz.create({ 
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
  
  res.status(201).json(quiz);
});

export const submitQuiz = asyncHandler(async (req: AuthRequest, res: Response) => {
  const quizId = req.params.id;
  const { answers, timeSpent } = req.body; 
  // answers format: [{ questionId, userAnswerIndex, userAnswerText }]

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Get previous attempts count
  const attemptsCount = await QuizResult.countDocuments({ user: req.user._id, quiz: quizId });
  if (quiz.maxAttempts && attemptsCount >= quiz.maxAttempts) {
      res.status(400);
      throw new Error('Maximum attempts reached for this quiz.');
  }

  let score = 0;
  let totalPoints = 0;
  const processedAnswers: any[] = [];

  quiz.questions.forEach((q: any, i: number) => {
      // Find the corresponding answer from the user
      const userAnswer = answers.find((a: any) => 
        (a.questionId && a.questionId.toString() === q._id?.toString()) || 
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
      } else if (q.type === 'short-answer') {
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
  } else if (isPassed) {
      xpEarned = Math.floor(quiz.xpReward * 0.5); // Half XP for retries
  }

  const result = await QuizResult.create({
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
      await User.findByIdAndUpdate(req.user._id, {
          $inc: { xp: xpEarned }
      });
  }

  res.status(201).json(result);
});

export const getQuizResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Can be used by instructor to see all results for a quiz, or student to see their own
  let filter: any = { quiz: req.params.id };

  if (req.user.role === 'student') {
      filter.user = req.user._id;
  }

  const results = await QuizResult.find(filter)
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });

  res.json(results);
});

export const getQuizzes = asyncHandler(async (req: AuthRequest, res: Response) => {
    let filter: any = { isDeleted: false };
    if (req.user.role === 'student') {
        filter.isPublished = true;
    } else if (req.user.role === 'instructor') {
        const instructorCourses = await Course.find({ instructor: req.user._id }).select('_id');
        filter.course = { $in: instructorCourses.map(c => c._id) };
    }
    const quizzes = await Quiz.find(filter).populate('course', 'title coverImage').sort({ createdAt: -1 });
    res.json(quizzes);
});

export const getQuizById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title');
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }
    // Remove correct answers if student
    if (req.user.role === 'student') {
        quiz.questions.forEach(q => {
            q.correctAnswerIndex = undefined;
            q.correctAnswerText = undefined;
        });
    }
    res.json(quiz);
});
