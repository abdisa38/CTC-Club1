import mongoose, { Document } from 'mongoose';
export interface ITicket extends Document {
    user: mongoose.Schema.Types.ObjectId;
    subject: string;
    message: string;
    status: 'open' | 'closed';
    reply?: string;
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