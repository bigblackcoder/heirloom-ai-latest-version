import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware to check if user is authenticated
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Set content type to JSON explicitly
    res.setHeader('Content-Type', 'application/json');
    
    // Check if user session exists
    if (!req.session || !req.session.userId) {
      console.log('Auth middleware: No session or userId found');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        redirect: '/login'
      });
    }

    // Check if user exists in database
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      console.log(`Auth middleware: User not found for userId: ${req.session.userId}`);
      // Clear invalid session
      req.session.destroy(err => {
        if (err) console.error('Error destroying session:', err);
      });
      return res.status(401).json({ 
        success: false,
        message: 'Invalid session',
        redirect: '/login'
      });
    }

    // Attach user to request object for later use
    (req as any).user = user;
    
    console.log(`Auth middleware: User authenticated: ${user.username}`);
    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication',
      redirect: '/login'
    });
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