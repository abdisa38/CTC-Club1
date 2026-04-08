import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getCommunityPosts,
  createCommunityPost,
  voteCommunityPost,
  getCommunityReplies,
  addCommunityReply,
} from '../controllers/communityController';

const router = express.Router();

router.get('/posts', protect as any, getCommunityPosts as any);
router.post('/posts', protect as any, createCommunityPost as any);
router.post('/posts/:postId/vote', protect as any, voteCommunityPost as any);
router.get('/posts/:postId/replies', protect as any, getCommunityReplies as any);
router.post('/posts/:postId/replies', protect as any, addCommunityReply as any);

export default router;
