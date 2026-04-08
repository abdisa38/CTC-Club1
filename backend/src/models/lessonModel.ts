import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  course: mongoose.Types.ObjectId;
  chapter?: mongoose.Types.ObjectId; // For grouped lessons
  content: string;
  videoUrl?: string;
  duration?: number; // In minutes
  order: number;
  
  // Attachments/Resources
  attachments: {
    title: string;
    url: string;
    fileType: string;
  }[];
  
  // Gamification & Status
  isPublished: boolean;
  isFreePreview: boolean; // Enables preview without enrollment
  xpReward: number;
  
  // Soft Delete
  isDeleted: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [100, 'Lesson title cannot exceed 100 characters'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true, 
    },
    chapter: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter', // Can create a Chapter model later if needed, or simply string grouping
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Lesson content is required'],
    },
    videoUrl: {
      type: String, // Supports YouTube, Vimeo, AWS S3
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
      index: true, // Optimizes ordered find
    },
    attachments: [
      {
        title: String,
        url: String,
        fileType: String,
      }
    ],
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
    xpReward: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

// Compound Indexing for optimal queries inside course
lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ course: 1, isPublished: 1, isDeleted: 1 });

// Automatically update Course total duration on save? Handled via service/controller
// Query Middleware to automatically filter out soft-deleted lessons
lessonSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);

export default Lesson;
