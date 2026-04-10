"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollCourse = exports.deleteCourse = exports.updateCourse = exports.getCourseById = exports.getCourses = exports.createCourse = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const apiResponse_1 = require("../utils/apiResponse");
// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor
exports.createCourse = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, description, coverImage, category, price } = req.body;
    const course = await courseModel_1.default.create({
        title,
        description,
        instructor: req.user._id, // the user creating it is an instructor
        coverImage,
        category,
        price,
    });
    (0, apiResponse_1.sendSuccess)(res, course, { statusCode: 201, message: 'Course created successfully' });
});
// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = (0, express_async_handler_1.default)(async (req, res) => {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
        ? {
            title: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};
    const queryFilter = { ...keyword, isDeleted: false };
    if (req.query.status) {
        queryFilter.status = req.query.status;
    }
    else if (!req.user || req.user.role === 'student') {
        // Public / Students should only see published ones
        queryFilter.status = 'published';
    } // Admins and Instructors can fetch without limit if specified (dashboard logic handled separate usually)
    const count = await courseModel_1.default.countDocuments(queryFilter);
    const courseQuery = courseModel_1.default.find(queryFilter)
        .populate('instructor', 'name email avatar')
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    if (!req.user || req.user.role === 'student') {
        courseQuery.select('-students'); // Keep public/student payload lightweight
    }
    const courses = await courseQuery;
    res.json({
        success: true,
        data: courses,
        courses,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});
// @desc    Get singular course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = (0, express_async_handler_1.default)(async (req, res) => {
    const course = await courseModel_1.default.findById(req.params.id)
        .populate('instructor', 'name email avatar')
        .slice('students', 10); // Only bring back first 10 students if ever needed for preview, prevents memory overload
    if (course) {
        (0, apiResponse_1.sendSuccess)(res, course);
    }
    else {
        res.status(404);
        throw new Error('Course not found');
    }
});
// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
exports.updateCourse = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, description, coverImage, category, price } = req.body;
    const course = await courseModel_1.default.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    // Check if the current user is the instructor of the course or an admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('You are not authorized to update this course');
    }
    course.title = title || course.title;
    course.description = description || course.description;
    course.coverImage = coverImage || course.coverImage;
    course.category = category || course.category;
    course.price = price !== undefined ? price : course.price;
    const updatedCourse = await course.save();
    (0, apiResponse_1.sendSuccess)(res, updatedCourse, { message: 'Course updated successfully' });
});
// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor/Admin
exports.deleteCourse = (0, express_async_handler_1.default)(async (req, res) => {
    const course = await courseModel_1.default.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('You are not authorized to delete this course');
    }
    await course.deleteOne();
    (0, apiResponse_1.sendSuccess)(res, null, { message: 'Course removed' });
});
// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (student role etc)
exports.enrollCourse = (0, express_async_handler_1.default)(async (req, res) => {
    // Use $addToSet to avoid race conditions. This guarantees a user is only added once natively by MongoDB
    const course = await courseModel_1.default.findByIdAndUpdate(req.params.id, { $addToSet: { students: req.user._id } }, { new: true } // Returns the updated document
    );
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    await userModel_1.default.findByIdAndUpdate(req.user._id, {
        $addToSet: { enrolledCourses: course._id },
    });
    (0, apiResponse_1.sendSuccess)(res, course, { message: 'Successfully enrolled in course' });
});
//# sourceMappingURL=courseController.js.map