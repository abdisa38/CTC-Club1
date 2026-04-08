"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewProject = exports.submitProject = exports.createProject = void 0;
const projectModel_1 = require("../models/projectModel");
const createProject = async (req, res) => {
    try {
        const { title, description, courseId, deadline } = req.body;
        const project = await projectModel_1.Project.create({ title, description, course: courseId, deadline });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createProject = createProject;
const submitProject = async (req, res) => {
    try {
        const { repoUrl, files } = req.body;
        const projectId = req.params.id;
        const submission = await projectModel_1.ProjectSubmission.create({
            student: req.user._id,
            project: projectId,
            repoUrl,
            files
        });
        res.status(201).json(submission);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.submitProject = submitProject;
const reviewProject = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submissionId = req.params.submissionId;
        const submission = await projectModel_1.ProjectSubmission.findById(submissionId);
        if (!submission)
            return res.status(404).json({ message: 'Submission not found' });
        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'reviewed';
        await submission.save();
        res.json(submission);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.reviewProject = reviewProject;
//# sourceMappingURL=projectController.js.map