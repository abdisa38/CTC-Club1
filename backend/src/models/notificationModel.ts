import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'system' | 'course_update' | 'project_graded' | 'achievement' | 'message';
  relatedId?: mongoose.Types.ObjectId; // id of course, project, badge, etc.
  isRead: boolean;
  link?: string; // direct URL to navigate to
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Notification title required'] },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['system', 'course_update', 'project_graded', 'achievement', 'message'], 
      default: 'system',
      index: true
    },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String },
  },
  { timestamps: true }
);

// TTL index to automatically purge notifications after a certain time, e.g., 30 days
// notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;