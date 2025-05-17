import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createSessionConfig, isAuthenticated, isVerifiedIdentity } from "./session";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: express.Application): Promise<Server> {
  // Apply session middleware
  app.use(createSessionConfig());
  
  // Basic routes
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // API Status route
  app.get("/api/status", async (_req: Request, res: Response) => {
    try {
      // Check database connection
      const dbConnected = await checkDatabaseConnection();
      
      // Return status
      return res.json({
        status: "online",
        version: "1.0.0",
        database: dbConnected ? "connected" : "error",
        features: {
          biometricAuth: true,
          faceVerification: true,
          blockchainIntegration: true
        }
      });
    } catch (error) {
      console.error("Error checking API status:", error);
      return res.status(500).json({ 
        status: "error",
        message: "Failed to check API status"
      });
    }
  });

  // Authentication routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid user data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { username, password, email, firstName, lastName, avatar } = validationResult.data;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ success: false, message: "Username already taken" });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        avatar
      });
      
      // Set session
      if (req.session) {
        req.session.userId = newUser.id;
        req.session.username = newUser.username;
      }
      
      // Log activity
      await storage.createActivity({
        userId: newUser.id,
        type: "account_created",
        description: "Account created",
        metadata: { 
          method: "password" 
        }
      });
      
      // Return user (without password)
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({ success: true, user: userWithoutPassword });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ success: false, message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid username or password" });
      }
      
      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ success: false, message: "Invalid username or password" });
      }
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
        req.session.username = user.username;
      }
      
      // Log activity
      await storage.createActivity({
        userId: user.id,
        type: "login",
        description: "User logged in",
        metadata: { 
          method: "password" 
        }
      });
      
      // Return user (without password)
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ success: false, message: "Logout failed" });
        }
        
        res.clearCookie("connect.sid");
        return res.json({ success: true, message: "Logged out successfully" });
      });
    } else {
      return res.json({ success: true, message: "No active session" });
    }
  });

  app.get("/api/auth/me", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId;
      
      // Get user (convert userId to number since our storage expects a number)
      const user = await storage.getUser(Number(userId));
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Return user (without password)
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error retrieving user:", error);
      return res.status(500).json({ success: false, message: "Failed to retrieve user" });
    }
  });

  // Biometric routes
  app.get("/api/biometrics/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId as number;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID not found in session"
        });
      }
      
      // Get user's biometric credentials
      const credentials = await storage.getBiometricCredentialsByUserId(userId);
      
      // Determine available device types
      const deviceTypes = ["web"];
      if (/iPhone|iPad|iPod/i.test(req.headers["user-agent"] || "")) {
        deviceTypes.push("ios");
      } else if (/Android/i.test(req.headers["user-agent"] || "")) {
        deviceTypes.push("android");
      }
      
      // Detect if WebAuthn is supported
      const supported = true; // Basic check - would be more comprehensive in production
      
      // Return status
      return res.json({
        supported,
        credentials,
        availableDeviceTypes: deviceTypes,
        preferredBiometricType: detectPreferredBiometricType(req)
      });
    } catch (error) {
      console.error("Error checking biometric status:", error);
      return res.status(500).json({ success: false, message: "Failed to check biometric status" });
    }
  });

  app.post("/api/biometrics/register/options", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId as number;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID not found in session"
        });
      }
      
      const username = req.session!.username as string;
      const { biometricType = "fingerprint", deviceType = "web" } = req.body;
      
      // Create challenge
      const challenge = crypto.randomBytes(32);
      const challengeBase64 = challenge.toString('base64url');
      
      // Store challenge in session for verification
      req.session!.challenge = challengeBase64;
      
      // Create credential creation options
      const options = {
        publicKey: {
          // Relying Party (RP) info
          rp: {
            name: "Heirloom Identity Platform",
            id: req.hostname
          },
          // User info
          user: {
            id: Buffer.from(userId.toString(), 'utf-8'),
            name: username,
            displayName: username
          },
          // Challenge
          challenge: challengeBase64,
          // Public key parameters
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 } // RS256
          ],
          timeout: 60000,
          attestation: "direct",
          authenticatorSelection: {
            authenticatorAttachment: deviceType === "web" ? "platform" : "cross-platform",
            userVerification: "required" // Require biometric verification
          }
        }
      };
      
      // Return options
      return res.json(options);
    } catch (error) {
      console.error("Error generating biometric registration options:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to generate biometric registration options" 
      });
    }
  });

  app.post("/api/biometrics/register/complete", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId;
      const { id, rawId, type, response, biometricType, deviceType } = req.body;
      
      // Verify challenge
      const expectedChallenge = req.session!.challenge;
      if (!expectedChallenge) {
        return res.status(400).json({ 
          success: false, 
          message: "Registration session expired or invalid" 
        });
      }
      
      // Verify credential (simplified for demo - would be more robust in production)
      const clientDataJSON = JSON.parse(Buffer.from(response.clientDataJSON, 'base64url').toString());
      
      if (clientDataJSON.challenge !== expectedChallenge) {
        return res.status(400).json({ 
          success: false, 
          message: "Challenge verification failed" 
        });
      }
      
      // Clear challenge from session
      delete req.session!.challenge;
      
      // Create attestation object for blockchain integration
      const attestationObj = {
        timestamp: new Date().toISOString(),
        origin: clientDataJSON.origin,
        type: clientDataJSON.type,
        verified: true
      };
      
      // Mock blockchain transaction ID (in production, would submit data to blockchain)
      const blockchainTxId = `tx_${crypto.randomBytes(16).toString('hex')}`;
      
      // Prepare metadata object correctly for JSON storage
      const metadataObj = {
        registeredFrom: req.headers["user-agent"] || "unknown device",
        registrationTime: new Date().toISOString()
      };
      
      // Prepare attestation correctly for JSON storage
      const processedAttestationObj = {
        timestamp: new Date().toISOString(),
        origin: clientDataJSON.origin || "unknown",
        type: clientDataJSON.type || "webauthn.create",
        verified: true
      };
      
      // Save credential to database
      const credential = await storage.createBiometricCredential({
        userId: Number(userId),
        credentialId: id,
        biometricType,
        deviceType,
        publicKey: rawId,
        attestation: processedAttestationObj,
        blockchainTxId,
        isActive: true,
        metadata: metadataObj
      });
      
      // Log activity
      await storage.createActivity({
        userId: Number(userId),
        type: "biometric_registered",
        description: `${biometricType} biometric registered`,
        metadata: { 
          credentialId: id,
          deviceType,
          blockchainTxId
        }
      });
      
      // Return success with credential
      return res.json({ 
        success: true, 
        message: "Biometric credential registered successfully",
        credential
      });
    } catch (error) {
      console.error("Error registering biometric credential:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to register biometric credential" 
      });
    }
  });

  app.post("/api/biometrics/verify/options", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId;
      const { credentialId } = req.body;
      
      // Create challenge
      const challenge = crypto.randomBytes(32);
      const challengeBase64 = challenge.toString('base64url');
      
      // Store challenge in session for verification
      req.session!.verifyChallenge = challengeBase64;
      
      // Get user's biometric credentials
      type CredentialDescriptor = { id: string; type: "public-key" };
      let allowCredentials: CredentialDescriptor[] = [];
      
      if (credentialId) {
        // If specific credential ID provided, use only that
        const credential = await storage.getBiometricCredentialByCredentialId(credentialId);
        if (credential && credential.userId === Number(userId) && credential.isActive) {
          allowCredentials = [{
            id: credential.credentialId,
            type: "public-key" as const
          }];
        }
      } else {
        // Otherwise, use all active credentials
        const credentials = await storage.getBiometricCredentialsByUserId(Number(userId));
        allowCredentials = credentials.map(cred => ({
          id: cred.credentialId,
          type: "public-key" as const
        }));
      }
      
      if (allowCredentials.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid biometric credentials found"
        });
      }
      
      // Create authentication options
      const options = {
        publicKey: {
          // Challenge
          challenge: challengeBase64,
          // Timeout
          timeout: 60000,
          // RP ID
          rpId: req.hostname,
          // Allowed credentials
          allowCredentials,
          // Require biometric verification
          userVerification: "required"
        }
      };
      
      // Return options
      return res.json(options);
    } catch (error) {
      console.error("Error generating biometric verification options:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to generate biometric verification options" 
      });
    }
  });

  app.post("/api/biometrics/verify/complete", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId as number;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID not found in session"
        });
      }
      const { id, rawId, type, response } = req.body;
      
      // Verify challenge
      const expectedChallenge = req.session!.verifyChallenge;
      if (!expectedChallenge) {
        return res.status(400).json({ 
          success: false, 
          message: "Verification session expired or invalid" 
        });
      }
      
      // Get credential from database
      const credential = await storage.getBiometricCredentialByCredentialId(id);
      if (!credential || credential.userId !== userId || !credential.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid credential" 
        });
      }
      
      // Verify attestation (simplified for demo - would be more robust in production)
      const clientDataJSON = JSON.parse(Buffer.from(response.clientDataJSON, 'base64url').toString());
      
      if (clientDataJSON.challenge !== expectedChallenge) {
        return res.status(400).json({ 
          success: false, 
          message: "Challenge verification failed" 
        });
      }
      
      // Clear challenge from session
      delete req.session!.verifyChallenge;
      
      // Set verified status in session
      req.session!.identityVerified = true;
      req.session!.verifiedAt = new Date();
      req.session!.verifiedWith = credential.biometricType;
      
      // Update credential last used
      await storage.updateBiometricCredential(credential.id, {
        lastUsedAt: new Date()
      });
      
      // Log activity
      await storage.createActivity({
        userId,
        type: "identity_verified",
        description: `Identity verified with ${credential.biometricType}`,
        metadata: JSON.stringify({ 
          credentialId: id,
          deviceType: credential.deviceType,
          blockchainTxId: credential.blockchainTxId
        })
      });
      
      // Return success
      return res.json({ 
        success: true, 
        verified: true,
        message: "Identity verified successfully"
      });
    } catch (error) {
      console.error("Error verifying identity:", error);
      return res.status(500).json({ 
        success: false, 
        verified: false,
        message: "Failed to verify identity" 
      });
    }
  });

  app.delete("/api/biometrics/credentials/:credentialId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session!.userId as number;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID not found in session"
        });
      }
      
      const { credentialId } = req.params;
      
      // Get credential
      const credential = await storage.getBiometricCredentialByCredentialId(credentialId);
      
      if (!credential) {
        return res.status(404).json({ 
          success: false, 
          message: "Credential not found" 
        });
      }
      
      // Verify ownership
      if (credential.userId !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: "You don't have permission to delete this credential" 
        });
      }
      
      // Deactivate credential (soft delete)
      await storage.updateBiometricCredential(credential.id, {
        isActive: false
      });
      
      // Log activity
      await storage.createActivity({
        userId: Number(userId),
        type: "biometric_removed",
        description: `${credential.biometricType} biometric removed`,
        metadata: { 
          credentialId,
          deviceType: credential.deviceType,
          blockchainTxId: credential.blockchainTxId
        }
      });
      
      // Return success
      return res.json({ 
        success: true, 
        message: "Biometric credential removed successfully" 
      });
    } catch (error) {
      console.error("Error removing biometric credential:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to remove biometric credential" 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Try to get a user with ID 0 (which likely doesn't exist)
    // This is just to test the database connection
    await storage.getUser(0);
    return true;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
}

function detectPreferredBiometricType(req: Request): string {
  const userAgent = req.headers["user-agent"] || "";
  
  // Mobile devices likely prefer fingerprint
  if (/Android|iPhone|iPad|iPod/i.test(userAgent)) {
    return "fingerprint";
  }
  
  // Desktop devices likely prefer face (webcam)
  return "face";
}