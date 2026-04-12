import { z } from 'zod';

export const verifyPremiumPaymentSchema = z.object({
  params: z.object({
    txRef: z
      .string()
      .trim()
      .min(6, 'Transaction reference is required')
      .max(120, 'Transaction reference is too long')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid transaction reference format'),
  }),
});

export const initializeCoursePaymentSchema = z.object({
  params: z.object({
    courseId: z
      .string()
      .trim()
      .length(24, 'Invalid course id')
      .regex(/^[a-fA-F0-9]+$/, 'Invalid course id format'),
  }),
});

export const verifyCoursePaymentSchema = z.object({
  params: z.object({
    courseId: z
      .string()
      .trim()
      .length(24, 'Invalid course id')
      .regex(/^[a-fA-F0-9]+$/, 'Invalid course id format'),
    txRef: z
      .string()
      .trim()
      .min(6, 'Transaction reference is required')
      .max(120, 'Transaction reference is too long')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid transaction reference format'),
  }),
});
