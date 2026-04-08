import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityPost extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string; // MD Supported
  course?: mongoose.Types.ObjectId; // Optional - tied strictly to a course
  category: 'general' | 'qna' | 'showcase' | 'announcement';
  
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  views: number;
  
  tags: string[];
  isLocked: boolean; // Admin can lock thread
  isPinned: boolean;
  isDeleted: boolean; // Soft delete

  repliesCount: number; // Cache for quick display
  
  createdAt: Date;
  updatedAt: Date;
}

const communityPostSchema = new Schema<ICommunityPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Post title is required'], trim: true },
    content: { type: String, required: [true, 'Post content is required'] },
    course: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    category: { 
      type: String, 
      enum: ['general', 'qna', 'showcase', 'announcement'], 
      default: 'general',
      index: true
    },
    
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    
    tags: [{ type: String }],
    
    isLocked: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
    
    repliesCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

communityPostSchema.index({ category: 1, isDeleted: 1 });
communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

communityPostSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);

// ===================================
// Community Reply Schema
// ===================================

export interface ICommunityReply extends Document {
  post: mongoose.Types.ObjectId; // The parent post
  user: mongoose.Types.ObjectId;
  content: string; // MD Supported
  isAcceptedAnswer: boolean; // Original author or admin can mark
  upvotes: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const communityReplySchema = new Schema<ICommunityReply>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: [true, 'Reply content is required'] },
    isAcceptedAnswer: { type: Boolean, default: false, index: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

communityReplySchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

export const CommunityReply = mongoose.model<ICommunityReply>('CommunityReply', communityReplySchema);