import { Express, Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { verifyFace } from './deepface';
import { Server } from 'http';
import { insertUserSchema, insertActivitySchema, insertIdentityCapsuleSchema, insertVerifiedDataSchema, insertAiConnectionSchema } from '@shared/schema';
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Express> {
  // User Registration
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ 
          error: "Username already exists" 
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      // Create activity record
      await storage.createActivity({
        userId: user.id,
        type: "register",
        description: "Registered a new account"
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Registration error:', error);
      return res.status(500).json({ error: "Registration failed" });
    }
  });
  
  // User Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Create activity record
      await storage.createActivity({
        userId: user.id,
        type: "login",
        description: "Logged in to account"
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: "Login failed" });
    }
  });
  
  // User Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    try {
      // Record activity if user is logged in
      if (req.session && req.session.userId) {
        storage.createActivity({
          userId: req.session.userId,
          type: "logout",
          description: "Logged out of account"
        }).catch(err => console.error('Error recording logout activity:', err));
      }
      
      // Destroy session
      req.session.destroy(err => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ error: "Logout failed" });
        }
        
        res.clearCookie('connect.sid');
        return res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: "Logout failed" });
    }
  });
  
  // Get Current User
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Get user from storage
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({ error: "Failed to get user data" });
    }
  });
  
  // Face Verification
  app.post("/api/verification/face", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }
      
      // Perform face verification
      const verificationResult = await verifyFace(imageBase64);
      
      // Update user's verification status if successful
      if (verificationResult.success && verificationResult.confidence > 0.7) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          await storage.updateUser(user.id, { isVerified: true });
          
          // Record activity
          await storage.createActivity({
            userId: user.id,
            type: "verification",
            description: "Completed face verification"
          });
        }
      }
      
      return res.json(verificationResult);
    } catch (error) {
      console.error('Face verification error:', error);
      return res.status(500).json({ 
        error: "Face verification failed",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get Identity Capsules
  app.get("/api/capsules", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Get capsules for current user
      const capsules = await storage.getCapsulesByUserId(req.session.userId);
      
      return res.json({ capsules });
    } catch (error) {
      console.error('Get capsules error:', error);
      return res.status(500).json({ error: "Failed to get capsules" });
    }
  });
  
  // Create Identity Capsule
  app.post("/api/capsules", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Validate request body
      const validatedData = insertIdentityCapsuleSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Create capsule
      const capsule = await storage.createCapsule(validatedData);
      
      // Record activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "capsule_create",
        description: `Created identity capsule: ${capsule.name}`
      });
      
      return res.status(201).json({ capsule });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create capsule error:', error);
      return res.status(500).json({ error: "Failed to create identity capsule" });
    }
  });
  
  // Get Verified Data for a Capsule
  app.get("/api/capsules/:id/data", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const capsuleId = parseInt(req.params.id);
      if (isNaN(capsuleId)) {
        return res.status(400).json({ error: "Invalid capsule ID" });
      }
      
      // Verify ownership
      const capsule = await storage.getCapsule(capsuleId);
      if (!capsule) {
        return res.status(404).json({ error: "Capsule not found" });
      }
      
      if (capsule.userId !== req.session.userId) {
        return res.status(403).json({ error: "You don't have permission to access this capsule" });
      }
      
      // Get verified data
      const verifiedData = await storage.getVerifiedDataByCapsuleId(capsuleId);
      
      return res.json({ data: verifiedData });
    } catch (error) {
      console.error('Get verified data error:', error);
      return res.status(500).json({ error: "Failed to get verified data" });
    }
  });
  
  // Add Verified Data to a Capsule
  app.post("/api/capsules/:id/data", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const capsuleId = parseInt(req.params.id);
      if (isNaN(capsuleId)) {
        return res.status(400).json({ error: "Invalid capsule ID" });
      }
      
      // Verify ownership
      const capsule = await storage.getCapsule(capsuleId);
      if (!capsule) {
        return res.status(404).json({ error: "Capsule not found" });
      }
      
      if (capsule.userId !== req.session.userId) {
        return res.status(403).json({ error: "You don't have permission to modify this capsule" });
      }
      
      // Validate request body
      const validatedData = insertVerifiedDataSchema.parse({
        ...req.body,
        capsuleId
      });
      
      // Add verified timestamp
      const data = await storage.createVerifiedData({
        ...validatedData,
        verifiedAt: new Date().toISOString()
      });
      
      // Record activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "data_add",
        description: `Added verified data to capsule: ${validatedData.dataType}`
      });
      
      return res.status(201).json({ data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Add verified data error:', error);
      return res.status(500).json({ error: "Failed to add verified data" });
    }
  });
  
  // Get AI Connections
  app.get("/api/connections", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Get connections for current user
      const connections = await storage.getAiConnectionsByUserId(req.session.userId);
      
      return res.json({ connections });
    } catch (error) {
      console.error('Get connections error:', error);
      return res.status(500).json({ error: "Failed to get AI connections" });
    }
  });
  
  // Create AI Connection
  app.post("/api/connections", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Validate request body
      const validatedData = insertAiConnectionSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Create connection with timestamp
      const connection = await storage.createAiConnection({
        ...validatedData,
        createdAt: new Date().toISOString(),
        lastUsed: null
      });
      
      // Record activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "connection_create",
        description: `Connected to AI service: ${connection.aiServiceName}`
      });
      
      return res.status(201).json({ connection });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create connection error:', error);
      return res.status(500).json({ error: "Failed to create AI connection" });
    }
  });
  
  // Revoke AI Connection
  app.patch("/api/connections/:id/revoke", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const connectionId = parseInt(req.params.id);
      if (isNaN(connectionId)) {
        return res.status(400).json({ error: "Invalid connection ID" });
      }
      
      // Verify ownership
      const connection = await storage.getAiConnection(connectionId);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      
      if (connection.userId !== req.session.userId) {
        return res.status(403).json({ error: "You don't have permission to modify this connection" });
      }
      
      // Update connection
      const updatedConnection = await storage.updateAiConnection(connectionId, {
        isActive: false
      });
      
      // Record activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "connection_revoke",
        description: `Revoked connection to AI service: ${connection.aiServiceName}`
      });
      
      return res.json({ connection: updatedConnection });
    } catch (error) {
      console.error('Revoke connection error:', error);
      return res.status(500).json({ error: "Failed to revoke AI connection" });
    }
  });
  
  // Get Activity Log
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Get activities for current user
      const activities = await storage.getActivitiesByUserId(req.session.userId);
      
      return res.json({ activities });
    } catch (error) {
      console.error('Get activities error:', error);
      return res.status(500).json({ error: "Failed to get activity log" });
    }
  });
  
  return app;
}