// backend/src/routes/verifier.routes.ts
import express from 'express';
import {
  getPendingLoans,
  verifyLoan,
  getVerifierDashboardStats,
  getBorrowers,
  updateBorrowerVerificationStatus
} from '../controllers/verifier.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// All verifier routes require verifier authentication and authorization
router.use(authenticate);
router.use(authorize(UserRole.VERIFIER));

// Dashboard
router.get('/dashboard/stats', getVerifierDashboardStats);

// Loan management
router.get('/loans/pending', getPendingLoans);
router.patch('/loans/:loanId/verify', verifyLoan);

// Borrower management
router.get('/borrowers', getBorrowers);
router.patch('/borrowers/:userId/status', updateBorrowerVerificationStatus);

export default router;