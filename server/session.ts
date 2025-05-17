import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

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

  // Configure session middleware
  return session({
    secret: process.env.SESSION_SECRET || "heirloom-dev-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: ONE_WEEK,
    },
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ 
    success: false, 
    message: "You must be logged in to access this resource" 
  });
}

// Middleware to check if user has verified their identity using biometrics
export function isVerifiedIdentity(req: any, res: any, next: any) {
  if (req.session && req.session.userId && req.session.identityVerified) {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: "You must verify your identity with biometrics to access this resource" 
  });
}