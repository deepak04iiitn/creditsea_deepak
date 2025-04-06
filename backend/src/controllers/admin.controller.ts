import { Request, Response } from 'express';
import Loan, { LoanStatus } from '../models/loan.model';
import User, { UserRole } from '../models/user.model';
import mongoose from 'mongoose';
import Payment, { PaymentStatus, IPayment } from '../models/payment.model';

export const getVerifiedLoans = async (req: Request, res: Response) => {
  try {
    const verifiedLoans = await Loan.find({ status: LoanStatus.VERIFIED })
      .populate('user', 'name email')
      .populate('verifiedBy', 'name')
      .sort({ verificationDate: 1 });

    res.status(200).json({ loans: verifiedLoans });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const approveLoan = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { status } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (status !== LoanStatus.APPROVED && status !== LoanStatus.REJECTED) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== LoanStatus.VERIFIED) {
      return res.status(400).json({ message: 'Loan is not verified' });
    }

    loan.status = status;
    loan.approvedBy = new mongoose.Types.ObjectId(req.user.userId);
    loan.approvalDate = new Date();

    // If approved, set it as disbursed immediately for this demo
    if (status === LoanStatus.APPROVED) {
      loan.status = LoanStatus.DISBURSED;
      loan.disbursementDate = new Date();
      
      // Create payment schedule
      await createPaymentSchedule(loan);
    }

    await loan.save();

    res.status(200).json({ message: `Loan ${status} successfully`, loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Helper function to create payment schedule
async function createPaymentSchedule(loan: any) {
  const { _id, user, tenure, totalAmountPayable } = loan;
  const monthlyPayment = totalAmountPayable / tenure;
  
  const payments: Partial<IPayment>[] = [];
  const today = new Date();
  
  for (let i = 0; i < tenure; i++) {
    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    
    payments.push({
      loan: _id,
      user,
      amount: monthlyPayment,
      dueDate,
      status: PaymentStatus.PENDING
    });
  }
  
  await Payment.insertMany(payments);
} 