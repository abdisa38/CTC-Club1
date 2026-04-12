import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'initialized' | 'pending' | 'success' | 'failed' | 'cancelled';

export interface IPaymentTransaction extends Document {
  user: mongoose.Types.ObjectId;
  txRef: string;
  amount: number;
  currency: 'ETB';
  status: PaymentStatus;
  checkoutUrl?: string;
  chapaReference?: string;
  paymentReference?: string;
  paymentMethod?: string;
  verifiedAt?: Date;
  paidAt?: Date;
  rawInitializeResponse?: unknown;
  rawVerifyResponse?: unknown;
  rawWebhookPayload?: unknown;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    txRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      required: true,
      default: 'ETB',
      enum: ['ETB'],
    },
    status: {
      type: String,
      required: true,
      default: 'initialized',
      enum: ['initialized', 'pending', 'success', 'failed', 'cancelled'],
      index: true,
    },
    checkoutUrl: {
      type: String,
      trim: true,
    },
    chapaReference: {
      type: String,
      trim: true,
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    rawInitializeResponse: {
      type: Schema.Types.Mixed,
    },
    rawVerifyResponse: {
      type: Schema.Types.Mixed,
    },
    rawWebhookPayload: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

paymentTransactionSchema.index({ user: 1, createdAt: -1 });

const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', paymentTransactionSchema);

export default PaymentTransaction;
