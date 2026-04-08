import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  
  instructions: string; // Detailed MD instructions
  requirements: string[]; // Array of strings for checklist
  
  // Gamification & Settings
  xpReward: number;
  maxPoints: number;
  deadline?: Date;
  
  // Status
  isPublished: boolean;
  isDeleted: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: [true, 'Project title is required'], trim: true },
    description: { type: String, required: [true, 'Project description is required'], trim: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', index: true },
    
    instructions: { type: String, default: '' },
    requirements: [{ type: String }],
    
    xpReward: { type: Number, default: 50, min: 0 },
    maxPoints: { type: Number, default: 100, min: 1 },
    deadline: { type: Date },
    
    isPublished: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

projectSchema.pre(/^find/, function (this: any) {
  this.where({ isDeleted: { $ne: true } });

});

export const Project = mongoose.model<IProject>('Project', projectSchema);

// ============================================
// Submission Model
// ============================================

export interface IProjectSubmission extends Document {
  student: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  
  repoUrl?: string;
  liveUrl?: string;
  files?: string[];
  comments?: string;
  
  grade?: number;
  feedback?: string;
  status: 'pending' | 'submitted' | 'under_review' | 'graded';
  
  xpEarned: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const projectSubmissionSchema = new Schema<IProjectSubmission>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    
    repoUrl: { type: String },
    liveUrl: { type: String },
    files: [{ type: String }], // Array of URLs to files
    comments: { type: String }, // Student comments on submission
    
    grade: { type: Number, min: 0 },
    feedback: { type: String },
    
    status: { 
      type: String, 
      enum: ['pending', 'submitted', 'under_review', 'graded'], 
      default: 'submitted',
      index: true
    },
    
    xpEarned: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// One submission per project per student (can be updated, but not duplicated unless we add attempt counter)
projectSubmissionSchema.index({ student: 1, project: 1 }, { unique: true });

export const ProjectSubmission = mongoose.model<IProjectSubmission>('ProjectSubmission', projectSubmissionSchema);
