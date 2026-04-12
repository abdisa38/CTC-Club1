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
