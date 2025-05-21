The provided changes only reference updating the main routes and integrating hybrid auth routes; however, the original file provided is not a route file. Assuming the intention is to create a separate `hybrid-auth-routes.ts` file (as suggested by the import) and integrate it into the main `registerRoutes` function, I'll generate the `hybrid-auth-routes.ts` file content and then modify the original `registerRoutes` function to include these new routes. Since the original file represents the `registerRoutes` function in the main server file, the modifications will involve adding new routes related to hybrid authentication.

```typescript
import type { Express, Response } from "express";
import type { Request as ExpressRequest } from "express";
import type { FileArray, UploadedFile } from "express-fileupload";

// Extend Request type to include files for express-fileupload
interface Request extends ExpressRequest {
  files?: FileArray;
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
import { Router } from 'express';
// Mock implementations for Apple FaceID and Google Biometric Auth (replace with actual SDK integrations)
const mockAppleFaceIdVerification = async (): Promise<boolean> => {
  // Simulate successful FaceID verification
  return true;
};

const mockGoogleBiometricVerification = async (): Promise<boolean> => {
  // Simulate successful Google Biometric verification
  return true;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Hybrid Authentication Routes

  app.post("/api/auth/hybrid/faceid", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      // 1. Verify face using DeepFace
      const deepFaceResult = await verifyFace(image, undefined, false); // Do not save to DB initially

      if (!deepFaceResult.success) {
        return res.status(400).json({ message: "DeepFace verification failed", details: deepFaceResult.message });
      }

      // 2. Mock Apple FaceID verification
      const faceIdResult = await mockAppleFaceIdVerification();

      if (!faceIdResult) {
        return res.status(400).json({ message: "Apple FaceID verification failed" });
      }

      // If both verifications pass, register/login user
      // Here, you'd typically create a new user or log in an existing user
      // For simplicity, let's assume we create a new user with a generated username

      const username = `user_${Date.now()}`;
      const userData = { username, password: "defaultPassword" }; // Replace 'defaultPassword' with a secure method

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
        description: "Account created successfully via Hybrid Auth",
        metadata: { capsuleId: capsule.id }
      });

      // Create session
      req.session.userId = newUser.id;
      req.session.isVerified = true;

      res.status(201).json({ message: "User registered/logged in successfully via Hybrid Auth", user: userResponse });
    } catch (error) {
      console.error("Hybrid Auth (FaceID) error:", error);
      res.status(500).json({ message: "Error during Hybrid Auth (FaceID)" });
    }
  });

  app.post("/api/auth/hybrid/googlebio", async (req: Request, res: Response) => {
    try {
      const { biometricData } = req.body;

      if (!biometricData) {
        return res.status(400).json({ message: "Biometric data is required" });
      }

      // 1. Verify biometric data using Google Biometric Auth
      const googleBioResult = await mockGoogleBiometricVerification();

      if (!googleBioResult) {
        return res.status(400).json({ message: "Google Biometric verification failed" });
      }

      // If verification passes, register/login user
      // Here, you'd typically create a new user or log in an existing user
      // For simplicity, let's assume we create a new user with a generated username

      const username = `user_${Date.now()}`;
      const userData = { username, password: "defaultPassword" }; // Replace 'defaultPassword' with a secure method

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
        description: "Account created successfully via Hybrid Auth",
        metadata: { capsuleId: capsule.id }
      });

      // Create session
      req.session.userId = newUser.id;
      req.session.isVerified = true;

      res.status(201).json({ message: "User registered/logged in successfully via Hybrid Auth", user: userResponse });
    } catch (error) {
      console.error("Hybrid Auth (Google Bio) error:", error);
      res.status(500).json({ message: "Error during Hybrid Auth (Google Bio)" });
    }
  });
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

      // Create session
      req.session.userId = user.id;
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
    // Get user ID before destroying session
    const userId = req.session?.userId;

    // Destroy session
    req.session.destroy((err) => {
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
        }).catch(err => console.error("Error logging logout activity:", err));
      }

      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return the password
      const { password, ...userResponse } = user;

      res.status(200).json(userResponse);
    } catch (error) {
      console.error("Error fetching user profile:", error);
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