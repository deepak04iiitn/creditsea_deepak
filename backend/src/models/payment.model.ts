import mongoose, { Document, Schema } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}

export interface IPayment extends Document {
  loan: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

const paymentSchema = new Schema<IPayment>({
  loan: {
    type: Schema.Types.ObjectId,
    ref: 'Loan',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paidDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  },
  paymentMethod: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  notes: {
    type: String,
  },
});

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment; 