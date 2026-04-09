import mongoose, { Document } from 'mongoose';
export interface IBadge extends Document {
    name: string;
    description: string;
    thumbnailUrl: string;
    condition: string;
    xpReward: number;
}
export declare const Badge: mongoose.Model<IBadge, {}, {}, {}, mongoose.Document<unknown, {}, IBadge, {}, mongoose.DefaultSchemaOptions> & IBadge & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBadge>;
//# sourceMappingURL=badgeModel.d.ts.map