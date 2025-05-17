import express from "express";
import cors from "cors";
import { json } from "express";
import { registerRoutes } from "./routes";
import { initializeDb } from "./db"; 
import path from "path";

async function main() {
  // Create Express application
  const app = express();

  // Configure middleware
  app.use(cors());
  app.use(json());
  
  // Initialize database
  await initializeDb();
  
  // Register API routes
  const server = await registerRoutes(app);

  // Start server
  const PORT = parseInt(process.env.PORT || "3001", 10);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ Server running at http://0.0.0.0:${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});