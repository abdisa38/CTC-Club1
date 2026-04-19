import { z } from 'zod';

const objectIdSchema = z
  .string()
  .trim()
  .length(24, 'Invalid id')
  .regex(/^[a-fA-F0-9]+$/, 'Invalid id format');

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required and must be at least 3 characters'),
    description: z.string().min(10, 'Description is required and must be at least 10 characters'),
    category: z.string().min(2, 'Category is required'),
    coverImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    price: z.number().min(0, 'Price must be a positive number').optional().default(0),
  }),
});

export const updateCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    category: z.string().min(2).optional(),
    coverImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    price: z.number().min(0).optional(),
  }),
});

export const updateCourseAccessModeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    mode: z.enum(['open', 'paid', 'locked']),
    paidPrice: z.number().positive('Paid price must be greater than 0').optional(),
  }),
});

export const updateCourseStudentAccessSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    studentId: objectIdSchema,
    action: z.enum(['lock', 'unlock', 'reset']),
  }),
});
