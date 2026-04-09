"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewProject = exports.submitProject = exports.createProject = exports.getProjectSubmissions = exports.getProjects = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const projectModel_1 = require("../models/projectModel");
const userModel_1 = __importDefault(require("../models/userModel"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const apiResponse_1 = require("../utils/apiResponse");
// @desc    Get projects based on role
// @route   GET /api/projects
// @access  Private
exports.getProjects = (0, express_async_handler_1.default)(async (req, res) => {
    const courseId = typeof req.query.courseId === 'string' ? req.query.courseId : undefined;
    let filter = { isDeleted: false };
    if (courseId) {
        filter.course = courseId;
    }
    if (req.user.role === 'student') {
        filter.isPublished = true;
    }
    if (req.user.role === 'instructor') {
        const instructorCourses = await courseModel_1.default.find({ instructor: req.user._id, isDeleted: false }).select('_id');
        const courseIds = instructorCourses.map((c) => c._id);
        if (courseId) {
            const hasAccess = courseIds.some((id) => id.toString() === courseId.toString());
            if (!hasAccess) {
                filter.course = null;
            }
        }
        else {
            filter.course = { $in: courseIds };
        }
    }
    const projects = await projectModel_1.Project.find(filter)
        .populate('course', 'title')
        .sort({ createdAt: -1 });
    (0, apiResponse_1.sendSuccess)(res, projects);
});
// @desc    Get project submissions for role
// @route   GET /api/projects/submissions
// @access  Private
exports.getProjectSubmissions = (0, express_async_handler_1.default)(async (req, res) => {
    const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : undefined;
    let filter = {};
    if (projectId) {
        filter.project = projectId;
    }
    if (req.user.role === 'student') {
        filter.student = req.user._id;
    }
    if (req.user.role === 'instructor') {
        const instructorCourses = await courseModel_1.default.find({ instructor: req.user._id, isDeleted: false }).select('_id');
        filter.course = { $in: instructorCourses.map((c) => c._id) };
    }
    const submissions = await projectModel_1.ProjectSubmission.find(filter)
        .populate('student', 'name email avatar')
        .populate('project', 'title maxPoints xpReward')
        .populate('course', 'title')
        .sort({ updatedAt: -1 });
    (0, apiResponse_1.sendSuccess)(res, submissions);
});
// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Instructor
exports.createProject = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, description, courseId, lessonId, instructions, requirements, xpReward, maxPoints, deadline, isPublished } = req.body;
    // Verify course exists
    const course = await courseModel_1.default.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    // Authorize instructor
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to add project to this course');
    }
    const project = await projectModel_1.Project.create({
        title,
        description,
        course: courseId,
        lesson: lessonId,
        instructions,
        requirements,
        xpReward,
        maxPoints,
        deadline,
        isPublished: isPublished ?? false
    });
    (0, apiResponse_1.sendSuccess)(res, project, { statusCode: 201, message: 'Project created successfully' });
});
// @desc    Submit a project
// @route   POST /api/projects/:id/submit
// @access  Private/Student
exports.submitProject = (0, express_async_handler_1.default)(async (req, res) => {
    const { repoUrl, liveUrl, files, comments } = req.body;
    const projectId = typeof req.params.id === 'string' ? req.params.id : '';
    if (!projectId) {
        res.status(400);
        throw new Error('Project ID is required');
    }
    const project = await projectModel_1.Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }
    // Check if student already submitted
    const existingSubmission = await projectModel_1.ProjectSubmission.findOne({ student: req.user._id, project: projectId });
    if (existingSubmission) {
        // If existing, we can let them update it if it's not graded yet
        if (existingSubmission.status === 'graded') {
            res.status(400);
            throw new Error('Project is already graded, cannot resubmit.');
        }
        existingSubmission.repoUrl = repoUrl || existingSubmission.repoUrl;
        existingSubmission.liveUrl = liveUrl || existingSubmission.liveUrl;
        existingSubmission.files = files || existingSubmission.files;
        existingSubmission.comments = comments || existingSubmission.comments;
        existingSubmission.status = 'submitted';
        await existingSubmission.save();
        (0, apiResponse_1.sendSuccess)(res, existingSubmission, { message: 'Project submission updated' });
        return;
    }
    const submission = await projectModel_1.ProjectSubmission.create({
        student: req.user._id,
        project: projectId,
        course: project.course,
        repoUrl,
        liveUrl,
        files,
        comments,
        status: 'submitted'
    });
    (0, apiResponse_1.sendSuccess)(res, submission, { statusCode: 201, message: 'Project submitted successfully' });
});
// @desc    Review and Grade a projected
// @route   PUT /api/projects/submissions/:submissionId/review
// @access  Private/Instructor
exports.reviewProject = (0, express_async_handler_1.default)(async (req, res) => {
    const { grade, feedback } = req.body;
    const submissionId = typeof req.params.submissionId === 'string' ? req.params.submissionId : '';
    if (!submissionId) {
        res.status(400);
        throw new Error('Submission ID is required');
    }
    const submission = await projectModel_1.ProjectSubmission.findById(submissionId).populate('project');
    if (!submission) {
        res.status(404);
        throw new Error('Submission not found');
    }
    const project = submission.project;
    // Ideally verify instructor owns the course 
    const course = await courseModel_1.default.findById(submission.course);
    if (!course || (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
        res.status(403);
        throw new Error('Not authorized to grade this submission');
    }
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    // Calculate XP based on grade percentage
    if (grade !== undefined && project.maxPoints) {
        const percentage = grade / project.maxPoints;
        submission.xpEarned = Math.floor(project.xpReward * percentage);
        // Give XP to student
        await userModel_1.default.findByIdAndUpdate(submission.student, {
            $inc: { xp: submission.xpEarned }
        });
    }
    await submission.save();
    (0, apiResponse_1.sendSuccess)(res, submission, { message: 'Project reviewed successfully' });
});
//# sourceMappingURL=projectController.js.map