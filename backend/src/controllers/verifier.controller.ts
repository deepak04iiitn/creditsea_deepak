// backend/src/controllers/verifier.controller.ts
import { Request, Response } from 'express';
import Loan, { LoanStatus } from '../models/loan.model';
import User, { UserRole } from '../models/user.model';
import mongoose from 'mongoose';
import Payment, { PaymentStatus } from '../models/payment.model';

// Get pending loans for verification
export const getPendingLoans = async (req: Request, res: Response) => {
  try {
    const pendingLoans = await Loan.find({ status: LoanStatus.PENDING })
      .populate('user', 'name email')
      .sort({ applicationDate: 1 });

    res.status(200).json({ loans: pendingLoans });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Verify a loan (approve for next steps or reject)
export const verifyLoan = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { status } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (status !== LoanStatus.VERIFIED && status !== LoanStatus.REJECTED) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== LoanStatus.PENDING) {
      return res.status(400).json({ message: 'Loan is not pending verification' });
    }

    loan.status = status;
    loan.verifiedBy = new mongoose.Types.ObjectId(req.user.userId);
    loan.verificationDate = new Date();

    await loan.save();

    res.status(200).json({ message: `Loan ${status} successfully`, loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get stats for verifier dashboard
export const getVerifierDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get counts
    const totalLoans = await Loan.countDocuments();
    const totalBorrowers = await Loan.distinct('user');
    const verifiedLoans = await Loan.countDocuments({ status: LoanStatus.VERIFIED });
    const rejectedLoans = await Loan.countDocuments({ status: LoanStatus.REJECTED });
    
    const cashDisbursed = await Loan.aggregate([
      { $match: { status: { $in: [LoanStatus.APPROVED, LoanStatus.DISBURSED] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const cashReceived = await Loan.aggregate([
      { $match: { status: LoanStatus.DISBURSED } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    
    // Get recent verified loans
    const recentActivity = await Loan.find({ status: { $ne: LoanStatus.PENDING } })
      .populate('user', 'name email')
      .sort({ verificationDate: -1 })
      .limit(10);
    
    // Get monthly statistics
    const currentYear = new Date().getFullYear();
    const loansReleasedMonthly = await Loan.aggregate([
      {
        $match: {
          applicationDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          },
          status: { $in: [LoanStatus.VERIFIED, LoanStatus.APPROVED, LoanStatus.DISBURSED] }
        }
      },
      {
        $group: {
          _id: { $month: '$applicationDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const outstandingLoansMonthly = await Loan.aggregate([
      {
        $match: {
          status: { $in: [LoanStatus.APPROVED, LoanStatus.DISBURSED] }
        }
      },
      {
        $group: {
          _id: { $month: '$approvalDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const repaymentsCollectedMonthly = await Payment.aggregate([
      {
        $match: {
          status: PaymentStatus.PAID,
          paidDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$paidDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      stats: {
        totalLoans,
        totalBorrowers: totalBorrowers.length,
        verifiedLoans,
        rejectedLoans,
        cashDisbursed: cashDisbursed[0]?.total || 0,
        cashReceived: cashReceived[0]?.total || 0,
        totalSavings: 450000, // Placeholder value
      },
      recentActivity,
      charts: {
        loansReleasedMonthly,
        outstandingLoansMonthly,
        repaymentsCollectedMonthly
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get borrowers for verification
export const getBorrowers = async (req: Request, res: Response) => {
  try {
    // Get users with 'user' role
    const users = await User.find({ role: UserRole.USER })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // For each user, get document verification status
    const borrowers = users.map(user => {
      // Mock document list and verification status
      const documentTypes = ['ID Card', 'Proof of Address', 'Bank Statement'];
      
      // Randomly determine if user has verification status
      const randomStatus = Math.random();
      let status = 'pending';
      if (user.get('verificationStatus')) {
        status = user.get('verificationStatus');
      } else if (randomStatus > 0.7) {
        status = 'verified';
      } else if (randomStatus < 0.2) {
        status = 'rejected';
      }
      
      // Random selection of submitted documents
      const documents = [];
      for (const doc of documentTypes) {
        if (Math.random() > 0.3) {
          documents.push(doc);
        }
      }
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Not provided',
        status,
        dateApplied: user.createdAt,
        documents
      };
    });
    
    res.status(200).json({ borrowers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update borrower verification status
export const updateBorrowerVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== UserRole.USER) {
      return res.status(400).json({ 
        message: 'Can only update verification status for regular users' 
      });
    }
    
    user.set('verificationStatus', status);
    await user.save();
    
    res.status(200).json({ 
      message: `Borrower verification status updated to ${status} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};