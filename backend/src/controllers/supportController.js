"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeTicketStatus = exports.replyTicket = exports.getTicketById = exports.getTickets = exports.submitTicket = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ticketModel_1 = __importDefault(require("../models/ticketModel"));
const apiResponse_1 = require("../utils/apiResponse");
// @desc    Create a support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.submitTicket = (0, express_async_handler_1.default)(async (req, res) => {
    const { subject, category, priority, message } = req.body;
    const ticket = await ticketModel_1.default.create({
        user: req.user._id,
        subject,
        category,
        priority,
        messages: [{
                sender: req.user._id,
                message,
                isAdminReply: false
            }]
    });
    (0, apiResponse_1.sendSuccess)(res, ticket, { statusCode: 201, message: 'Ticket submitted successfully' });
});
// @desc    Get list of tickets (user sees own, admin sees all)
// @route   GET /api/support/tickets
// @access  Private
exports.getTickets = (0, express_async_handler_1.default)(async (req, res) => {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    let filter = {};
    if (req.user.role === 'student' || req.user.role === 'instructor') {
        filter.user = req.user._id;
    }
    // Admin sees everything
    const count = await ticketModel_1.default.countDocuments(filter);
    const tickets = await ticketModel_1.default.find(filter)
        .populate('user', 'name email avatar')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    res.json({
        success: true,
        data: tickets,
        tickets,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});
// @desc    Get singular ticket by ID
// @route   GET /api/support/tickets/:id
// @access  Private
exports.getTicketById = (0, express_async_handler_1.default)(async (req, res) => {
    const ticket = await ticketModel_1.default.findById(req.params.id)
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
    (0, apiResponse_1.sendSuccess)(res, ticket);
});
// @desc    Reply to a ticket
// @route   POST /api/support/tickets/:id/reply
// @access  Private
exports.replyTicket = (0, express_async_handler_1.default)(async (req, res) => {
    const { message } = req.body;
    const ticket = await ticketModel_1.default.findById(req.params.id);
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
        message,
        isAdminReply,
        createdAt: new Date()
    });
    // Re-open ticket if user replies to a closed one
    if (!isAdminReply && (ticket.status === 'resolved' || ticket.status === 'closed')) {
        ticket.status = 'in_progress';
    }
    else if (isAdminReply && ticket.status === 'open') {
        ticket.status = 'in_progress';
    }
    await ticket.save();
    (0, apiResponse_1.sendSuccess)(res, ticket, { message: 'Reply sent successfully' });
});
// @desc    Change ticket status (Close, Resolve)
// @route   PUT /api/support/tickets/:id/status
// @access  Private/Admin
exports.changeTicketStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { status } = req.body;
    const ticket = await ticketModel_1.default.findById(req.params.id);
    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }
    ticket.status = status;
    await ticket.save();
    (0, apiResponse_1.sendSuccess)(res, ticket, { message: 'Ticket status updated' });
});
//# sourceMappingURL=supportController.js.map