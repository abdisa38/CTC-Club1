"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommunityReply = exports.getCommunityReplies = exports.voteCommunityPost = exports.createCommunityPost = exports.getCommunityPosts = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const communityModel_1 = require("../models/communityModel");
const apiResponse_1 = require("../utils/apiResponse");
// @desc    Get community posts
// @route   GET /api/community/posts
// @access  Private
exports.getCommunityPosts = (0, express_async_handler_1.default)(async (req, res) => {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword;
    const category = req.query.category;
    const course = req.query.course;
    const filter = { isDeleted: false };
    if (category && category !== 'all') {
        filter.category = category;
    }
    if (course) {
        if (!mongoose_1.default.Types.ObjectId.isValid(course)) {
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
    const total = await communityModel_1.CommunityPost.countDocuments(filter);
    const posts = await communityModel_1.CommunityPost.find(filter)
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
exports.createCommunityPost = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, content, category, tags, course } = req.body;
    const userId = req.user._id;
    if (!title || !content) {
        res.status(400);
        throw new Error('Title and content are required');
    }
    const postPayload = {
        user: userId,
        title,
        content,
        category: category || 'general',
        tags: Array.isArray(tags) ? tags : [],
    };
    if (course) {
        if (!mongoose_1.default.Types.ObjectId.isValid(course)) {
            res.status(400);
            throw new Error('Invalid course ID');
        }
        postPayload.course = course;
    }
    const post = await communityModel_1.CommunityPost.create(postPayload);
    const populated = await communityModel_1.CommunityPost.findById(post._id).populate('user', 'name avatar role');
    (0, apiResponse_1.sendSuccess)(res, populated || post, { statusCode: 201, message: 'Post created successfully' });
});
// @desc    Upvote/downvote a post
// @route   POST /api/community/posts/:postId/vote
// @access  Private
exports.voteCommunityPost = (0, express_async_handler_1.default)(async (req, res) => {
    const { vote } = req.body;
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
    const post = await communityModel_1.CommunityPost.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    const hasUpvote = post.upvotes.some((id) => id.toString() === userId);
    const hasDownvote = post.downvotes.some((id) => id.toString() === userId);
    if (vote === 'up') {
        if (!hasUpvote) {
            post.upvotes.push(req.user._id);
        }
        if (hasDownvote) {
            post.downvotes = post.downvotes.filter((id) => id.toString() !== userId);
        }
    }
    else {
        if (!hasDownvote) {
            post.downvotes.push(req.user._id);
        }
        if (hasUpvote) {
            post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
        }
    }
    await post.save();
    (0, apiResponse_1.sendSuccess)(res, {
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
    }, { message: 'Vote recorded' });
});
// @desc    Get replies for a post
// @route   GET /api/community/posts/:postId/replies
// @access  Private
exports.getCommunityReplies = (0, express_async_handler_1.default)(async (req, res) => {
    const postId = typeof req.params.postId === 'string' ? req.params.postId : '';
    if (!postId) {
        res.status(400);
        throw new Error('Post ID is required');
    }
    const replies = await communityModel_1.CommunityReply.find({ post: postId, isDeleted: false })
        .populate('user', 'name avatar role')
        .sort({ createdAt: 1 });
    (0, apiResponse_1.sendSuccess)(res, replies);
});
// @desc    Add reply to a post
// @route   POST /api/community/posts/:postId/replies
// @access  Private
exports.addCommunityReply = (0, express_async_handler_1.default)(async (req, res) => {
    const { content } = req.body;
    const postId = typeof req.params.postId === 'string' ? req.params.postId : '';
    if (!postId) {
        res.status(400);
        throw new Error('Post ID is required');
    }
    if (!content || !content.trim()) {
        res.status(400);
        throw new Error('Reply content is required');
    }
    const post = await communityModel_1.CommunityPost.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    const reply = await communityModel_1.CommunityReply.create({
        post: postId,
        user: req.user._id,
        content,
    });
    post.repliesCount = (post.repliesCount || 0) + 1;
    await post.save();
    const populated = await communityModel_1.CommunityReply.findById(reply._id).populate('user', 'name avatar role');
    (0, apiResponse_1.sendSuccess)(res, populated || reply, { statusCode: 201, message: 'Reply posted successfully' });
});
//# sourceMappingURL=communityController.js.map