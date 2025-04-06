import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user.model';
import User from '../models/user.model';

interface DecodedToken {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as DecodedToken;
    req.user = { userId: decoded.userId, role: decoded.role };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: 'Authorization failed: Insufficient permissions' });
    }
    
    next();
  };
}; 