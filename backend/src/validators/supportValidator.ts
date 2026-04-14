import { z } from 'zod';

export const submitTicketSchema = z.object({
  body: z.object({
    subject: z.string().trim().min(3).max(140),
    category: z.enum(['technical', 'billing', 'course_content', 'other']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    message: z.string().trim().min(1).max(2000),
  }),
});

export const listTicketsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().max(10000).optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const replyTicketSchema = z.object({
  params: z.object({
    id: z.string().trim().length(24).regex(/^[a-fA-F0-9]+$/),
  }),
  body: z.object({
    message: z.string().trim().min(1).max(2000),
  }),
});

export const changeTicketStatusSchema = z.object({
  params: z.object({
    id: z.string().trim().length(24).regex(/^[a-fA-F0-9]+$/),
  }),
  body: z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  }),
});
