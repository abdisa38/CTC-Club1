import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Lesson from '../models/lessonModel';
import Course from '../models/courseModel';
import { sendSuccess } from '../utils/apiResponse';

// @desc    Add a lesson to a course
// @route   POST /api/courses/:courseId/lessons
// @access  Private/Instructor
export const addLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, videoUrl, order, duration, attachments, isPublished } = req.body;
    const courseId = typeof req.params.courseId === 'string' ? req.params.courseId : '';

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify ownership or roles if needed (instructor check handled in middleware mostly)
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
    }

    const lessonPayload: any = {
      title,
      content: content || title,
      course: courseId,
      attachments: Array.isArray(attachments) ? attachments : [],
    };

    if (videoUrl) {
      lessonPayload.videoUrl = videoUrl;
    }

    if (order !== undefined) {
      lessonPayload.order = order;
    }

    if (duration !== undefined) {
      const parsedDuration = Number(duration);
      if (Number.isFinite(parsedDuration)) {
        lessonPayload.duration = parsedDuration;
      }
    }

    if (typeof isPublished === 'boolean') {
      lessonPayload.isPublished = isPublished;
    }

    const lesson = await Lesson.create(lessonPayload);

    sendSuccess(res, lesson, { statusCode: 201, message: 'Lesson created successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lesson
// @route   PUT /api/courses/lessons/:lessonId
// @access  Private/Instructor
export const updateLesson = async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = typeof req.params.lessonId === 'string' ? req.params.lessonId : '';
    const { title, content, videoUrl, order, duration, attachments, isPublished } = req.body;

    if (!lessonId) {
      return res.status(400).json({ message: 'Lesson ID is required' });
    }

    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const course: any = lesson.course;
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    lesson.title = title || lesson.title;
    lesson.content = content || lesson.content;
    lesson.videoUrl = videoUrl || lesson.videoUrl;
    lesson.order = order !== undefined ? order : lesson.order;
    if (duration !== undefined) {
      const parsedDuration = Number(duration);
      if (Number.isFinite(parsedDuration)) {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/courses/lessons/:lessonId
// @access  Private/Instructor
export const deleteLesson = async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = typeof req.params.lessonId === 'string' ? req.params.lessonId : '';

    if (!lessonId) {
      return res.status(400).json({ message: 'Lesson ID is required' });
    }

    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const course: any = lesson.course;
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    await lesson.deleteOne();
    sendSuccess(res, null, { message: 'Lesson removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lessons by course
// @route   GET /api/courses/:courseId/lessons
// @access  Public or Student (depends on business logic, here we'll make it protected for enrolled students/instructor)
export const getLessonsByCourse = async (req: AuthRequest, res: Response) => {
  try {
    const courseId = typeof req.params.courseId === 'string' ? req.params.courseId : '';

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // For a fully secure app, check if user is enrolled. For now, just return them.
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
    sendSuccess(res, lessons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
