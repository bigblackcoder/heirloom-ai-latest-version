/**
 * Database Client Utility
 * A secure wrapper around your PostgreSQL database connection
 * Uses environment variables for all sensitive configuration
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

// Create a connection pool using the DATABASE_URL environment variable
// This ensures credentials are never hardcoded
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

// Add error handler to prevent connection issues from crashing the app
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Create a Drizzle client with the connection pool and schema
export const db = drizzle(pool, { schema });

/**
 * Perform a health check on the database
 * @returns {Promise<boolean>} Whether the database is healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple query to check if the database is responsive
    const result = await pool.query('SELECT 1');
    return result.rows.length === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Close the database connection pool
 * Call this when shutting down the application
 */
export async function closeDatabase(): Promise<void> {
  await pool.end();
}

export default db;