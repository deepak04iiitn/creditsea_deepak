import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

export default router; 