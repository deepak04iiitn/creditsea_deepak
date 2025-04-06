// backend/src/routes/admin.routes.ts
import express from 'express';
import {
  getAllLoans,
  getVerifiedLoans,
  approveLoan,
  createLoan,
  updateLoanStatus,
  getAdminUsers,
  getAllUsers,
  createAdminUser,
  updateUserRole,
  deleteAdminUser,
  getAdminDashboardStats,
  getBorrowers,
  updateBorrowerStatus
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// All admin routes require admin authentication and authorization
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Dashboard
router.get('/dashboard/stats', getAdminDashboardStats);

// Loan management
router.get('/loans', getAllLoans); // Get all loans
router.post('/loans', createLoan); // Create a loan as admin
router.get('/loans/verified', getVerifiedLoans); // Get only verified loans
router.patch('/loans/:loanId/approve', approveLoan); // Legacy approve endpoint
router.patch('/loans/:loanId/status', updateLoanStatus); // New endpoint to update loan status

// User management
router.get('/users', getAllUsers); // Get all users
router.get('/users/admin', getAdminUsers); // Get only admin and verifier users
router.post('/users', createAdminUser); // Create a privileged user (admin/verifier)
router.put('/users/:userId', updateUserRole); // Update a user's role
router.delete('/users/:userId', deleteAdminUser); // Delete a user

// Add these routes to your admin.routes.ts file

// Borrower management
router.get('/borrowers', getBorrowers); // Get all borrowers (regular users)
router.patch('/borrowers/:userId/status', updateBorrowerStatus); // Update borrower status

export default router;