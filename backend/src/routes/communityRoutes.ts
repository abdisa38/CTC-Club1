import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import {
  getCommunityPosts,
  createCommunityPost,
  voteCommunityPost,
  getCommunityReplies,
  addCommunityReply,
  pinCommunityPost,
  deleteCommunityPost,
} from '../controllers/communityController';
import {
  addCommunityReplySchema,
  communityPostIdParamSchema,
  createCommunityPostSchema,
  getCommunityPostsSchema,
  pinCommunityPostSchema,
  voteCommunityPostSchema,
} from '../validators/communityValidator';

const router = express.Router();

router.get('/posts', protect as any, validateRequest(getCommunityPostsSchema), getCommunityPosts as any);
router.post('/posts', protect as any, validateRequest(createCommunityPostSchema), createCommunityPost as any);
router.post('/posts/:postId/vote', protect as any, validateRequest(voteCommunityPostSchema), voteCommunityPost as any);
router.get('/posts/:postId/replies', protect as any, validateRequest(communityPostIdParamSchema), getCommunityReplies as any);
router.post('/posts/:postId/replies', protect as any, validateRequest(addCommunityReplySchema), addCommunityReply as any);
router.patch('/posts/:postId/pin', protect as any, validateRequest(pinCommunityPostSchema), pinCommunityPost as any);
router.delete('/posts/:postId', protect as any, validateRequest(communityPostIdParamSchema), deleteCommunityPost as any);

export default router;
