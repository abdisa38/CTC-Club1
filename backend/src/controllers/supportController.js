"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyTicket = exports.getTickets = exports.submitTicket = void 0;
const ticketModel_1 = __importDefault(require("../models/ticketModel"));
const submitTicket = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const ticket = await ticketModel_1.default.create({ user: req.user._id, subject, message });
        res.status(201).json(ticket);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.submitTicket = submitTicket;
const getTickets = async (req, res) => {
    try {
        const tickets = await ticketModel_1.default.find({}).populate('user', 'name email');
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTickets = getTickets;
const replyTicket = async (req, res) => {
    try {
        const { reply } = req.body;
        const ticket = await ticketModel_1.default.findById(req.params.id);
        if (!ticket)
            return res.status(404).json({ message: 'Ticket not found' });
        ticket.reply = reply;
        ticket.status = 'closed';
        await ticket.save();
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.replyTicket = replyTicket;
//# sourceMappingURL=supportController.js.map