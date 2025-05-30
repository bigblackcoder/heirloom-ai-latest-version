import dotenv from "dotenv";
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// Check for database URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create SQLite database connection for development
const databasePath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';
const sqlite = new Database(databasePath, { 
  readonly: false 
});

// Create drizzle instance with our schema
export const db = drizzle(sqlite, { schema });