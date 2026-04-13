import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project, ProjectSubmission } from '../models/projectModel';
import User from '../models/userModel';
import Course from '../models/courseModel';
import Notification from '../models/notificationModel';
import { sendSuccess } from '../utils/apiResponse';

// @desc    Get projects based on role
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const courseId = typeof req.query.courseId === 'string' ? req.query.courseId : undefined;

  let filter: any = { isDeleted: false };
  if (courseId) {
    filter.course = courseId;
  }

  if (req.user.role === 'student') {
    filter.isPublished = true;
  }

  if (req.user.role === 'instructor') {
    const instructorCourses = await Course.find({ instructor: req.user._id, isDeleted: false }).select('_id');
    const courseIds = instructorCourses.map((c) => c._id);

    if (courseId) {
      const hasAccess = courseIds.some((id) => id.toString() === courseId.toString());
      if (!hasAccess) {
        filter.course = null;
      }
    } else {
      filter.course = { $in: courseIds };
    }
  }

  const projects = await Project.find(filter)
    .populate('course', 'title')
    .sort({ createdAt: -1 });

  sendSuccess(res, projects);
});

// @desc    Get project submissions for role
// @route   GET /api/projects/submissions
// @access  Private
export const getProjectSubmissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : undefined;
  let filter: any = {};

  if (projectId) {
    filter.project = projectId;
  }

  if (req.user.role === 'student') {
    filter.student = req.user._id;
  }

  if (req.user.role === 'instructor') {
    const instructorCourses = await Course.find({ instructor: req.user._id, isDeleted: false }).select('_id');
    filter.course = { $in: instructorCourses.map((c) => c._id) };
  }

  const submissions = await ProjectSubmission.find(filter)
    .populate('student', 'name email avatar')
    .populate('project', 'title maxPoints xpReward')
    .populate('course', 'title')
    .sort({ updatedAt: -1 });

  sendSuccess(res, submissions);
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Instructor
export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, courseId, lessonId, instructions, requirements, xpReward, maxPoints, deadline, isPublished } = req.body;
  
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Authorize instructor
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add project to this course');
  }

  const project = await Project.create({ 
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

  sendSuccess(res, project, { statusCode: 201, message: 'Project created successfully' });
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Instructor/Admin
export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  const {
    title,
    description,
    courseId,
    lessonId,
    instructions,
    requirements,
    xpReward,
    maxPoints,
    deadline,
    isPublished,
  } = req.body;

  if (!projectId) {
    res.status(400);
    throw new Error('Project ID is required');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const targetCourseId = courseId || project.course;
  const course = await Course.findById(targetCourseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this project');
  }

  if (typeof title === 'string' && title.trim()) {
    project.title = title.trim();
  }

  if (typeof description === 'string' && description.trim()) {
    project.description = description.trim();
  }

  if (courseId) {
    project.course = course._id as any;
  }

  if (lessonId !== undefined) {
    project.lesson = lessonId || undefined;
  }

  if (typeof instructions === 'string') {
    project.instructions = instructions;
  }

  if (Array.isArray(requirements)) {
    project.requirements = requirements;
  }

  if (xpReward !== undefined) {
    const rewardValue = Number(xpReward);
    if (!Number.isFinite(rewardValue) || rewardValue < 0) {
      res.status(400);
      throw new Error('XP reward must be a valid non-negative number');
    }
    project.xpReward = rewardValue;
  }

  if (maxPoints !== undefined) {
    const pointsValue = Number(maxPoints);
    if (!Number.isFinite(pointsValue) || pointsValue <= 0) {
      res.status(400);
      throw new Error('Max points must be a valid positive number');
    }
    project.maxPoints = pointsValue;
  }

  if (deadline !== undefined) {
    if (deadline === null || deadline === '') {
      project.set('deadline', undefined);
    } else {
      const parsed = new Date(deadline);
      if (Number.isNaN(parsed.getTime())) {
        res.status(400);
        throw new Error('Invalid deadline date');
      }
      project.deadline = parsed;
    }
  }

  if (typeof isPublished === 'boolean') {
    project.isPublished = isPublished;
  }

  const updated = await project.save();
  const populated = await Project.findById(updated._id).populate('course', 'title');
  sendSuccess(res, populated || updated, { message: 'Project updated successfully' });
});

// @desc    Delete a project (soft delete)
// @route   DELETE /api/projects/:id
// @access  Private/Instructor/Admin
export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const projectId = typeof req.params.id === 'string' ? req.params.id : '';

  if (!projectId) {
    res.status(400);
    throw new Error('Project ID is required');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const course = await Course.findById(project.course).select('instructor');
  if (!course || (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
    res.status(403);
    throw new Error('Not authorized to delete this project');
  }

  project.isDeleted = true;
  await project.save();

  sendSuccess(res, null, { message: 'Project deleted successfully' });
});

// @desc    Submit a project
// @route   POST /api/projects/:id/submit
// @access  Private/Student
export const submitProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { repoUrl, liveUrl, files, comments } = req.body;
  const projectId = typeof req.params.id === 'string' ? req.params.id : '';

  if (!projectId) {
    res.status(400);
    throw new Error('Project ID is required');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const course = await Course.findById(project.course).select('instructor title');

  // Check if student already submitted
  const existingSubmission = await ProjectSubmission.findOne({ student: req.user._id, project: projectId });
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

    if (course && course.instructor.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: course.instructor,
        title: 'Project submission updated',
        message: `${req.user.name || 'A student'} updated submission for "${project.title}"`,
        type: 'message',
        relatedId: project._id as any,
        link: `/app/courses/${course._id.toString()}?tab=projects`,
      });
    }

    sendSuccess(res, existingSubmission, { message: 'Project submission updated' });
    return;
  }

  const submission = await ProjectSubmission.create({
    student: req.user._id,
    project: projectId,
    course: project.course,
    repoUrl,
    liveUrl,
    files,
    comments,
    status: 'submitted'
  });

  if (course && course.instructor.toString() !== req.user._id.toString()) {
    await Notification.create({
      user: course.instructor,
      title: 'New project submission',
      message: `${req.user.name || 'A student'} submitted "${project.title}" for review`,
      type: 'message',
      relatedId: project._id as any,
      link: `/app/courses/${course._id.toString()}?tab=projects`,
    });
  }

  sendSuccess(res, submission, { statusCode: 201, message: 'Project submitted successfully' });
});

// @desc    Review and Grade a projected
// @route   PUT /api/projects/submissions/:submissionId/review
// @access  Private/Instructor
export const reviewProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { grade, feedback } = req.body;
  const submissionId = typeof req.params.submissionId === 'string' ? req.params.submissionId : '';

  if (!submissionId) {
    res.status(400);
    throw new Error('Submission ID is required');
  }

  const submission = await ProjectSubmission.findById(submissionId).populate('project');
  if (!submission) {
      res.status(404);
      throw new Error('Submission not found');
  }

  const project = submission.project as any;

  // Ideally verify instructor owns the course 
  const course = await Course.findById(submission.course);
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
      await User.findByIdAndUpdate(submission.student, {
          $inc: { xp: submission.xpEarned }
      });
  }

  await submission.save();

  await Notification.create({
    user: submission.student as any,
    title: 'Project graded',
    message: `Your submission for "${project.title}" has been graded${grade !== undefined ? ` (${grade}/${project.maxPoints || 100})` : ''}`,
    type: 'project_graded',
    relatedId: submission.project as any,
    link: `/app/courses/${submission.course.toString()}?tab=projects`,
  });

  sendSuccess(res, submission, { message: 'Project reviewed successfully' });
});
