import mongoose, { Document } from 'mongoose';
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
    assignedTo?: mongoose.Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Ticket: mongoose.Model<ITicket, {}, {}, {}, mongoose.Document<unknown, {}, ITicket, {}, mongoose.DefaultSchemaOptions> & ITicket & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITicket>;
export default Ticket;
//# sourceMappingURL=ticketModel.d.ts.map