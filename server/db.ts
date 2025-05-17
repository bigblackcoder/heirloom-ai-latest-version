import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Initialize database and run migrations if needed
export async function initializeDb() {
  try {
    console.log("Connecting to database...");
    
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("Database connection successful");
    
    // Check if tables exist
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!result.rows[0].exists) {
      console.log("Tables don't exist, running schema push...");
      // For a real production app, we would use migrations here
      // For now, we'll rely on the schema push done outside this function
    }
    
    console.log("Database initialization completed");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}