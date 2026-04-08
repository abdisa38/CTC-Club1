import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project, ProjectSubmission } from '../models/projectModel';
import User from '../models/userModel';
import Course from '../models/courseModel';

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
  
  res.status(201).json(project);
});

// @desc    Submit a project
// @route   POST /api/projects/:id/submit
// @access  Private/Student
export const submitProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { repoUrl, liveUrl, files, comments } = req.body;
  const projectId = req.params.id;

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

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
    return res.status(200).json(existingSubmission);
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

  res.status(201).json(submission);
});

// @desc    Review and Grade a projected
// @route   PUT /api/projects/submissions/:submissionId/review
// @access  Private/Instructor
export const reviewProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { grade, feedback } = req.body;
  const submissionId = req.params.submissionId;

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
  res.json(submission);
});
