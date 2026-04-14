import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';
import Ticket from '../models/ticketModel';
import { sendSuccess } from '../utils/apiResponse';
import { getPagination } from '../utils/pagination';

// @desc    Create a support ticket
// @route   POST /api/support/tickets
// @access  Private
export const submitTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { subject, category, priority, message } = req.body;

    if (!String(subject || '').trim() || !String(message || '').trim()) {
        res.status(400);
        throw new Error('Subject and message are required');
    }

    const allowedCategories = ['technical', 'billing', 'course_content', 'other'];
    const allowedPriorities = ['low', 'medium', 'high', 'urgent'];

    const safeCategory = allowedCategories.includes(String(category)) ? String(category) : 'technical';
    const safePriority = allowedPriorities.includes(String(priority)) ? String(priority) : 'medium';

  const ticket = await Ticket.create({ 
      user: req.user._id, 
            subject: String(subject).trim(),
            category: safeCategory,
            priority: safePriority,
      messages: [{
          sender: req.user._id,
                    message: String(message).trim(),
          isAdminReply: false
      }]
  });

    sendSuccess(res, ticket, { statusCode: 201, message: 'Ticket submitted successfully' });
});

// @desc    Get list of tickets (user sees own, admin sees all)
// @route   GET /api/support/tickets
// @access  Private
export const getTickets = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = getPagination(req, { limit: 12, maxLimit: 100 });

  let filter: any = {};
  if (req.user.role === 'student' || req.user.role === 'instructor') {
      filter.user = req.user._id;
  }
  // Admin sees everything

  const count = await Ticket.countDocuments(filter);
  const tickets = await Ticket.find(filter)
      .populate('user', 'name email avatar')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    res.json({
        success: true,
        data: tickets,
        tickets,
        page,
        pages: Math.ceil(count / limit),
        total: count,
    });
});

// @desc    Get singular ticket by ID
// @route   GET /api/support/tickets/:id
// @access  Private
export const getTicketById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)
        .populate('user', 'name email avatar')
        .populate('assignedTo', 'name email')
        .populate('messages.sender', 'name avatar role');

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this ticket');
    }

    sendSuccess(res, ticket);
});


// @desc    Reply to a ticket
// @route   POST /api/support/tickets/:id/reply
// @access  Private
export const replyTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { message } = req.body;
    if (!String(message || '').trim()) {
            res.status(400);
            throw new Error('Reply message is required');
    }

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
  }

  // Ensure security
  if (ticket.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to reply to this ticket');
  }

  const isAdminReply = req.user.role === 'admin';

  ticket.messages.push({
      sender: req.user._id,
      message: String(message).trim(),
      isAdminReply,
      createdAt: new Date()
  });

  // Re-open ticket if user replies to a closed one
  if (!isAdminReply && (ticket.status === 'resolved' || ticket.status === 'closed')) {
      ticket.status = 'in_progress';
  } else if (isAdminReply && ticket.status === 'open') {
      ticket.status = 'in_progress';
  }

  await ticket.save();

    sendSuccess(res, ticket, { message: 'Reply sent successfully' });
});


// @desc    Change ticket status (Close, Resolve)
// @route   PUT /api/support/tickets/:id/status
// @access  Private/Admin
export const changeTicketStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const allowedStatuses = ['open', 'in_progress', 'resolved', 'closed'];

    if (!allowedStatuses.includes(String(status))) {
        res.status(400);
        throw new Error('Invalid ticket status');
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    ticket.status = String(status) as any;
    await ticket.save();

    sendSuccess(res, ticket, { message: 'Ticket status updated' });
});
