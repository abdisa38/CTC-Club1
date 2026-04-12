import mongoose, { Document } from 'mongoose';
export type PaymentStatus = 'initialized' | 'pending' | 'success' | 'failed' | 'cancelled';
export type PaymentTransactionType = 'premium' | 'course';
export interface IPaymentTransaction extends Document {
    user: mongoose.Types.ObjectId;
    transactionType: PaymentTransactionType;
    course?: mongoose.Types.ObjectId;
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
declare const PaymentTransaction: mongoose.Model<IPaymentTransaction, {}, {}, {}, mongoose.Document<unknown, {}, IPaymentTransaction, {}, mongoose.DefaultSchemaOptions> & IPaymentTransaction & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPaymentTransaction>;
export default PaymentTransaction;
//# sourceMappingURL=paymentTransactionModel.d.ts.map