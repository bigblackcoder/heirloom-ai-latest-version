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
import { 
  insertUserSchema, 
  insertIdentityCapsuleSchema,
  insertVerifiedDataSchema,
  insertAiConnectionSchema,
  insertActivitySchema 
} from "@shared/schema";
import { z } from "zod";
import { verifyFace, detectFaceBasic } from "./deepface";
import { verifyFace as verifyFaceAPI, verifyVideo } from "./verification_proxy";
import { log } from "./vite";
import { blockchainService } from "./blockchain/service";
import { requireAuth, requireVerified } from "./middleware/auth";

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
      
      // Check if session exists before using it
      if (!req.session) {
        return res.status(500).json({ message: "Session not configured" });
      }
      
      // Create session with string user ID for consistent typing
      req.session.userId = String(user.id);
      req.session.isVerified = user.isVerified;
      
      // Log login activity
      await storage.createActivity({
        userId: user.id,
        type: "login",
        description: "User logged in",
        metadata: { timestamp: new Date().toISOString() }
      });
      
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
    
    // Get user ID before destroying session
    const userId = req.session.userId;
    
    // Destroy session
    req.session.destroy((err: Error | null) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      
      // Log activity if we have the user ID
      if (userId) {
        storage.createActivity({
          userId: userId,
          type: "logout",
          description: "User logged out",
          metadata: { timestamp: new Date().toISOString() }
        }).catch((err: Error) => console.error("Error logging logout activity:", err));
      }
      
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      // Ensure session exists (shouldn't happen due to requireAuth middleware)
      if (!req.session) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Parse userId to handle potential string/number type differences
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found in session" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userResponse } = user;
      
      res.status(200).json(userResponse);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching user profile:", errorMessage);
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  
  // Update user's profile picture (JSON base64 method)
  app.post("/api/user/profile-picture", requireAuth, async (req: Request, res: Response) => {
    try {
      const { avatarData } = req.body;
      
      if (!avatarData || typeof avatarData !== 'string') {
        return res.status(400).json({ message: "No avatar data provided or invalid format" });
      }
      
      // Validate base64 data
      try {
        // Check if it's a valid base64 string
        Buffer.from(avatarData, 'base64').toString('base64');
      } catch (e) {
        return res.status(400).json({ message: "Invalid base64 data format" });
      }
      
      // Create a data URL from the base64 data - detect mime type or default to jpeg
      let mimeType = 'image/jpeg'; // Default mime type
      const avatar = `data:${mimeType};base64,${avatarData}`;
      
      // Update the user's avatar
      const updatedUser = await storage.updateUser(req.session.userId!, { 
        avatar,
        updatedAt: new Date()
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userResponse } = updatedUser;
      
      // Log the activity
      await storage.createActivity({
        userId: req.session.userId!,
        type: "profile-updated",
        description: "Profile picture updated",
        metadata: { updatedAt: new Date().toISOString() }
      });
      
      // Clear any existing session data for this route
      if (req.session.save) {
        req.session.save();
      }
      
      res.status(200).json({
        message: "Profile picture updated successfully",
        user: userResponse
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Error updating profile picture" });
    }
  });
  
  // Update user's profile picture using form-data (more reliable)
  app.post("/api/user/profile-picture-form", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.files || !req.files.profilePicture) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const file = req.files.profilePicture;
      
      // Handle single file or array of files
      const uploadedFile = Array.isArray(file) ? file[0] : file;
      
      // Check file type
      if (!uploadedFile.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: "Uploaded file is not an image" });
      }
      
      // Convert file to base64
      const fileData = uploadedFile.data.toString('base64');
      const avatar = `data:${uploadedFile.mimetype};base64,${fileData}`;
      
      // Update the user's avatar
      const updatedUser = await storage.updateUser(req.session.userId!, { 
        avatar,
        updatedAt: new Date()
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userResponse } = updatedUser;
      
      // Log the activity
      await storage.createActivity({
        userId: req.session.userId!,
        type: "profile-updated",
        description: "Profile picture updated (form upload)",
        metadata: { updatedAt: new Date().toISOString() }
      });
      
      res.status(200).json({
        message: "Profile picture updated successfully",
        user: userResponse
      });
    } catch (error) {
      console.error("Error updating profile picture (form upload):", error);
      res.status(500).json({ message: "Error updating profile picture" });
    }
  });
  
  // Face verification routes
  // Video verification endpoint - more robust and accurate
  app.post("/api/verification/video", async (req: Request, res: Response) => {
    // Create a debugging session ID
    const debugSessionId = req.body.debug_session || `video-verify-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      // Check if there's an authenticated user from the session or request body
      let userId = req.session?.userId;
      
      const { 
        userId: requestUserId, 
        user_id: altUserId,
        saveToDb = false,
        videoFile
      } = req.body;
      
      // If userId was provided in the request body, use that instead
      if (requestUserId || altUserId) {
        userId = requestUserId || altUserId;
      }
      
      log(`[DEBUG:${debugSessionId}] Video verification attempt started. User ID: ${userId || 'guest'}`, "face-verify");
      
      if (!videoFile) {
        log(`[DEBUG:${debugSessionId}] No video file provided`, "face-verify");
        return res.status(400).json({ 
          success: false,
          message: "Video file is required",
          debugSession: debugSessionId
        });
      }
      
      try {
        // Send to FastAPI service for verification
        log(`[DEBUG:${debugSessionId}] Processing video verification...`, "face-verify");
        
        // Call the video verification API
        const verificationResult = await verifyVideo(videoFile, userId, saveToDb);
        
        // If verification successful, update user verified status
        if (verificationResult.success && verificationResult.confidence > 70 && userId) {
          try {
            const updatedUser = await storage.updateUser(userId, { isVerified: true });
            if (updatedUser) {
              log(`[DEBUG:${debugSessionId}] Successfully updated user verified status`, "face-verify");
            }
          } catch (error) {
            log(`[DEBUG:${debugSessionId}] Error updating user verification status: ${error.message}`, "face-verify");
          }
          
          // Log activity
          await storage.createActivity({
            userId: userId,
            type: "identity-verified",
            description: "Identity verified through video verification",
            metadata: { 
              method: "video",
              confidence: verificationResult.confidence,
              matched: verificationResult.matched || false,
              face_id: verificationResult.face_id
            }
          });
        }
        
        // Return result
        res.status(200).json({
          ...verificationResult,
          debugSession: debugSessionId
        });
        
      } catch (error) {
        log(`[DEBUG:${debugSessionId}] Video verification error: ${error.message}`, "face-verify");
        res.status(200).json({ 
          success: false, 
          message: "Error during video verification", 
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
          debugSession: debugSessionId
        });
      }
    } catch (error) {
      console.error("Error during video verification:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during video verification",
        debugSession: debugSessionId
      });
    }
  });
  
  // Image-based face verification
  app.post("/api/verification/face", async (req: Request, res: Response) => {
    // Create a debugging session ID first - accessible throughout the entire route handler
    // Use client provided debug session ID if available, otherwise generate a new one
    const providedDebugSession = req.body.debug_session || req.body.debugSession;
    const debugSessionId = providedDebugSession || `face-verify-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      // Check if there's an authenticated user from the session or request body
      let userId = req.session?.userId;
      
      const { 
        image, 
        userId: requestUserId, 
        user_id: altUserId, // Support for both camelCase and snake_case parameter names
        saveToDb = false, 
        useBasicDetection = false, 
        checkDbOnly = false,
        request_id = null
      } = req.body;
      
      // Log request details
      console.log(`[DEBUG:${debugSessionId}] Face verification request received. Request ID: ${request_id || 'none'}`);
      
      // If userId was provided in any format in the request body, use that instead
      if (requestUserId || altUserId) {
        userId = requestUserId || altUserId;
      }
      
      // Log verification attempt with debugging info
      log(`[DEBUG:${debugSessionId}] Face verification attempt started. User ID: ${userId || 'guest'}`, "face-verify");
      
      if (!image) {
        log(`[DEBUG:${debugSessionId}] No image data provided`, "face-verify");
        return res.status(200).json({ 
          success: false,
          message: "Image data is required",
          debugSession: debugSessionId
        });
      }
      
      // Log image metadata without exposing actual image data
      log(`[DEBUG:${debugSessionId}] Image received: ${image.substring(0, 30)}... (${image.length} chars)`, "face-verify");
      
      // Check for testing mode
      if (checkDbOnly) {
        log(`[DEBUG:${debugSessionId}] Testing mode: Check database only`, "face-verify");
        return res.status(200).json({ 
          success: true, 
          message: "Database check only mode",
          confidence: 95.5,
          matched: false,
          face_id: "00000000-0000-0000-0000-000000000000",
          debugSession: debugSessionId
        });
      }
      
      let verificationResult;
      
      // Try using the FastAPI verification service first
      try {
        log(`[DEBUG:${debugSessionId}] Attempting verification with FastAPI service...`, "face-verify");
        
        // Prepare request for FastAPI service
        const apiRequest = {
          image: image,
          userId: userId,
          saveToDb: saveToDb,
          requestId: debugSessionId,
          checkDbOnly: checkDbOnly,
          useBasicDetection: useBasicDetection
        };
        
        // Call the FastAPI service
        verificationResult = await verifyFaceAPI(apiRequest);
        
        log(`[DEBUG:${debugSessionId}] FastAPI verification result: ${verificationResult.success ? 'Success' : 'Failed'}`, "face-verify");
      } catch (apiError) {
        // Log the FastAPI service error
        log(`[DEBUG:${debugSessionId}] FastAPI service error, falling back to local verification: ${apiError}`, "face-verify");
        
        // Fallback to local verification
        if (useBasicDetection) {
          log(`[DEBUG:${debugSessionId}] Using lightweight face detection`, "face-verify");
          verificationResult = await detectFaceBasic(image, userId, saveToDb);
        } else {
          try {
            // Verify the face using DeepFace, pass userId for face matching
            log(`[DEBUG:${debugSessionId}] Processing face verification with DeepFace...`, "face-verify");
            verificationResult = await verifyFace(image, userId, saveToDb);
          } catch (deepfaceError) {
            // Fallback to basic detection if DeepFace fails
            log(`[DEBUG:${debugSessionId}] DeepFace error, falling back to lightweight detection: ${deepfaceError}`, "face-verify");
            verificationResult = await detectFaceBasic(image, userId, saveToDb);
          }
        }
      }
      
      // Log verification result details
      log(`[DEBUG:${debugSessionId}] Verification result: 
        Success: ${verificationResult.success}
        Confidence: ${verificationResult.confidence}
        Matched: ${verificationResult.matched}
        Face ID: ${verificationResult.face_id}`, "face-verify");
      
      if (!verificationResult.success) {
        log(`[DEBUG:${debugSessionId}] Verification failed: ${verificationResult.message || "Unknown reason"}`, "face-verify");
        return res.status(200).json({
          success: false,
          message: "Face verification failed",
          confidence: verificationResult.confidence,
          details: verificationResult.message || "Could not detect a valid face",
          debugSession: debugSessionId
        });
      }
      
      // Set minimum confidence threshold
      const minConfidence = 65; // Reduced confidence threshold for lightweight detection
      
      if (verificationResult.confidence < minConfidence) {
        log(`[DEBUG:${debugSessionId}] Low confidence: ${verificationResult.confidence}% (minimum required: ${minConfidence}%)`, "face-verify");
        return res.status(200).json({
          success: false,
          message: "Face verification failed - low confidence",
          confidence: verificationResult.confidence,
          minRequired: minConfidence,
          debugSession: debugSessionId
        });
      }
      
      log(`[DEBUG:${debugSessionId}] Verification passed confidence threshold. Confidence: ${verificationResult.confidence}%`, "face-verify");
      
      // Update user to verified status
      log(`[DEBUG:${debugSessionId}] Attempting to update user verified status. User ID: ${userId}`, "face-verify");
      
      // Only update user status if we have a valid userId
      if (userId) {
        try {
          const updatedUser = await storage.updateUser(userId, { isVerified: true });
          if (updatedUser) {
            log(`[DEBUG:${debugSessionId}] Successfully updated user verified status`, "face-verify");
          } else {
            log(`[DEBUG:${debugSessionId}] Failed to update user: User not found with ID ${userId}`, "face-verify");
          }
        } catch (error) {
          log(`[DEBUG:${debugSessionId}] Error updating user verification status: ${error.message}`, "face-verify");
        }
      } else {
        log(`[DEBUG:${debugSessionId}] Skipping user status update: No user ID provided`, "face-verify");
      }
      
      if (userId && req.session?.userId && req.session.userId !== userId) {
        log(`[DEBUG:${debugSessionId}] WARNING: Session user ID (${req.session.userId}) doesn't match requested user ID (${userId})`, "face-verify");
      }
      
      // Check if user exists
      const user = userId ? await storage.getUser(userId) : null;
      if (!user && userId) {
        log(`[DEBUG:${debugSessionId}] User not found with ID ${userId}`, "face-verify");
        return res.status(200).json({ 
          success: false,
          message: "User not found",
          debugSession: debugSessionId
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
      
      // Final success response with debug information
      log(`[DEBUG:${debugSessionId}] Successfully completed verification process`, "face-verify");
      
      const successResult = {
        success: true,
        message: verificationResult.matched 
          ? "Face verified and matched with existing record" 
          : "Face verification successful", 
        verified: true,
        confidence: verificationResult.confidence,
        matched: verificationResult.matched || false,
        face_id: verificationResult.face_id,
        results: verificationResult.results,
        debugSession: debugSessionId
      };
      
      // Log the response being sent (without sensitive data)
      log(`[DEBUG:${debugSessionId}] Response: ${JSON.stringify({
        ...successResult, 
        results: verificationResult.results ? '(face data)' : null
      })}`, "face-verify");
      
      res.status(200).json(successResult);
    } catch (error: any) { // Type error as any for error handling
      console.error("Error during face verification:", error);
      
      // Just use the existing debugSessionId since it's now defined at the route handler level
      
      // Log the error with the debug session ID
      log(`[DEBUG:${debugSessionId}] Critical error during face verification: ${error?.message || String(error) || 'Unknown error'}`, "face-verify");
      log(`[DEBUG:${debugSessionId}] Error stack: ${error?.stack || 'No stack trace available'}`, "face-verify");
      
      // Return error with debug session ID for tracing
      res.status(200).json({ 
        success: false, 
        message: "Error during face verification", 
        confidence: 0,
        debugSession: debugSessionId,
        error: process.env.NODE_ENV === 'development' ? (error?.message || String(error) || 'Unknown error') : undefined
      });
    }
  });
  
  // Identity Capsule routes
  app.get("/api/capsules", requireAuth, async (req: Request, res: Response) => {
    try {
      const capsules = await storage.getCapsulesByUserId(req.session.userId!);
      res.status(200).json(capsules);
    } catch (error) {
      console.error("Error fetching capsules:", error);
      res.status(500).json({ message: "Error fetching capsules" });
    }
  });
  
  app.post("/api/capsules", requireAuth, async (req: Request, res: Response) => {
    try {
      const capsuleData = insertIdentityCapsuleSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const newCapsule = await storage.createCapsule(capsuleData);
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId!,
        type: "capsule-created",
        description: `Created new capsule: ${newCapsule.name}`,
        metadata: { capsuleId: newCapsule.id }
      });
      
      res.status(201).json(newCapsule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating capsule:", error);
      res.status(500).json({ message: "Error creating capsule" });
    }
  });
  
  // Verified Data routes
  app.get("/api/capsules/:id/data", requireAuth, async (req: Request, res: Response) => {
    try {
      const capsuleId = parseInt(req.params.id);
      
      // Check if capsule belongs to user
      const capsule = await storage.getCapsule(capsuleId);
      if (!capsule || capsule.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied to this capsule" });
      }
      
      const data = await storage.getVerifiedDataByCapsuleId(capsuleId);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching verified data:", error);
      res.status(500).json({ message: "Error fetching verified data" });
    }
  });
  
  app.post("/api/capsules/:id/data", requireAuth, async (req: Request, res: Response) => {
    try {
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
        userId: req.session.userId!,
        type: "data-added",
        description: `Added ${newData.dataType} verification to capsule`,
        metadata: { capsuleId, dataId: newData.id }
      });
      
      res.status(201).json(newData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error adding verified data:", error);
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

  // Blockchain API routes
  // These endpoints support integration with Heirloom blockchain functionality
  
  // Issue a Heirloom Identity Token (HIT)
  app.post("/api/blockchain/issue-hit", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user is verified 
      const user = await storage.getUser(req.session.userId);
      if (!user?.isVerified) {
        return res.status(403).json({ 
          success: false,
          message: "Face verification required before token issuance"
        });
      }
      
      // Get wallet address from request
      const { walletAddress, metadataURI } = req.body;
      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: "Wallet address is required"
        });
      }
      
      // Check if user already has a HIT token
      if (blockchainService.hasHIT(walletAddress)) {
        return res.status(400).json({
          success: false,
          message: "Wallet already has an identity token"
        });
      }
      
      // Create default metadata URI if not provided
      const tokenMetadata = metadataURI || `ipfs://QmZEt8sXLZzv9SvBK4jEwKZKb8zTuKrfUhQ1Ko3JviLEL3/${user.username}`;
      
      // Issue a HIT token on the blockchain
      const hitToken = blockchainService.issueHIT(walletAddress, tokenMetadata);
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "blockchain-hit-issued",
        description: "Heirloom Identity Token (HIT) issued",
        metadata: { 
          walletAddress,
          tokenType: "HIT",
          tokenId: hitToken.tokenId,
          metadataURI: tokenMetadata,
          network: "Polygon Amoy Testnet",
          contractAddress: blockchainService.HIT_CONTRACT_ADDRESS,
          issuedAt: hitToken.issuedAt
        }
      });
      
      res.status(200).json({
        success: true,
        message: "Heirloom Identity Token (HIT) issued successfully",
        tokenId: "HIT-" + Date.now(),
        contractAddress: "0x6AFF771a6245945c19D13032Ec954aFA18DcA1b2",
        network: "Polygon Amoy Testnet",
        chainId: 80002
      });
    } catch (error) {
      console.error("Error issuing HIT token:", error);
      res.status(500).json({ 
        success: false,
        message: "Error issuing token"
      });
    }
  });
  
  // Issue a Provenance Token (PRVN)
  app.post("/api/blockchain/issue-prvn", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check required fields
      const { walletAddress, dataHash, dataType, metadataURI } = req.body;
      if (!walletAddress || !dataHash) {
        return res.status(400).json({
          success: false,
          message: "Wallet address and data hash are required"
        });
      }
      
      // Get the user's capsules
      const capsules = await storage.getCapsulesByUserId(req.session.userId);
      if (capsules.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No identity capsule found"
        });
      }
      
      // Create default metadata URI if not provided
      const tokenMetadata = metadataURI || `ipfs://QmZEt8sXLZzv9SvBK4jEwKZKb8zTuKrfUhQ1Ko3JviLEL3/prvn-${dataHash.substring(0, 8)}`;
      
      // Issue a PRVN token on the blockchain
      const prvnToken = blockchainService.issuePRVN(walletAddress, dataHash, tokenMetadata);
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "blockchain-prvn-issued",
        description: `Provenance Token (PRVN) issued for ${dataType || 'data'}`,
        metadata: { 
          walletAddress,
          dataHash,
          dataType: dataType || 'generic',
          capsuleId: capsules[0].id,
          tokenType: "PRVN",
          tokenId: prvnToken.tokenId,
          metadataURI: tokenMetadata,
          network: "Polygon Amoy Testnet",
          contractAddress: blockchainService.PRVN_CONTRACT_ADDRESS,
          issuedAt: prvnToken.issuedAt
        }
      });
      
      res.status(200).json({
        success: true,
        message: "Provenance Token (PRVN) issued successfully",
        tokenId: prvnToken.tokenId,
        contractAddress: blockchainService.PRVN_CONTRACT_ADDRESS,
        network: "Polygon Amoy Testnet",
        chainId: blockchainService.CHAIN_ID,
        dataHash: dataHash,
        metadataURI: tokenMetadata
      });
    } catch (error) {
      console.error("Error issuing PRVN token:", error);
      res.status(500).json({ 
        success: false,
        message: "Error issuing provenance token"
      });
    }
  });
  
  // Link HIT token to user identity
  app.post("/api/blockchain/link-hit", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { walletAddress, hitTokenId, prvnTokenId } = req.body;
      if (!walletAddress || !hitTokenId || !prvnTokenId) {
        return res.status(400).json({
          success: false,
          message: "Wallet address, HIT token ID, and PRVN token ID are required"
        });
      }
      
      // Check if both tokens exist
      const hitToken = blockchainService.getHIT(hitTokenId);
      const prvnToken = blockchainService.getPRVN(prvnTokenId);
      
      if (!hitToken) {
        return res.status(400).json({
          success: false,
          message: "HIT token not found"
        });
      }
      
      if (!prvnToken) {
        return res.status(400).json({
          success: false,
          message: "PRVN token not found"
        });
      }
      
      // Link the tokens
      blockchainService.linkHITToPRVN(hitTokenId, prvnTokenId);
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "blockchain-hit-linked",
        description: "HIT token linked to PRVN token",
        metadata: { 
          walletAddress,
          hitTokenId,
          prvnTokenId,
          hitContractAddress: blockchainService.HIT_CONTRACT_ADDRESS,
          prvnContractAddress: blockchainService.PRVN_CONTRACT_ADDRESS,
          chainId: blockchainService.CHAIN_ID
        }
      });
      
      res.status(200).json({
        success: true,
        message: "HIT token successfully linked to identity",
        walletAddress,
        tokenId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error linking HIT token:", error);
      res.status(500).json({ 
        success: false,
        message: "Error linking token to identity"
      });
    }
  });
  
  // Create license for data
  app.post("/api/blockchain/create-license", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { 
        prvnTokenId, 
        licenseName, 
        licenseTerms, 
        licensee,
        fee, 
        royaltyPercentage 
      } = req.body;
      
      if (!prvnTokenId || !licenseName || !licensee) {
        return res.status(400).json({
          success: false,
          message: "PRVN token ID, license name, and licensee address are required"
        });
      }
      
      // Check if the PRVN token exists
      const prvnToken = blockchainService.getPRVN(prvnTokenId);
      if (!prvnToken) {
        return res.status(404).json({
          success: false,
          message: "PRVN token not found"
        });
      }
      
      // Create the license
      const licenseFee = fee || 0;
      const royalty = royaltyPercentage || 0;
      
      const license = blockchainService.createLicense(
        prvnTokenId,
        licensee,
        licenseFee,
        royalty
      );
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "blockchain-license-created",
        description: `License created: ${licenseName}`,
        metadata: { 
          prvnTokenId,
          licenseName,
          licenseTerms,
          licensee,
          fee: licenseFee,
          royaltyPercentage: royalty,
          licenseManagerAddress: blockchainService.LICENSE_CONTRACT_ADDRESS,
          grantedAt: license.grantedAt
        }
      });
      
      res.status(200).json({
        success: true,
        message: "License created successfully",
        prvnTokenId,
        licenseName,
        licensee,
        fee: licenseFee,
        royaltyPercentage: royalty,
        contractAddress: blockchainService.LICENSE_CONTRACT_ADDRESS,
        network: "Polygon Amoy Testnet",
        chainId: blockchainService.CHAIN_ID,
        grantedAt: license.grantedAt
      });
    } catch (error) {
      console.error("Error creating license:", error);
      res.status(500).json({ 
        success: false,
        message: "Error creating license"
      });
    }
  });
  
  // Verify identity on-chain
  app.post("/api/blockchain/verify-onchain", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { walletAddress, tokenId, tokenType } = req.body;
      
      if (!walletAddress || !tokenId || !tokenType) {
        return res.status(400).json({
          success: false,
          message: "Wallet address, token ID, and token type are required"
        });
      }
      
      if (tokenType !== 'HIT' && tokenType !== 'PRVN') {
        return res.status(400).json({
          success: false,
          message: "Invalid token type. Must be 'HIT' or 'PRVN'"
        });
      }
      
      // Verify token on the blockchain
      const verificationResult = blockchainService.verifyOnChain(tokenId, tokenType);
      
      if (!verificationResult.verified) {
        return res.status(404).json({
          success: false,
          message: `${tokenType} token not found on chain`,
          tokenId,
          contractAddress: verificationResult.contractAddress
        });
      }
      
      // Check if the token belongs to the wallet
      if (verificationResult.owner !== walletAddress) {
        return res.status(403).json({
          success: false,
          message: `${tokenType} token is not owned by the provided wallet address`,
          tokenId,
          owner: verificationResult.owner,
          requestedWallet: walletAddress
        });
      }
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "blockchain-verification",
        description: `On-chain ${tokenType} token verification`,
        metadata: { 
          walletAddress,
          tokenId,
          tokenType,
          contractAddress: verificationResult.contractAddress,
          chainId: verificationResult.chainId,
          verificationTime: new Date()
        }
      });
      
      res.status(200).json({
        success: true,
        message: `${tokenType} token verified on-chain`,
        walletAddress,
        tokenId,
        tokenType,
        contractAddress: verificationResult.contractAddress,
        chainId: verificationResult.chainId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error in on-chain verification:", error);
      res.status(500).json({ 
        success: false,
        message: "Error during on-chain verification"
      });
    }
  });
  
  // Generate verification proof
  app.post("/api/verification/proof", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { purpose, requestor } = req.body;
      
      if (!purpose) {
        return res.status(400).json({
          success: false,
          message: "Verification purpose is required"
        });
      }
      
      // Get user data
      const user = await storage.getUser(req.session.userId);
      
      // This would generate a secure, cryptographic proof in production
      // For now, simulate a verification proof
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "verification-proof-generated",
        description: `Verification proof generated for ${purpose}`,
        metadata: { 
          purpose,
          requestor: requestor || "self",
          timestamp: new Date()
        }
      });
      
      res.status(200).json({
        success: true,
        message: "Verification proof generated",
        proofId: "PROOF-" + Date.now(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        purpose,
        username: user?.username,
        isVerified: user?.isVerified || false
      });
    } catch (error) {
      console.error("Error generating verification proof:", error);
      res.status(500).json({ 
        success: false,
        message: "Error generating verification proof"
      });
    }
  });
  
  // Register smart contract
  app.post("/api/blockchain/register-contract", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { contractAddress, name, symbol, contractType, chainId } = req.body;
      
      if (!contractAddress || !contractType || !name) {
        return res.status(400).json({
          success: false,
          message: "Contract address, name and type are required"
        });
      }
      
      if (contractType !== 'HIT' && contractType !== 'PRVN' && contractType !== 'LICENSE') {
        return res.status(400).json({
          success: false,
          message: "Invalid contract type. Must be 'HIT', 'PRVN', or 'LICENSE'"
        });
      }
      
      // Register the contract with the blockchain service
      blockchainService.registerContract({
        address: contractAddress,
        name,
        symbol: symbol || name.split(' ').map(word => word[0]).join(''),
        chainId: chainId || blockchainService.CHAIN_ID,
        deployedAt: Date.now(),
        contractType: contractType as 'HIT' | 'PRVN' | 'LICENSE'
      });
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "blockchain-contract-registered",
        description: `Smart contract registered: ${name} (${contractType})`,
        metadata: { 
          contractAddress,
          name,
          symbol,
          contractType,
          chainId: chainId || blockchainService.CHAIN_ID,
          registrationTime: new Date()
        }
      });
      
      res.status(200).json({
        success: true,
        message: "Smart contract registered successfully",
        contractAddress,
        contractType,
        registrationId: "REG-" + Date.now(),
        governanceAddress: "0x20086dA7De70Bd6476230c0C573a1497789Aae2E", // GovernanceModule from docs
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error registering smart contract:", error);
      res.status(500).json({ 
        success: false,
        message: "Error registering smart contract"
      });
    }
  });
  
  // Shareable achievement cards
  app.post("/api/achievements/generate", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { achievementType, title, description, shareMode } = req.body;
      
      if (!achievementType || !title) {
        return res.status(400).json({
          success: false,
          message: "Achievement type and title are required"
        });
      }
      
      // Get user data
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      // In production, this would generate a secure, shareable image
      // For now, generate a unique share ID
      const shareId = Buffer.from(`${user.username}-${achievementType}-${Date.now()}`).toString('base64');
      
      // Log activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "achievement-generated",
        description: `Generated achievement card: ${title}`,
        metadata: { 
          achievementType,
          title,
          description,
          shareMode: shareMode || 'private',
          shareId
        }
      });
      
      res.status(200).json({
        success: true,
        message: "Achievement card generated successfully",
        shareId,
        achievementType,
        title,
        description,
        shareUrl: `https://heirloom.io/share/${shareId}`,
        socialShareLinks: {
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I've earned a verification achievement on Heirloom: ${title}`)}&url=${encodeURIComponent(`https://heirloom.io/share/${shareId}`)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://heirloom.io/share/${shareId}`)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://heirloom.io/share/${shareId}`)}`
        }
      });
    } catch (error) {
      console.error("Error generating achievement card:", error);
      res.status(500).json({ 
        success: false,
        message: "Error generating achievement card"
      });
    }
  });
  
  // Get shareable achievement cards for current user
  app.get("/api/achievements", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // In a full implementation, this would retrieve from a database
      // For now, return sample achievement data based on activities
      const activities = await storage.getActivitiesByUserId(req.session.userId);
      
      // Filter for achievement-related activities
      const achievementActivities = activities.filter(
        activity => activity.type === "achievement-generated" || 
                   activity.type === "identity-verified" ||
                   activity.type === "blockchain-hit-issued"
      );
      
      // Transform activities into achievements
      const achievements = achievementActivities.map(activity => {
        const metadata = activity.metadata as any || {};
        
        // Generate an achievement based on activity type
        if (activity.type === "identity-verified") {
          return {
            id: `ach-${activity.id}`,
            achievementType: "verification",
            title: "Identity Verified",
            description: "Successfully completed identity verification",
            dateEarned: activity.createdAt,
            confidence: metadata.confidence || 95,
            shareId: Buffer.from(`verification-${activity.id}-${activity.userId}`).toString('base64'),
            shareUrl: `https://heirloom.io/share/${Buffer.from(`verification-${activity.id}-${activity.userId}`).toString('base64')}`,
          };
        } else if (activity.type === "blockchain-hit-issued") {
          return {
            id: `ach-${activity.id}`,
            achievementType: "blockchain",
            title: "HIT Token Issued",
            description: "Received Heirloom Identity Token (HIT)",
            dateEarned: activity.createdAt,
            network: metadata.network || "Polygon Amoy Testnet",
            contractAddress: metadata.contractAddress,
            shareId: Buffer.from(`blockchain-${activity.id}-${activity.userId}`).toString('base64'),
            shareUrl: `https://heirloom.io/share/${Buffer.from(`blockchain-${activity.id}-${activity.userId}`).toString('base64')}`,
          };
        } else if (activity.type === "achievement-generated") {
          return {
            id: `ach-${activity.id}`,
            achievementType: metadata.achievementType || "custom",
            title: metadata.title || "Custom Achievement",
            description: metadata.description || "User generated achievement",
            dateEarned: activity.createdAt,
            shareId: metadata.shareId || Buffer.from(`custom-${activity.id}-${activity.userId}`).toString('base64'),
            shareUrl: `https://heirloom.io/share/${metadata.shareId || Buffer.from(`custom-${activity.id}-${activity.userId}`).toString('base64')}`,
          };
        }
        
        // Default achievement format
        return {
          id: `ach-${activity.id}`,
          achievementType: "general",
          title: "Heirloom Achievement",
          description: activity.description,
          dateEarned: activity.createdAt,
          shareId: Buffer.from(`general-${activity.id}-${activity.userId}`).toString('base64'),
          shareUrl: `https://heirloom.io/share/${Buffer.from(`general-${activity.id}-${activity.userId}`).toString('base64')}`,
        };
      });
      
      res.status(200).json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Error fetching achievements" });
    }
  });
  
  // View a shared achievement card
  app.get("/api/share/:shareId", async (req: Request, res: Response) => {
    try {
      const { shareId } = req.params;
      
      if (!shareId) {
        return res.status(400).json({ 
          success: false,
          message: "Share ID is required" 
        });
      }
      
      // In a full implementation, this would retrieve from a database
      // For now, decode the share ID to get some information
      let shareData;
      try {
        const decodedData = Buffer.from(shareId, 'base64').toString();
        const [type, id, userId] = decodedData.split('-');
        
        // Get user data if available
        let username = "Heirloom User";
        if (userId) {
          const user = await storage.getUser(parseInt(userId));
          if (user) {
            username = user.username;
          }
        }
        
        // Create share data based on type
        if (type === "verification") {
          shareData = {
            type: "verification",
            title: "Identity Verified",
            description: "This user has successfully completed identity verification",
            issuanceDate: new Date(),
            username,
            verificationLevel: "Biometric Authentication"
          };
        } else if (type === "blockchain") {
          shareData = {
            type: "blockchain",
            title: "HIT Token Issued",
            description: "This user has received a Heirloom Identity Token (HIT)",
            issuanceDate: new Date(),
            username,
            network: "Polygon Amoy Testnet"
          };
        } else if (type === "custom") {
          shareData = {
            type: "custom",
            title: "Custom Achievement",
            description: "User generated achievement",
            issuanceDate: new Date(),
            username
          };
        } else {
          shareData = {
            type: "general",
            title: "Heirloom Achievement",
            description: "A user achievement from Heirloom",
            issuanceDate: new Date(),
            username
          };
        }
      } catch (decodeError) {
        // If decoding fails, provide a generic response
        shareData = {
          type: "unknown",
          title: "Heirloom Achievement",
          description: "A user achievement from Heirloom",
          issuanceDate: new Date()
        };
      }
      
      res.status(200).json({
        success: true,
        shareId,
        ...shareData,
        platformInfo: {
          name: "Heirloom Identity Platform",
          description: "Secure identity verification and management",
          website: "https://heirloom.io"
        }
      });
    } catch (error) {
      console.error("Error retrieving shared achievement:", error);
      res.status(500).json({ 
        success: false,
        message: "Error retrieving shared achievement"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
