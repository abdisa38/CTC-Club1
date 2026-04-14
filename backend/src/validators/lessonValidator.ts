import { z } from 'zod';

export const courseIdParamSchema = z.object({
  params: z.object({
    courseId: z.string().trim().length(24).regex(/^[a-fA-F0-9]+$/),
  }),
});

const attachmentSchema = z.object({
  title: z.string().trim().max(120).optional(),
  url: z.string().trim().url(),
  fileType: z.string().trim().max(120).optional(),
});

export const createLessonSchema = z.object({
  params: courseIdParamSchema.shape.params,
  body: z.object({
    title: z.string().trim().min(2).max(160),
    content: z.string().trim().min(1).max(50000).optional(),
    videoUrl: z.string().trim().url().optional(),
    order: z.coerce.number().int().min(0).max(10000).optional(),
    duration: z.coerce.number().min(0).max(100000).optional(),
    isPublished: z.boolean().optional(),
    attachments: z.array(attachmentSchema).max(100).optional(),
  }),
});

export const updateLessonSchema = z.object({
  params: z.object({
    lessonId: z.string().trim().length(24).regex(/^[a-fA-F0-9]+$/),
  }),
  body: z.object({
    title: z.string().trim().min(2).max(160).optional(),
    content: z.string().trim().min(1).max(50000).optional(),
    videoUrl: z.string().trim().url().optional(),
    order: z.coerce.number().int().min(0).max(10000).optional(),
    duration: z.coerce.number().min(0).max(100000).optional(),
    isPublished: z.boolean().optional(),
    attachments: z.array(attachmentSchema).max(100).optional(),
  }),
});
