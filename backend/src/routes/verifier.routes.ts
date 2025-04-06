import express from 'express';
import {
  getPendingLoans,
  verifyLoan,
  getVerifierDashboardStats
} from '../controllers/verifier.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// All verifier routes require verifier authentication and authorization
router.use(authenticate);
router.use(authorize(UserRole.VERIFIER));

router.get('/loans/pending', getPendingLoans);
router.patch('/loans/:loanId/verify', verifyLoan);
router.get('/dashboard/stats', getVerifierDashboardStats);

export default router; 