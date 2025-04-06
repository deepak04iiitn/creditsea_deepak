import express from 'express';
import {
  createLoanApplication,
  getUserLoans,
  getLoanById,
} from '../controllers/loan.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All loan routes require authentication
router.use(authenticate);

router.post('/', createLoanApplication);
router.get('/', getUserLoans); // Gets loans for the authenticated user
router.get('/:loanId', getLoanById);

export default router; 