import express from 'express';
import { register, login } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Public routes
router.post('/login', login);

// Route to register a standard user (public)
router.post('/register', register);

router.post('/register/privileged', authenticate, authorize(UserRole.ADMIN), register);

export default router; 