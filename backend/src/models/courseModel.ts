import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  instructor: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  
  // Media & Categorization
  coverImage?: string;
  category: string;
  tags: string[];
  
  // Pricing & Status
  price: number;
  currency: string;
  isPublished: boolean;
  status: 'draft' | 'published' | 'archived';
  
  // Gamification & Requirements
  level: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  prerequisites: string[];
  
  // Analytics & Reviews
  totalDuration?: number; // in minutes
  rating: number;
  numReviews: number;
  
  // Soft Delete
  isDeleted: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [100, 'Course title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      required: [true, 'Course slug is required'],
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    coverImage: {
      type: String,
      default: 'no-photo.jpg'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Development', 'Design', 'Marketing', 'Business', 'Other'], // Update enums here
      index: true,
    },
    tags: [
      {
        type: String,
      }
    ],
    price: {
      type: Number,
      required: [true, 'Price is required'],
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    xpReward: {
      type: Number,
      default: 0,
      min: 0,
    },
    prerequisites: [
      {
        type: String,
      }
    ],
    totalDuration: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 1, // Start with something low if required, usually unrated or null is better, let's leave as 1 because of DB design currently
    },
    numReviews: {
      type: Number,
      default: 0,
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

// Compound Indexing for optimal queries
courseSchema.index({ status: 1, isDeleted: 1 });
courseSchema.index({ category: 1, level: 1 }); 
// Create a text index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Query Middleware to filter deleted
courseSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Middleware to automatically generate slug from title before saving
courseSchema.pre('validate', function(next) {
  if (this.isModified('title') && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '') // remove special chars
      .replace(/\s+/g, '-');
  }
  next();
});

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
