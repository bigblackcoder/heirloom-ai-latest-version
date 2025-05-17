import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { Request, Response, NextFunction } from "express";

// Define custom session type for TypeScript
declare module "express-session" {
  interface SessionData {
    userId?: number;
    identityVerified?: boolean;
    biometricInfo?: {
      verified: boolean;
      method: string;
      lastVerified: Date;
    };
  }
}

// Initialize PostgreSQL session store
const PgSession = connectPg(session);

// Create session configuration
export function createSessionConfig() {
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  
  // Create session store
  const sessionStore = new PgSession({
    pool,
    tableName: "sessions",
    createTableIfMissing: true,
  });

  // Configure session middleware with enhanced security
  return session({
    secret: process.env.SESSION_SECRET || "heirloom-dev-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: 'heirloom.sid', // Custom cookie name for better security
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: ONE_WEEK,
      sameSite: 'strict', // CSRF protection
      path: '/' 
    },
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    return next();
  }
  console.error("Authentication failed: No valid session for protected route");
  return res.status(401).json({ 
    success: false, 
    message: "You must be logged in to access this resource",
    error: "authentication_required"
  });
}

// Middleware to check if user has verified their identity using biometrics
export function isVerifiedIdentity(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    console.error("Identity verification failed: No valid session");
    return res.status(401).json({ 
      success: false, 
      message: "You must be logged in to access this resource",
      error: "authentication_required"
    });
  }
  
  if (!req.session.identityVerified) {
    console.error(`Identity verification required for user ${req.session.userId}`);
    return res.status(403).json({ 
      success: false, 
      message: "You must verify your identity with biometrics to access this resource",
      error: "verification_required",
      verificationNeeded: true
    });
  }
  
  return next();
}

/**
 * Helper function to set biometric verification in user session
 * @param req Express request object
 * @param verified Whether identity is verified
 * @param method The biometric method used
 */
export function setIdentityVerification(
  req: Request, 
  verified: boolean = true, 
  method: string = 'biometric'
): void {
  if (!req.session) {
    console.error("Cannot set identity verification: No session available");
    return;
  }
  
  req.session.identityVerified = verified;
  req.session.biometricInfo = {
    verified,
    method,
    lastVerified: new Date()
  };
  
  console.log(`Identity verification ${verified ? 'set' : 'cleared'} for user ID: ${req.session.userId || 'unknown'}`);
}