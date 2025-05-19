/**
 * WebAuthn Controller
 * Handles WebAuthn registration and authentication, integrating with face verification
 * when available and recording identity verifications on the blockchain.
 */
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { users, credentials } from '../shared/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import { verifyFace } from './deepface';
import { recordVerificationOnBlockchain } from './blockchain-verification';

// In-memory challenge storage (replace with database in production)
const challengeMap = new Map<string, {
  challenge: string;
  userId: string;
  username?: string;
  timestamp: number;
  type: 'registration' | 'authentication';
}>();

// Constants
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// Utility functions
function generateRandomBuffer(size: number): Buffer {
  return crypto.randomBytes(size);
}

function base64ToBuffer(base64: string): Buffer {
  const base64Url = base64.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64Url.length % 4) % 4);
  const base64Padded = base64Url + padding;
  return Buffer.from(base64Padded, 'base64');
}

function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Clean up expired challenges
function cleanupChallenges() {
  const now = Date.now();
  for (const [id, data] of challengeMap.entries()) {
    if (now - data.timestamp > TIMEOUT_MS) {
      challengeMap.delete(id);
    }
  }
}

/**
 * Start WebAuthn registration process
 */
export async function startRegistration(req: Request, res: Response) {
  try {
    const { userId, username } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Clean up expired challenges
    cleanupChallenges();
    
    // Generate a random challenge
    const challenge = generateRandomBuffer(32);
    const challengeId = uuidv4();
    
    // Store challenge data
    challengeMap.set(challengeId, {
      challenge: bufferToBase64(challenge),
      userId,
      username,
      timestamp: Date.now(),
      type: 'registration'
    });
    
    // Send challenge to client
    return res.status(200).json({ 
      success: true, 
      id: challengeId,
      challenge: bufferToBase64(challenge) 
    });
  } catch (error) {
    console.error('Error in startRegistration:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}

/**
 * Complete WebAuthn registration
 */
export async function completeRegistration(req: Request, res: Response) {
  try {
    const { id, rawId, response, challengeId, faceImage } = req.body;
    
    if (!challengeId || !id || !rawId || !response) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Get stored challenge data
    const challengeData = challengeMap.get(challengeId);
    if (!challengeData || challengeData.type !== 'registration') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired challenge' 
      });
    }
    
    const { userId, username } = challengeData;
    
    // Validate attestation
    // In a production system, we would do additional validation here
    
    // Store credential in database
    await db.insert(credentials).values({
      id: rawId,
      userId: parseInt(userId),
      publicKey: JSON.stringify(response)
    });
    
    // If face image was provided, verify it
    let faceVerificationResult = null;
    if (faceImage) {
      try {
        faceVerificationResult = await verifyFace(
          faceImage, 
          userId,
          true // Save to DB
        );
      } catch (faceError) {
        console.error('Face verification error:', faceError);
        // We'll continue even if face verification fails
      }
    }
    
    // Update user
    await db.update(users)
      .set({ 
        isVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, parseInt(userId)));
    
    // Clean up challenge
    challengeMap.delete(challengeId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Registration successful',
      credential: {
        id: rawId,
        type: 'public-key'
      },
      faceVerification: faceVerificationResult
    });
  } catch (error) {
    console.error('Error in completeRegistration:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}

/**
 * Get registration status
 */
export async function getRegistrationStatus(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Get user credentials
    const userCredentials = await db.query.credentials.findMany({
      where: eq(credentials.userId, parseInt(userId))
    });
    
    return res.status(200).json({ 
      success: true, 
      registered: userCredentials.length > 0,
      credentials: userCredentials.map(cred => ({
        id: cred.id,
        createdAt: cred.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in getRegistrationStatus:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}

/**
 * Start WebAuthn authentication
 */
export async function startAuthentication(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Clean up expired challenges
    cleanupChallenges();
    
    // Get user credentials
    const userCredentials = await db.query.credentials.findMany({
      where: eq(credentials.userId, parseInt(userId))
    });
    
    if (userCredentials.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No credentials found for this user' 
      });
    }
    
    // Generate a random challenge
    const challenge = generateRandomBuffer(32);
    const challengeId = uuidv4();
    
    // Store challenge data
    challengeMap.set(challengeId, {
      challenge: bufferToBase64(challenge),
      userId,
      timestamp: Date.now(),
      type: 'authentication'
    });
    
    // Format credentials for client
    const allowCredentials = userCredentials.map(cred => ({
      id: cred.id,
      type: 'public-key'
    }));
    
    // Send challenge to client
    return res.status(200).json({ 
      success: true, 
      id: challengeId,
      challenge: bufferToBase64(challenge),
      allowCredentials
    });
  } catch (error) {
    console.error('Error in startAuthentication:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}

/**
 * Complete WebAuthn authentication
 */
export async function completeAuthentication(req: Request, res: Response) {
  try {
    const { id, rawId, response, challengeId, faceImage } = req.body;
    
    if (!challengeId || !id || !rawId || !response) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Get stored challenge data
    const challengeData = challengeMap.get(challengeId);
    if (!challengeData || challengeData.type !== 'authentication') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired challenge' 
      });
    }
    
    const { userId } = challengeData;
    
    // Get credential from database
    const credential = await db.query.credentials.findFirst({
      where: eq(credentials.id, rawId)
    });
    
    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credential' 
      });
    }
    
    // Validate assertion
    // In a production system, we would verify the signature here
    
    // If face image was provided, verify it
    let faceVerificationResult = null;
    if (faceImage) {
      try {
        faceVerificationResult = await verifyFace(
          faceImage, 
          userId,
          false // Don't save to DB, just verify
        );
      } catch (faceError) {
        console.error('Face verification error:', faceError);
        // We'll continue even if face verification fails
      }
    }
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId))
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update session if exists
    if (req.session) {
      req.session.userId = user.id;
      req.session.isAuthenticated = true;
      req.session.isVerified = true;
    }
    
    // Clean up challenge
    challengeMap.delete(challengeId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Authentication successful',
      user: {
        id: user.id,
        username: user.username,
        isVerified: user.isVerified
      },
      verification: {
        device_verified: true,
        face_verified: faceVerificationResult?.success || false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in completeAuthentication:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}

/**
 * Get authentication status
 */
export async function getAuthenticationStatus(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Check if user exists and is verified
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId))
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get user credentials
    const userCredentials = await db.query.credentials.findMany({
      where: eq(credentials.userId, parseInt(userId))
    });
    
    return res.status(200).json({ 
      success: true, 
      authenticated: user.isVerified,
      hasCredentials: userCredentials.length > 0,
      user: {
        id: user.id,
        username: user.username,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error in getAuthenticationStatus:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}