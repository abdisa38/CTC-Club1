"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommunityPost = exports.pinCommunityPost = exports.addCommunityReply = exports.getCommunityReplies = exports.voteCommunityPost = exports.createCommunityPost = exports.getCommunityPosts = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const communityModel_1 = require("../models/communityModel");
const courseModel_1 = __importDefault(require("../models/courseModel"));
const apiResponse_1 = require("../utils/apiResponse");
const canManagePost = async (post, user) => {
    if (user.role === 'admin') {
        return true;
    }
    if (post.user?.toString() === user._id.toString()) {
        return true;
    }
    if (user.role === 'instructor' && post.course) {
        const course = await courseModel_1.default.findById(post.course).select('instructor');
        if (course && course.instructor.toString() === user._id.toString()) {
            return true;
        }
    }
    return false;
};
// @desc    Get community posts
// @route   GET /api/community/posts
// @access  Private
exports.getCommunityPosts = (0, express_async_handler_1.default)(async (req, res) => {
    const pageSize = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword;
    const category = req.query.category;
    const course = req.query.course;
    const managed = req.query.managed === 'true';
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
    if (managed && req.user.role === 'instructor') {
        const instructorCourses = await courseModel_1.default.find({ instructor: req.user._id, isDeleted: false }).select('_id');
        const courseIds = instructorCourses.map((item) => item._id);
        if (course) {
            const allowed = courseIds.some((id) => id.toString() === course.toString());
            if (!allowed) {
                filter.course = null;
            }
        }
        else {
            filter.course = { $in: courseIds };
        }
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
        .populate('course', 'title')
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
// @desc    Pin/unpin a community post
// @route   PATCH /api/community/posts/:postId/pin
// @access  Private
exports.pinCommunityPost = (0, express_async_handler_1.default)(async (req, res) => {
    const postId = typeof req.params.postId === 'string' ? req.params.postId : '';
    const isPinned = typeof req.body?.isPinned === 'boolean' ? req.body.isPinned : undefined;
    if (!postId) {
        res.status(400);
        throw new Error('Post ID is required');
    }
    const post = await communityModel_1.CommunityPost.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    const allowed = await canManagePost(post, req.user);
    if (!allowed) {
        res.status(403);
        throw new Error('Not authorized to pin this post');
    }
    post.isPinned = typeof isPinned === 'boolean' ? isPinned : !post.isPinned;
    await post.save();
    const populated = await communityModel_1.CommunityPost.findById(post._id)
        .populate('user', 'name avatar role')
        .populate('course', 'title');
    (0, apiResponse_1.sendSuccess)(res, populated || post, { message: 'Post pin state updated' });
});
// @desc    Soft delete a community post
// @route   DELETE /api/community/posts/:postId
// @access  Private
exports.deleteCommunityPost = (0, express_async_handler_1.default)(async (req, res) => {
    const postId = typeof req.params.postId === 'string' ? req.params.postId : '';
    if (!postId) {
        res.status(400);
        throw new Error('Post ID is required');
    }
    const post = await communityModel_1.CommunityPost.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    const allowed = await canManagePost(post, req.user);
    if (!allowed) {
        res.status(403);
        throw new Error('Not authorized to delete this post');
    }
    post.isDeleted = true;
    await post.save();
    (0, apiResponse_1.sendSuccess)(res, null, { message: 'Post deleted successfully' });
});
//# sourceMappingURL=communityController.js.map