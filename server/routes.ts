import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create an HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}