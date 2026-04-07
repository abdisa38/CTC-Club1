import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Ticket from '../models/ticketModel';

export const submitTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message } = req.body;
    const ticket = await Ticket.create({ user: req.user._id, subject, message });
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await Ticket.find({}).populate('user', 'name email');
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const replyTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { reply } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.reply = reply;
    ticket.status = 'closed';
    await ticket.save();

    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
