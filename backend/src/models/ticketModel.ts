import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  user: mongoose.Schema.Types.ObjectId;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  reply?: string;
}

const ticketSchema = new Schema<ITicket>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    reply: { type: String },
  },
  { timestamps: true }
);

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
export default Ticket;
