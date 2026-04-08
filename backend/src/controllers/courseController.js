"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollCourse = exports.deleteCourse = exports.updateCourse = exports.getCourseById = exports.getCourses = exports.createCourse = void 0;
const courseModel_1 = __importDefault(require("../models/courseModel"));
// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = async (req, res) => {
    try {
        const { title, description, coverImage, category, price } = req.body;
        const course = await courseModel_1.default.create({
            title,
            description,
            instructor: req.user._id, // the user creating it is an instructor
            coverImage,
            category,
            price,
        });
        res.status(201).json(course);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createCourse = createCourse;
// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const courses = await courseModel_1.default.find({}).populate('instructor', 'name email avatar');
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCourses = getCourses;
// @desc    Get singular course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await courseModel_1.default.findById(req.params.id)
            .populate('instructor', 'name email avatar')
            .populate('students', 'name');
        if (course) {
            res.json(course);
        }
        else {
            res.status(404).json({ message: 'Course not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCourseById = getCourseById;
// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
const updateCourse = async (req, res) => {
    try {
        const { title, description, coverImage, category, price } = req.body;
        const course = await courseModel_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if the current user is the instructor of the course or an admin
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to update this course' });
        }
        course.title = title || course.title;
        course.description = description || course.description;
        course.coverImage = coverImage || course.coverImage;
        course.category = category || course.category;
        course.price = price !== undefined ? price : course.price;
        const updatedCourse = await course.save();
        res.json(updatedCourse);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateCourse = updateCourse;
// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await courseModel_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this course' });
        }
        await course.deleteOne();
        res.json({ message: 'Course removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteCourse = deleteCourse;
// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (student role etc)
const enrollCourse = async (req, res) => {
    try {
        const course = await courseModel_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if already enrolled
        const alreadyEnrolled = course.students.find((student) => student.toString() === req.user._id.toString());
        if (alreadyEnrolled) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }
        course.students.push(req.user._id);
        await course.save();
        res.status(200).json({ message: 'Successfully enrolled in course' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.enrollCourse = enrollCourse;
//# sourceMappingURL=courseController.js.map