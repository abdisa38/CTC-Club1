import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  course: mongoose.Schema.Types.ObjectId;
  deadline?: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    deadline: { type: Date },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);

export interface IProjectSubmission extends Document {
  student: mongoose.Schema.Types.ObjectId;
  project: mongoose.Schema.Types.ObjectId;
  repoUrl: string;
  files?: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'reviewed';
}

const projectSubmissionSchema = new Schema<IProjectSubmission>(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    repoUrl: { type: String, required: true },
    files: { type: String },
    grade: { type: Number },
    feedback: { type: String },
    status: { type: String, enum: ['submitted', 'reviewed'], default: 'submitted' },
  },
  { timestamps: true }
);

export const ProjectSubmission = mongoose.model<IProjectSubmission>('ProjectSubmission', projectSubmissionSchema);
