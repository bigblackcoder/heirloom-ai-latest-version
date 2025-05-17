import session from 'express-session';
import MemoryStore from 'memorystore';
import { Request } from 'express';

// Create a memory store for sessions
const MemoryStoreSession = MemoryStore(session);

// Enhanced session data interface to support both string and number user IDs
// This is necessary for WebAuthn which uses string IDs
declare module 'express-session' {
  export interface SessionData {
    userId?: string | number;
    username?: string;
    authenticated?: boolean;
    challenge?: string;
    registration?: {
      userId: string | number;
      username: string;
      challenge: string;
    };
  }
}

// Create and export a persistent session middleware using the memory store
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'heirloom-identity-secret',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // Cleanup expired sessions every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  }
});

// Helper type for request with session
export type RequestWithSession = Request & {
  session: session.Session & Partial<session.SessionData>;
};

// Utility functions for sessions
export function getUserIdFromSession(req: RequestWithSession): string | number | undefined {
  return req.session?.userId;
}

export function isAuthenticated(req: RequestWithSession): boolean {
  return !!req.session?.authenticated && !!req.session?.userId;
}

export function setAuthenticatedUser(req: RequestWithSession, userId: string | number): void {
  req.session.userId = userId;
  req.session.authenticated = true;
}

export function clearSession(req: RequestWithSession): void {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
  });
}