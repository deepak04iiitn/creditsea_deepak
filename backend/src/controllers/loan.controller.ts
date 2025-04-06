import { Request, Response } from 'express';
import Loan, { LoanStatus } from '../models/loan.model';
import mongoose from 'mongoose';
import Payment, { PaymentStatus } from '../models/payment.model';

export const createLoanApplication = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { 
      amount, 
      tenure, 
      reason, 
      employmentStatus, 
      employerName, 
      employerAddress,
      interestRate = 15 // Default interest rate if not provided
    } = req.body;

    // Calculate total amount payable (simple interest)
    const principal = Number(amount);
    const rate = Number(interestRate) / 100;
    const time = Number(tenure) / 12; // Convert months to years
    const totalAmountPayable = principal * (1 + rate * time);

    const loan = new Loan({
      user: new mongoose.Types.ObjectId(req.user.userId),
      amount,
      tenure,
      reason,
      employmentStatus,
      employerName,
      employerAddress,
      status: LoanStatus.PENDING,
      applicationDate: new Date(),
      interestRate,
      totalAmountPayable,
      amountPaid: 0
    });

    await loan.save();

    res.status(201).json({ message: 'Loan application submitted successfully', loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserLoans = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const loans = await Loan.find({ user: req.user.userId })
      .sort({ applicationDate: -1 });

    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getLoanById = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name')
      .populate('approvedBy', 'name');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Only loan owner, verifiers, or admins can view loan details
    if (
      req.user?.userId !== loan.user.toString() &&
      req.user?.role !== 'verifier' &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Unauthorized to access this loan' });
    }

    // Get related payments
    const payments = await Payment.find({ loan: loanId })
      .sort({ dueDate: 1 });

    res.status(200).json({ loan, payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}; 