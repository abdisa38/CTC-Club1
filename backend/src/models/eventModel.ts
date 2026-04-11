import mongoose, { Document, Schema } from 'mongoose';

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

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Event title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    startsAt: {
      type: Date,
      required: [true, 'Event start date/time is required'],
      index: true,
    },
    endsAt: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ title: 'text', description: 'text', location: 'text' });
eventSchema.index({ startsAt: 1, isPublished: 1, isDeleted: 1 });

eventSchema.pre(/^find/, function (this: any) {
  this.where({ isDeleted: { $ne: true } });
});

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;