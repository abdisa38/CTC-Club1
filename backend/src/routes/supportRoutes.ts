import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { submitTicket, getTickets, getTicketById, replyTicket, changeTicketStatus } from '../controllers/supportController';
import {
	changeTicketStatusSchema,
	listTicketsQuerySchema,
	replyTicketSchema,
	submitTicketSchema,
	ticketIdParamSchema,
} from '../validators/supportValidator';

const router = express.Router();

router.post('/tickets', protect as any, validateRequest(submitTicketSchema), submitTicket as any);

// Users can get their own tickets, admins get all
router.get('/tickets', protect as any, validateRequest(listTicketsQuerySchema), getTickets as any);
router.get('/tickets/:id', protect as any, validateRequest(ticketIdParamSchema), getTicketById as any);

// Users can reply too now, auth checks ownership in the controller
router.post('/tickets/:id/reply', protect as any, validateRequest(replyTicketSchema), replyTicket as any);
router.put('/tickets/:id/status', protect as any, authorizeRoles('admin'), validateRequest(changeTicketStatusSchema), changeTicketStatus as any);

// Legacy aliases kept for backward compatibility.
router.post('/', protect as any, validateRequest(submitTicketSchema), submitTicket as any);
router.get('/', protect as any, validateRequest(listTicketsQuerySchema), getTickets as any);
router.get('/:id', protect as any, validateRequest(ticketIdParamSchema), getTicketById as any);
router.post('/:id/reply', protect as any, validateRequest(replyTicketSchema), replyTicket as any);
router.put('/:id/status', protect as any, authorizeRoles('admin'), validateRequest(changeTicketStatusSchema), changeTicketStatus as any);
export default router;