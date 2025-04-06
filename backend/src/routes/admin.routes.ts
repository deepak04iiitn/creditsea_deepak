import express from 'express';
import {
  getVerifiedLoans,
  approveLoan,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// All admin routes require admin authentication and authorization
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/loans/verified', getVerifiedLoans);
router.patch('/loans/:loanId/approve', approveLoan);

export default router; 