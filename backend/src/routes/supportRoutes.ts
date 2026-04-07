import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { submitTicket, getTickets, replyTicket } from '../controllers/supportController';

const router = express.Router();

router.post('/', protect as any, submitTicket as any);
router.get('/', protect as any, authorizeRoles('admin'), getTickets as any);
router.put('/:id/reply', protect as any, authorizeRoles('admin'), replyTicket as any);

export default router;
