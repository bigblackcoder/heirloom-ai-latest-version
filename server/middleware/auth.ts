import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware to check if user is authenticated
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user session exists
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user exists in database
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      // Clear invalid session
      req.session.destroy(err => {
        if (err) console.error('Error destroying session:', err);
      });
      return res.status(401).json({ message: 'Invalid session' });
    }

    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Middleware to check if user is verified
 * Must be used after requireAuth middleware
 */
export const requireVerified = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user session exists (should be caught by requireAuth, but double check)
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user from database
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Identity verification required' });
    }

    // User is verified, proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Verification check error:', error);
    res.status(500).json({ message: 'Server error during verification check' });
  }
};