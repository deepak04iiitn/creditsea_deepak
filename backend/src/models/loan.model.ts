import mongoose, { Document, Schema } from 'mongoose';

export enum LoanStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  DISBURSED = 'disbursed',
  REPAYING = 'repaying',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
}

export interface ILoan extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  tenure: number;
  reason: string;
  employmentStatus: string;
  employerName?: string;
  employerAddress?: string;
  status: LoanStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  applicationDate: Date;
  verificationDate?: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  interestRate: number;
  totalAmountPayable: number;
  amountPaid: number;
}

const loanSchema = new Schema<ILoan>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1000,
  },
  tenure: {
    type: Number,
    required: true,
    min: 1,
  },
  reason: {
    type: String,
    required: true,
  },
  employmentStatus: {
    type: String,
    required: true,
  },
  employerName: {
    type: String,
  },
  employerAddress: {
    type: String,
  },
  status: {
    type: String,
    enum: Object.values(LoanStatus),
    default: LoanStatus.PENDING,
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  verificationDate: {
    type: Date,
  },
  approvalDate: {
    type: Date,
  },
  disbursementDate: {
    type: Date,
  },
  interestRate: {
    type: Number,
    default: 15, // Default interest rate of 15%
  },
  totalAmountPayable: {
    type: Number,
    default: function(this: ILoan) {
      // Simple interest calculation
      const principal = this.amount;
      const rate = this.interestRate / 100;
      const time = this.tenure / 12; // Convert months to years
      return principal * (1 + rate * time);
    }
  },
  amountPaid: {
    type: Number,
    default: 0,
  }
});

const Loan = mongoose.model<ILoan>('Loan', loanSchema);

export default Loan; 