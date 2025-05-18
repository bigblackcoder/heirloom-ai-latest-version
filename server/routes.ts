import type { Express, Response, NextFunction } from "express";
import type { Request as ExpressRequest } from "express";
import type { FileArray, UploadedFile } from "express-fileupload";

// Extend Request type to include files for express-fileupload
interface Request extends ExpressRequest {
  files?: FileArray;
}

// Define session types to improve type safety
declare module 'express-session' {
  interface SessionData {
    userId?: string | number;
    isVerified?: boolean;
    webauthnChallenge?: string;
    webauthnUserId?: number;
  }
}

// Helper for consistent user ID handling
function ensureStringUserId(userId: string | number | undefined): string | undefined {
  if (userId === undefined) {
    return undefined;
  }
  return String(userId);
}

import { createServer, type Server } from "http";
import fileUpload from "express-fileupload";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { detectFaceBasic } from "./deepface";
import { verifyFace } from "./verification_proxy";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Don't return the password
      const { password, ...userResponse } = newUser;
      
      // Create session with user ID
      if (req.session) {
        req.session.userId = newUser.id;
      }
      
      res.status(201).json({ 
        message: "User registered successfully", 
        user: userResponse 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error registering user" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return the password
      const { password: _, ...userResponse } = user;
      
      // Check if session exists before using it
      if (!req.session) {
        return res.status(500).json({ message: "Session not configured" });
      }
      
      // Create session with user ID
      req.session.userId = user.id;
      req.session.isVerified = user.isVerified;
      
      res.status(200).json({ message: "Login successful", user: userResponse });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    // Check if session exists
    if (!req.session) {
      return res.status(200).json({ message: "No active session" });
    }
    
    // Destroy session
    req.session.destroy((err: Error | null) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Face verification endpoint
  app.post("/api/verification/face", async (req: Request, res: Response) => {
    try {
      // Check if there's an authenticated user from the session or request body
      let userId = req.session?.userId;
      
      const { 
        image, 
        userId: requestUserId, 
        saveToDb = false
      } = req.body;
      
      // If userId was provided in the request body, use that instead
      if (requestUserId) {
        userId = requestUserId;
      }
      
      if (!image) {
        return res.status(400).json({ 
          success: false,
          message: "Image data is required"
        });
      }
      
      // Send to verification service
      const verificationResult = await detectFaceBasic(image, userId, saveToDb);
      
      // Return result
      res.status(200).json(verificationResult);
    } catch (error) {
      console.error("Error during face verification:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during face verification"
      });
    }
  });
  
  // Create the HTTP server
  const server = createServer(app);
  
  return server;
}