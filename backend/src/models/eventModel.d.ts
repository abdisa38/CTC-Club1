import mongoose, { Document } from 'mongoose';
export interface IEvent extends Document {
    title: string;
    description: string;
    location?: string;
    startsAt: Date;
    endsAt?: Date;
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Event: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, mongoose.DefaultSchemaOptions> & IEvent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEvent>;
export default Event;
//# sourceMappingURL=eventModel.d.ts.map