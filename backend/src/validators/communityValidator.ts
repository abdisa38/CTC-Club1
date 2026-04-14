import { z } from 'zod';

export const communityPostIdParamSchema = z.object({
  params: z.object({
    postId: z.string().trim().length(24).regex(/^[a-fA-F0-9]+$/),
  }),
});

export const getCommunityPostsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().max(10000).optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    keyword: z.string().trim().max(120).optional(),
    category: z.enum(['general', 'qna', 'showcase', 'announcement', 'all']).optional(),
    course: z.string().trim().length(24).regex(/^[a-fA-F0-9]+$/).optional(),
    managed: z.enum(['true', 'false']).optional(),
  }),
});

export const createCommunityPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(160),
    content: z.string().trim().min(1).max(10000),
    category: z.enum(['general', 'qna', 'showcase', 'announcement']).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    course: z.string().trim().length(24).regex(/^[a-fA-F0-9]+$/).optional(),
  }),
});

export const voteCommunityPostSchema = z.object({
  params: communityPostIdParamSchema.shape.params,
  body: z.object({
    vote: z.enum(['up', 'down']),
  }),
});

export const addCommunityReplySchema = z.object({
  params: communityPostIdParamSchema.shape.params,
  body: z.object({
    content: z.string().trim().min(1).max(4000),
  }),
});

export const pinCommunityPostSchema = z.object({
  params: communityPostIdParamSchema.shape.params,
  body: z.object({
    isPinned: z.boolean().optional(),
  }),
});
