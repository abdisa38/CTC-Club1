import express from 'express';
import { protect, authorizeRoles, optionalProtect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { createCourseSchema, updateCourseSchema } from '../validators/courseValidator';
import {
  createCourse,
  deleteCourse,
  enrollCourse,
  getMyCourseRating,
  getCourseById,
  getCourses,
  rateCourse,
  updateCourse,
} from '../controllers/courseController';
import lessonRoutes from './lessonRoutes';

const router = express.Router();

// Get all courses & Create a course (Instructors/Admins)
router.route('/')
  .get(optionalProtect as any, getCourses as any)
  .post(protect as any, authorizeRoles('instructor', 'admin'), validateRequest(createCourseSchema), createCourse as any);

// ID operations: Get singular, Update, Delete
router.route('/:id')
  .get(getCourseById as any)
  .put(protect as any, authorizeRoles('instructor', 'admin'), validateRequest(updateCourseSchema), updateCourse as any)
  .delete(protect as any, authorizeRoles('instructor', 'admin'), deleteCourse as any);

// Enroll in a course (Students mostly, but maybe others too)
router.post('/:id/enroll', protect as any, enrollCourse as any);
router.post('/:id/rate', protect as any, rateCourse as any);
router.get('/:id/rate/me', protect as any, getMyCourseRating as any);

// Sub-routing for lessons: Any request to /api/courses/:courseId/lessons will be handed to lessonRoutes
router.use('/:courseId/lessons', lessonRoutes);

export default router;
