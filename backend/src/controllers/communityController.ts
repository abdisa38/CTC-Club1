import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import { CommunityPost, CommunityReply } from '../models/communityModel';
import { sendSuccess } from '../utils/apiResponse';

// @desc    Get community posts
// @route   GET /api/community/posts
// @access  Private
export const getCommunityPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword as string | undefined;
  const category = req.query.category as string | undefined;
  const course = req.query.course as string | undefined;

  const filter: any = { isDeleted: false };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (course) {
    if (!mongoose.Types.ObjectId.isValid(course)) {
      res.status(400);
      throw new Error('Invalid course ID');
    }

    filter.course = course;
  }

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { content: { $regex: keyword, $options: 'i' } },
      { tags: { $elemMatch: { $regex: keyword, $options: 'i' } } },
    ];
  }

  const total = await CommunityPost.countDocuments(filter);
  const posts = await CommunityPost.find(filter)
    .populate('user', 'name avatar role')
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: posts,
    posts,
    page,
    pages: Math.ceil(total / pageSize),
    total,
  });
});

// @desc    Create community post
// @route   POST /api/community/posts
// @access  Private
export const createCommunityPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, category, tags, course } = req.body;
  const userId = req.user._id as any;

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  const postPayload: any = {
    user: userId,
    title,
    content,
    category: category || 'general',
    tags: Array.isArray(tags) ? tags : [],
  };

  if (course) {
    if (!mongoose.Types.ObjectId.isValid(course)) {
      res.status(400);
      throw new Error('Invalid course ID');
    }

    postPayload.course = course;
  }

  const post = await CommunityPost.create(postPayload);

  const populated = await CommunityPost.findById(post._id).populate('user', 'name avatar role');
  sendSuccess(res, populated || post, { statusCode: 201, message: 'Post created successfully' });
});

// @desc    Upvote/downvote a post
// @route   POST /api/community/posts/:postId/vote
// @access  Private
export const voteCommunityPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { vote } = req.body as { vote?: 'up' | 'down' };
  const postId = typeof req.params.postId === 'string' ? req.params.postId : '';
  const userId = req.user._id.toString();

  if (!postId) {
    res.status(400);
    throw new Error('Post ID is required');
  }

  if (!vote || (vote !== 'up' && vote !== 'down')) {
    res.status(400);
    throw new Error('Vote must be either up or down');
  }

  const post = await CommunityPost.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const hasUpvote = post.upvotes.some((id) => id.toString() === userId);
  const hasDownvote = post.downvotes.some((id) => id.toString() === userId);

  if (vote === 'up') {
    if (!hasUpvote) {
      post.upvotes.push(req.user._id as any);
    }
    if (hasDownvote) {
      post.downvotes = post.downvotes.filter((id) => id.toString() !== userId) as any;
    }
  } else {
    if (!hasDownvote) {
      post.downvotes.push(req.user._id as any);
    }
    if (hasUpvote) {
      post.upvotes = post.upvotes.filter((id) => id.toString() !== userId) as any;
    }
  }

  await post.save();

  sendSuccess(res, {
    upvotes: post.upvotes.length,
    downvotes: post.downvotes.length,
  }, { message: 'Vote recorded' });
});

// @desc    Get replies for a post
// @route   GET /api/community/posts/:postId/replies
// @access  Private
export const getCommunityReplies = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = typeof req.params.postId === 'string' ? req.params.postId : '';
  if (!postId) {
    res.status(400);
    throw new Error('Post ID is required');
  }

  const replies = await CommunityReply.find({ post: postId, isDeleted: false })
    .populate('user', 'name avatar role')
    .sort({ createdAt: 1 });

  sendSuccess(res, replies);
});

// @desc    Add reply to a post
// @route   POST /api/community/posts/:postId/replies
// @access  Private
export const addCommunityReply = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { content } = req.body as { content?: string };
  const postId = typeof req.params.postId === 'string' ? req.params.postId : '';

  if (!postId) {
    res.status(400);
    throw new Error('Post ID is required');
  }

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Reply content is required');
  }

  const post = await CommunityPost.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const reply = await CommunityReply.create({
    post: postId,
    user: req.user._id as any,
    content,
  });

  post.repliesCount = (post.repliesCount || 0) + 1;
  await post.save();

  const populated = await CommunityReply.findById(reply._id).populate('user', 'name avatar role');
  sendSuccess(res, populated || reply, { statusCode: 201, message: 'Reply posted successfully' });
});
