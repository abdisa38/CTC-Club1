import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  thumbnailUrl: string;
  condition: string; // Internal logic string (e.g. "COMPLETE_5_COURSES")
  xpReward: number;
}

const badgeSchema = new Schema<IBadge>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    condition: { type: String, required: true, unique: true },
    xpReward: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Badge = mongoose.model<IBadge>('Badge', badgeSchema);
