"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLessonsByCourse = exports.deleteLesson = exports.updateLesson = exports.addLesson = void 0;
const lessonModel_1 = __importDefault(require("../models/lessonModel"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const apiResponse_1 = require("../utils/apiResponse");
// @desc    Add a lesson to a course
// @route   POST /api/courses/:courseId/lessons
// @access  Private/Instructor
const addLesson = async (req, res) => {
    try {
        const { title, content, videoUrl, order } = req.body;
        const courseId = typeof req.params.courseId === 'string' ? req.params.courseId : '';
        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }
        // Verify course exists
        const course = await courseModel_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Verify ownership or roles if needed (instructor check handled in middleware mostly)
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
        }
        const lesson = await lessonModel_1.default.create({
            title,
            content,
            videoUrl,
            order,
            course: courseId,
        });
        (0, apiResponse_1.sendSuccess)(res, lesson, { statusCode: 201, message: 'Lesson created successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addLesson = addLesson;
// @desc    Update a lesson
// @route   PUT /api/courses/lessons/:lessonId
// @access  Private/Instructor
const updateLesson = async (req, res) => {
    try {
        const lessonId = typeof req.params.lessonId === 'string' ? req.params.lessonId : '';
        const { title, content, videoUrl, order } = req.body;
        if (!lessonId) {
            return res.status(400).json({ message: 'Lesson ID is required' });
        }
        const lesson = await lessonModel_1.default.findById(lessonId).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        const course = lesson.course;
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this lesson' });
        }
        lesson.title = title || lesson.title;
        lesson.content = content || lesson.content;
        lesson.videoUrl = videoUrl || lesson.videoUrl;
        lesson.order = order !== undefined ? order : lesson.order;
        const updatedLesson = await lesson.save();
        (0, apiResponse_1.sendSuccess)(res, updatedLesson, { message: 'Lesson updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateLesson = updateLesson;
// @desc    Delete a lesson
// @route   DELETE /api/courses/lessons/:lessonId
// @access  Private/Instructor
const deleteLesson = async (req, res) => {
    try {
        const lessonId = typeof req.params.lessonId === 'string' ? req.params.lessonId : '';
        if (!lessonId) {
            return res.status(400).json({ message: 'Lesson ID is required' });
        }
        const lesson = await lessonModel_1.default.findById(lessonId).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        const course = lesson.course;
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this lesson' });
        }
        await lesson.deleteOne();
        (0, apiResponse_1.sendSuccess)(res, null, { message: 'Lesson removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteLesson = deleteLesson;
// @desc    Get lessons by course
// @route   GET /api/courses/:courseId/lessons
// @access  Public or Student (depends on business logic, here we'll make it protected for enrolled students/instructor)
const getLessonsByCourse = async (req, res) => {
    try {
        const courseId = typeof req.params.courseId === 'string' ? req.params.courseId : '';
        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }
        // For a fully secure app, check if user is enrolled. For now, just return them.
        const lessons = await lessonModel_1.default.find({ course: courseId }).sort({ order: 1 });
        (0, apiResponse_1.sendSuccess)(res, lessons);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getLessonsByCourse = getLessonsByCourse;
//# sourceMappingURL=lessonController.js.map