import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import Lesson from '../models/lessonModel';
import Course from '../models/courseModel';
import { sendSuccess } from '../utils/apiResponse';

const assertObjectId = (value: unknown, label: string) => {
  const id = String(value || '').trim();
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`${label} is invalid`);
  }
  return id;
};

const assertCanManageCourseLessons = (course: any, user: any) => {
  if (user.role === 'admin') {
    return;
  }

  if (String(course.instructor) !== String(user._id)) {
    throw new Error('Not authorized to manage lessons for this course');
  }
};

// @desc    Add a lesson to a course
// @route   POST /api/courses/:courseId/lessons
// @access  Private/Instructor
export const addLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, videoUrl, order, duration, attachments, isPublished } = req.body;
  const courseId = assertObjectId(req.params.courseId, 'Course ID');

  const course = await Course.findById(courseId).select('instructor');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  assertCanManageCourseLessons(course, req.user);

  const lessonPayload: any = {
    title,
    content: content || title,
    course: courseId,
    attachments: Array.isArray(attachments) ? attachments : [],
  };

  if (videoUrl) {
    lessonPayload.videoUrl = String(videoUrl).trim();
  }

  if (order !== undefined) {
    lessonPayload.order = order;
  }

  if (duration !== undefined) {
    const parsedDuration = Number(duration);
    if (Number.isFinite(parsedDuration) && parsedDuration >= 0) {
      lessonPayload.duration = parsedDuration;
    }
  }

  if (typeof isPublished === 'boolean') {
    lessonPayload.isPublished = isPublished;
  }

  const lesson = await Lesson.create(lessonPayload);
  sendSuccess(res, lesson, { statusCode: 201, message: 'Lesson created successfully' });
});

// @desc    Update a lesson
// @route   PUT /api/courses/lessons/:lessonId
// @access  Private/Instructor
export const updateLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lessonId = assertObjectId(req.params.lessonId, 'Lesson ID');
  const { title, content, videoUrl, order, duration, attachments, isPublished } = req.body;

  const lesson = await Lesson.findById(lessonId).populate('course', 'instructor');
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const course = lesson.course as any;
  assertCanManageCourseLessons(course, req.user);

  if (title) {
    lesson.title = String(title).trim();
  }

  if (content) {
    lesson.content = String(content).trim();
  }

  if (videoUrl !== undefined) {
    lesson.videoUrl = String(videoUrl || '').trim();
  }

  if (order !== undefined) {
    lesson.order = order;
  }

  if (duration !== undefined) {
    const parsedDuration = Number(duration);
    if (Number.isFinite(parsedDuration) && parsedDuration >= 0) {
      lesson.duration = parsedDuration;
    }
  }

  if (Array.isArray(attachments)) {
    lesson.attachments = attachments;
  }

  if (typeof isPublished === 'boolean') {
    lesson.isPublished = isPublished;
  }

  const updatedLesson = await lesson.save();
  sendSuccess(res, updatedLesson, { message: 'Lesson updated successfully' });
});

// @desc    Delete a lesson
// @route   DELETE /api/courses/lessons/:lessonId
// @access  Private/Instructor
export const deleteLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const lessonId = assertObjectId(req.params.lessonId, 'Lesson ID');

  const lesson = await Lesson.findById(lessonId).populate('course', 'instructor');
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const course = lesson.course as any;
  assertCanManageCourseLessons(course, req.user);

  await lesson.deleteOne();
  sendSuccess(res, null, { message: 'Lesson removed' });
});

// @desc    Get lessons by course
// @route   GET /api/courses/:courseId/lessons
// @access  Private
export const getLessonsByCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const courseId = assertObjectId(req.params.courseId, 'Course ID');

  const course = await Course.findById(courseId).select('price students instructor');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isPrivilegedUser = req.user.role === 'admin' || String(course.instructor) === String(req.user._id);
  const isPaidCourse = Number(course.price || 0) > 0;
  const isEnrolled =
    Array.isArray(course.students) &&
    course.students.some((studentId: any) => String(studentId) === String(req.user._id));

  if (isPaidCourse && !isPrivilegedUser && !isEnrolled) {
    res.status(403);
    throw new Error('Enroll in this paid course to access lessons');
  }

  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).lean();
  sendSuccess(res, lessons);
});
