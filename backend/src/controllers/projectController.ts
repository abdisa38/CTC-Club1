import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project, ProjectSubmission } from '../models/projectModel';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, courseId, deadline } = req.body;
    const project = await Project.create({ title, description, course: courseId, deadline });
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitProject = async (req: AuthRequest, res: Response) => {
  try {
    const { repoUrl, files } = req.body;
    const projectId = req.params.id;

    const submission = await ProjectSubmission.create({
      student: req.user._id,
      project: projectId,
      repoUrl,
      files
    });

    res.status(201).json(submission);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewProject = async (req: AuthRequest, res: Response) => {
  try {
    const { grade, feedback } = req.body;
    const submissionId = req.params.submissionId;

    const submission = await ProjectSubmission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'reviewed';

    await submission.save();
    res.json(submission);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
