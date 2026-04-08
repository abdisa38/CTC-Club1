import { Response } from 'express';
import asyncHandler from 'express-async-handler';
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

  const filter: any = { isDeleted: false };

  if (category && category !== 'all') {
    filter.category = category;
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
  const { title, content, category, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  const post = await CommunityPost.create({
    user: req.user._id,
    title,
    content,
    category: category || 'general',
    tags: Array.isArray(tags) ? tags : [],
  });

  const populated = await post.populate('user', 'name avatar role');
  sendSuccess(res, populated, { statusCode: 201, message: 'Post created successfully' });
});

// @desc    Upvote/downvote a post
// @route   POST /api/community/posts/:postId/vote
// @access  Private
export const voteCommunityPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { vote } = req.body as { vote?: 'up' | 'down' };

  if (!vote || (vote !== 'up' && vote !== 'down')) {
    res.status(400);
    throw new Error('Vote must be either up or down');
  }

  const post = await CommunityPost.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (vote === 'up') {
    post.upvotes = Array.from(new Set([...post.upvotes.map((id) => id.toString()), req.user._id.toString()])) as any;
    post.downvotes = post.downvotes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    post.downvotes = Array.from(new Set([...post.downvotes.map((id) => id.toString()), req.user._id.toString()])) as any;
    post.upvotes = post.upvotes.filter((id) => id.toString() !== req.user._id.toString());
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
  const replies = await CommunityReply.find({ post: req.params.postId, isDeleted: false })
    .populate('user', 'name avatar role')
    .sort({ createdAt: 1 });

  sendSuccess(res, replies);
});

// @desc    Add reply to a post
// @route   POST /api/community/posts/:postId/replies
// @access  Private
export const addCommunityReply = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { content } = req.body as { content?: string };

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Reply content is required');
  }

  const post = await CommunityPost.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const reply = await CommunityReply.create({
    post: req.params.postId,
    user: req.user._id,
    content,
  });

  post.repliesCount = (post.repliesCount || 0) + 1;
  await post.save();

  const populated = await reply.populate('user', 'name avatar role');
  sendSuccess(res, populated, { statusCode: 201, message: 'Reply posted successfully' });
});
