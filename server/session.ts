import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';

// Create a PostgreSQL session store
const PgStore = connectPgSimple(session);

// Generate a random session secret if none is provided
const SESSION_SECRET = process.env.SESSION_SECRET || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Configure session options
export const sessionConfig = {
  store: new PgStore({
    pool,
    tableName: 'sessions', // Uses the 'sessions' table from our schema
    createTableIfMissing: false, // Table is already created by our schema
  }),
  name: 'heirloom.sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production'
  }
};

// Export session middleware
export const sessionMiddleware = session(sessionConfig);

// Types for session data
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isVerified?: boolean;
  }
}