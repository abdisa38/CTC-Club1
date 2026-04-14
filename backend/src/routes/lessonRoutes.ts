import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import {
  addLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourse,
} from '../controllers/lessonController';
import { courseIdParamSchema, createLessonSchema, updateLessonSchema } from '../validators/lessonValidator';

// We add mergeParams so that we can access the :courseId if it's passed from the courseRouter
const router = express.Router({ mergeParams: true });

// The route might look like: /api/courses/:courseId/lessons
router.route('/')
  .get(protect as any, validateRequest(courseIdParamSchema), getLessonsByCourse as any) // Get lessons of a specific course id that is passed through params
  .post(protect as any, authorizeRoles('instructor', 'admin'), validateRequest(createLessonSchema), addLesson as any); // Instructor adds a lesson

// The route looks like: /api/courses/lessons/:lessonId (Mounted directly in server or courseRouter)
router.route('/:lessonId')
  .put(protect as any, authorizeRoles('instructor', 'admin'), validateRequest(updateLessonSchema), updateLesson as any)
  .delete(protect as any, authorizeRoles('instructor', 'admin'), deleteLesson as any);

export default router;
