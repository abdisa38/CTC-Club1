import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  message: string;
  isAdminReply: boolean;
  createdAt: Date;
}

export interface ITicket extends Document {
  user: mongoose.Types.ObjectId;
  subject: string;
  category: 'technical' | 'billing' | 'course_content' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  messages: IMessage[];
  assignedTo?: mongoose.Types.ObjectId; // Support agent/Admin ID
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: [true, 'Subject is required'], trim: true },
    category: { 
      type: String, 
      enum: ['technical', 'billing', 'course_content', 'other'],
      default: 'technical' 
    },
    status: { 
      type: String, 
      enum: ['open', 'in_progress', 'resolved', 'closed'], 
      default: 'open',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        isAdminReply: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

ticketSchema.pre(/^find/, function (this: any) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
export default Ticket;
