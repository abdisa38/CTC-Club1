import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { submitTicket, getTickets, getTicketById, replyTicket, changeTicketStatus } from '../controllers/supportController';

const router = express.Router();

router.post('/', protect as any, submitTicket as any);

// Users can get their own tickets, admins get all
router.get('/', protect as any, getTickets as any);    
router.get('/:id', protect as any, getTicketById as any);

// Users can reply too now, auth checks ownership in the controller
router.post('/:id/reply', protect as any, replyTicket as any); 
router.put('/:id/status', protect as any, authorizeRoles('admin'), changeTicketStatus as any);
