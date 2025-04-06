// backend/src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import Loan, { LoanStatus } from '../models/loan.model';
import User, { UserRole } from '../models/user.model';
import mongoose from 'mongoose';
import Payment, { PaymentStatus, IPayment } from '../models/payment.model';

// Get all loans for admin
export const getAllLoans = async (req: Request, res: Response) => {
  try {
    const loans = await Loan.find()
      .populate('user', 'name email')
      .populate('verifiedBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ applicationDate: -1 });

    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Existing loan management functions
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

// Create a new loan from admin
export const createLoan = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { 
      user, // This should be the user ID of the borrower
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
      user: new mongoose.Types.ObjectId(user),
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

    // Populate the user info before sending response
    await loan.populate('user', 'name email');

    res.status(201).json({ message: 'Loan created successfully', loan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateLoanStatus = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { status } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!Object.values(LoanStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Update the loan status
    loan.status = status;

    // Update additional fields based on the new status
    switch (status) {
      case LoanStatus.VERIFIED:
        loan.verifiedBy = new mongoose.Types.ObjectId(req.user.userId);
        loan.verificationDate = new Date();
        break;
      case LoanStatus.APPROVED:
        loan.approvedBy = new mongoose.Types.ObjectId(req.user.userId);
        loan.approvalDate = new Date();
        break;
      case LoanStatus.DISBURSED:
        loan.disbursementDate = new Date();
        
        // Create payment schedule when a loan is disbursed
        await createPaymentSchedule(loan);
        break;
    }

    await loan.save();
    
    // Populate user info before sending response
    await loan.populate('user', 'name email');
    
    res.status(200).json({ 
      message: `Loan status updated to ${status} successfully`, 
      loan 
    });
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
      amount: Math.round(monthlyPayment * 100) / 100, // Round to 2 decimal places
      dueDate,
      status: PaymentStatus.PENDING
    });
  }
  
  await Payment.insertMany(payments);
}

// User management functions
export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    // Get all users with admin or verifier roles
    const adminUsers = await User.find({ role: { $in: [UserRole.ADMIN, UserRole.VERIFIER] } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ users: adminUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Get all users (for admin management)
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (role !== UserRole.ADMIN && role !== UserRole.VERIFIER) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
    });

    await user.save();

    res.status(201).json({
      message: `${role} user created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing the role of main admin user
    if (user.email === 'admin@example.com') {
      return res.status(403).json({ message: 'Cannot change role of main admin user' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the main admin user
    if (user.email === 'admin@example.com') {
      return res.status(403).json({ message: 'Cannot delete main admin user' });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    // Users statistics
    const activeUsers = await User.countDocuments({ role: UserRole.USER });
    const borrowers = await Loan.distinct('user');
    
    // Loan statistics
    const cashDisbursed = await Loan.aggregate([
      { $match: { status: { $in: [LoanStatus.APPROVED, LoanStatus.DISBURSED] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const cashReceived = await Loan.aggregate([
      { $match: { status: LoanStatus.DISBURSED } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    
    const totalLoans = await Loan.countDocuments();
    const repaidLoans = await Loan.countDocuments({ 
      status: LoanStatus.DISBURSED, 
      amountPaid: { $gt: 0 } 
    });
    const otherAccounts = 10; // Placeholder as per UI
    
    // Recovery rates
    const defaultedLoans = await Loan.countDocuments({ status: LoanStatus.REJECTED });
    const totalLoansProcessed = await Loan.countDocuments({ 
      status: { $in: [LoanStatus.APPROVED, LoanStatus.DISBURSED, LoanStatus.REJECTED] } 
    });
    
    const recoveryRateDefault = totalLoansProcessed > 0 
      ? ((totalLoansProcessed - defaultedLoans) / totalLoansProcessed) * 100 
      : 0;
      
    const recoveryRateOpen = borrowers.length > 0 
      ? (repaidLoans / borrowers.length) * 100 
      : 0;
    
    // Charts data
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
    
    // Recent loans for display
    const recentLoans = await Loan.find()
      .populate('user', 'name email')
      .sort({ applicationDate: -1 })
      .limit(10);
    
    res.status(200).json({
      stats: {
        activeUsers,
        borrowers: borrowers.length,
        cashDisbursed: cashDisbursed[0]?.total || 0,
        cashReceived: cashReceived[0]?.total || 0,
        totalSavings: 450000, // Placeholder value as per UI
        totalLoans,
        repaidLoans,
        otherAccounts,
      },
      recoveryRates: {
        defaultLoans: Math.round(recoveryRateDefault),
        openLoans: Math.round(recoveryRateOpen),
      },
      charts: {
        loansReleasedMonthly,
        outstandingLoansMonthly,
        repaymentsCollectedMonthly
      },
      recentLoans
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// Get all borrowers (users with role 'user')
export const getBorrowers = async (req: Request, res: Response) => {
  try {
    // Get users with 'user' role only
    const borrowers = await User.find({ role: UserRole.USER })
      .select('-password')
      .sort({ createdAt: -1 });

    // For each borrower, get their loan statistics
    const borrowersWithStats = await Promise.all(
      borrowers.map(async (borrower) => {
        // Get all loans for this user
        const loans = await Loan.find({ user: borrower._id });
        
        // Calculate statistics
        const totalLoans = loans.length;
        const totalBorrowed = loans.reduce((sum, loan) => sum + loan.amount, 0);
        
        // Find the most recent loan or activity
        const lastLoan = loans.length > 0 ? 
          loans.sort((a, b) => 
            new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
          )[0] : null;
        
        const lastActivity = lastLoan ? lastLoan.applicationDate : borrower.createdAt;
        
        // Determine user status based on loans
        let status = 'active';
        if (loans.some(loan => loan.status === LoanStatus.DEFAULTED)) {
          status = 'blacklisted';
        } else if (totalLoans === 0) {
          status = 'inactive';
        }
        
        return {
          _id: borrower._id,
          name: borrower.name,
          email: borrower.email,
          phone: borrower.phone || 'Not provided',
          status,
          loans: totalLoans,
          totalBorrowed,
          lastActivity
        };
      })
    );

    res.status(200).json({ borrowers: borrowersWithStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update borrower status
export const updateBorrowerStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive', 'blacklisted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== UserRole.USER) {
      return res.status(400).json({ message: 'Can only update borrower status for regular users' });
    }
    
    // Update user status in metadata or a separate collection
    // For this example, we'll use a custom field on the user document
    user.set('status', status);
    await user.save();
    
    res.status(200).json({ 
      message: `Borrower status updated to ${status} successfully`,
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