// backend/src/routes/admin.routes.ts
import express from 'express';
import {
  getVerifiedLoans,
  approveLoan,
  getAdminUsers,
  getAllUsers,
  createAdminUser,
  updateUserRole,
  deleteAdminUser,
  getAdminDashboardStats
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
router.get('/loans/verified', getVerifiedLoans);
router.patch('/loans/:loanId/approve', approveLoan);

// User management
router.get('/users', getAllUsers); // Get all users
router.get('/users/admin', getAdminUsers); // Get only admin and verifier users
router.post('/users', createAdminUser); // Create a privileged user (admin/verifier)
router.put('/users/:userId', updateUserRole); // Update a user's role
router.delete('/users/:userId', deleteAdminUser); // Delete a user

export default router;