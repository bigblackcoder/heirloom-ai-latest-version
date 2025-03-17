import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertIdentityCapsuleSchema,
  insertVerifiedDataSchema,
  insertAiConnectionSchema,
  insertActivitySchema 
} from "@shared/schema";
import { z } from "zod";
import { verifyFace } from "./deepface";

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
      
      // Create initial identity capsule
      const capsule = await storage.createCapsule({
        userId: newUser.id,
        name: "Primary",
        description: "Your primary identity capsule"
      });
      
      // Log activity
      await storage.createActivity({
        userId: newUser.id,
        type: "account-created",
        description: "Account created successfully",
        metadata: { capsuleId: capsule.id }
      });
      
      res.status(201).json({ message: "User registered successfully", user: userResponse });
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
      
      // Create session (in a real app, generate JWT/session token here)
      req.session = { userId: user.id };
      
      res.status(200).json({ message: "Login successful", user: userResponse });
    } catch (error) {
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session = null;
    res.status(200).json({ message: "Logged out successfully" });
  });
  
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userResponse } = user;
      
      res.status(200).json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  
  // Face verification routes
  app.post("/api/verification/face", async (req: Request, res: Response) => {
    try {
      // For development, allow unauthenticated requests for testing
      const userId = req.session?.userId || 1; // Default to user ID 1 for testing
      
      const { image, saveToDb = false } = req.body;
      
      if (!image) {
        return res.status(200).json({ 
          success: false,
          message: "Image data is required" 
        });
      }
      
      // Verify the face using DeepFace, pass userId for face matching
      console.log("Processing face verification with DeepFace...");
      const verificationResult = await verifyFace(image, userId, saveToDb);
      
      if (!verificationResult.success) {
        return res.status(200).json({
          success: false,
          message: "Face verification failed",
          confidence: verificationResult.confidence,
          details: verificationResult.message || "Could not detect a valid face"
        });
      }
      
      // Set minimum confidence threshold
      const minConfidence = 85; // 85% confidence threshold
      
      if (verificationResult.confidence < minConfidence) {
        return res.status(200).json({
          success: false,
          message: "Face verification failed - low confidence",
          confidence: verificationResult.confidence,
          minRequired: minConfidence
        });
      }
      
      // Update user to verified status
      const updatedUser = await storage.updateUser(userId, { isVerified: true });
      
      if (!updatedUser && req.session?.userId) {
        return res.status(200).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      // Add verification details to the user's primary capsule
      if (userId) {
        const capsules = await storage.getCapsulesByUserId(userId);
        if (capsules.length > 0) {
          const primaryCapsule = capsules[0];
          
          // Add facial data if available from DeepFace
          if (verificationResult.results) {
            const { age, gender, dominant_race, dominant_emotion } = verificationResult.results;
            
            // Store demographic data
            if (age) {
              await storage.createVerifiedData({
                capsuleId: primaryCapsule.id,
                dataType: "age",
                value: String(age),
                verificationMethod: "face-scan",
                issuanceDate: new Date()
              });
            }
            
            if (gender) {
              // Handle both string and object gender formats
              let genderValue = '';
              if (typeof gender === 'string') {
                genderValue = gender;
              } else if (gender && typeof gender === 'object') {
                // Get the dominant gender by highest confidence
                const entries = Object.entries(gender);
                if (entries.length > 0) {
                  entries.sort((a, b) => b[1] - a[1]);
                  genderValue = entries[0][0];
                }
              }
              
              if (genderValue) {
                await storage.createVerifiedData({
                  capsuleId: primaryCapsule.id,
                  dataType: "gender",
                  value: genderValue,
                  verificationMethod: "face-scan",
                  issuanceDate: new Date()
                });
              }
            }
            
            // Store face ID if available
            if (verificationResult.face_id) {
              await storage.createVerifiedData({
                capsuleId: primaryCapsule.id,
                dataType: "face_id",
                value: verificationResult.face_id,
                verificationMethod: "face-scan",
                issuanceDate: new Date()
              });
            }
          }
        }
        
        // Log activity with additional details about face matching
        await storage.createActivity({
          userId: userId,
          type: "identity-verified",
          description: verificationResult.matched 
            ? "Identity verified against existing face record" 
            : "Identity verification was completed successfully",
          metadata: { 
            method: "face",
            confidence: verificationResult.confidence,
            matched: verificationResult.matched || false,
            face_id: verificationResult.face_id,
            ...(verificationResult.results || {})
          }
        });
      }
      
      res.status(200).json({ 
        success: true,
        message: verificationResult.matched 
          ? "Face verified and matched with existing record" 
          : "Face verification successful", 
        verified: true,
        confidence: verificationResult.confidence,
        matched: verificationResult.matched || false,
        face_id: verificationResult.face_id,
        results: verificationResult.results
      });
    } catch (error) {
      console.error("Error during face verification:", error);
      res.status(200).json({ 
        success: false, 
        message: "Error during face verification", 
        confidence: 0 
      });
    }
  });
  
  // Identity Capsule routes
  app.get("/api/capsules", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const capsules = await storage.getCapsulesByUserId(req.session.userId);
      res.status(200).json(capsules);
    } catch (error) {
      res.status(500).json({ message: "Error fetching capsules" });
    }
  });
  
  app.post("/api/capsules", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const capsuleData = insertIdentityCapsuleSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const newCapsule = await storage.createCapsule(capsuleData);
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "capsule-created",
        description: `Created new capsule: ${newCapsule.name}`,
        metadata: { capsuleId: newCapsule.id }
      });
      
      res.status(201).json(newCapsule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating capsule" });
    }
  });
  
  // Verified Data routes
  app.get("/api/capsules/:id/data", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const capsuleId = parseInt(req.params.id);
      
      // Check if capsule belongs to user
      const capsule = await storage.getCapsule(capsuleId);
      if (!capsule || capsule.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied to this capsule" });
      }
      
      const data = await storage.getVerifiedDataByCapsuleId(capsuleId);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching verified data" });
    }
  });
  
  app.post("/api/capsules/:id/data", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const capsuleId = parseInt(req.params.id);
      
      // Check if capsule belongs to user
      const capsule = await storage.getCapsule(capsuleId);
      if (!capsule || capsule.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied to this capsule" });
      }
      
      const dataInput = insertVerifiedDataSchema.parse({
        ...req.body,
        capsuleId
      });
      
      const newData = await storage.createVerifiedData(dataInput);
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "data-added",
        description: `Added ${newData.dataType} verification to capsule`,
        metadata: { capsuleId, dataId: newData.id }
      });
      
      res.status(201).json(newData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error adding verified data" });
    }
  });
  
  // AI Connection routes
  app.get("/api/connections", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const connections = await storage.getAiConnectionsByUserId(req.session.userId);
      res.status(200).json(connections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching AI connections" });
    }
  });
  
  app.post("/api/connections", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user is verified
      const user = await storage.getUser(req.session.userId);
      if (!user?.isVerified) {
        return res.status(403).json({ message: "User must be verified to connect with AI services" });
      }
      
      const connectionData = insertAiConnectionSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const newConnection = await storage.createAiConnection(connectionData);
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "ai-connected",
        description: `Connected with ${newConnection.aiServiceName}`,
        metadata: { connectionId: newConnection.id }
      });
      
      res.status(201).json(newConnection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating AI connection" });
    }
  });
  
  app.patch("/api/connections/:id/revoke", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const connectionId = parseInt(req.params.id);
      
      // Check if connection belongs to user
      const connection = await storage.getAiConnection(connectionId);
      if (!connection || connection.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied to this connection" });
      }
      
      const updatedConnection = await storage.updateAiConnection(connectionId, { isActive: false });
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "connection-revoked",
        description: `Revoked access for ${connection.aiServiceName}`,
        metadata: { connectionId }
      });
      
      res.status(200).json(updatedConnection);
    } catch (error) {
      res.status(500).json({ message: "Error revoking connection" });
    }
  });
  
  // Activity routes
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activities = await storage.getActivitiesByUserId(req.session.userId);
      res.status(200).json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
