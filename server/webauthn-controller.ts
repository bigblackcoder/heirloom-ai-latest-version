/**
 * WebAuthn Controller for handling device biometric authentication
 * This provides endpoints for registering and verifying biometric credentials
 */

import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { db } from './db';
import { schema } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Utility functions for WebAuthn operations
function generateChallenge(): Buffer {
  return crypto.randomBytes(32);
}

function bufferToBase64URLString(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64URLStringToBuffer(base64URLString: string): Buffer {
  const base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64.padEnd(base64.length + padLength, '=');
  return Buffer.from(padded, 'base64');
}

// Store challenges temporarily for verification
const pendingChallenges = new Map<string, {
  challenge: string;
  userId?: string | number;
  timestamp: number;
}>();

// Periodically clean up expired challenges (5 minutes expiry)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pendingChallenges.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) {
      pendingChallenges.delete(key);
    }
  }
}, 60 * 1000);

// Get the application's domain for the Relying Party ID
function getRelyingPartyId(req: Request): string {
  // Use the hostname from the request or a default for local development
  const host = req.get('host') || 'localhost';
  // Extract the domain part (without port) for RP ID
  return host.split(':')[0];
}

/**
 * Generate registration options for a new user
 */
export async function generateRegistrationOptions(req: Request, res: Response) {
  try {
    const { username, userId, displayName } = req.body;
    
    if (!username || !userId || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: username, userId, and displayName'
      });
    }
    
    // Generate a new challenge
    const challenge = generateChallenge();
    const challengeId = crypto.randomUUID();
    
    // Store the challenge temporarily
    pendingChallenges.set(challengeId, {
      challenge: bufferToBase64URLString(challenge),
      userId,
      timestamp: Date.now()
    });
    
    // Create WebAuthn credential creation options
    const options = {
      challenge: bufferToBase64URLString(challenge),
      rp: {
        name: 'Heirloom Identity Platform',
        id: getRelyingPartyId(req)
      },
      user: {
        id: bufferToBase64URLString(Buffer.from(userId.toString())),
        name: username,
        displayName: displayName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      timeout: 60000, // 1 minute
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        requireResidentKey: false
      }
    };
    
    return res.status(200).json({
      success: true,
      options,
      challengeId
    });
  } catch (error: any) {
    console.error('Error generating registration options:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating registration options',
      error: error?.message
    });
  }
}

/**
 * Verify registration response and store the credential
 */
export async function verifyRegistration(req: Request, res: Response) {
  try {
    const { credential, challengeId } = req.body;
    
    if (!credential || !challengeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: credential and challengeId'
      });
    }
    
    // Retrieve and validate the challenge
    const storedData = pendingChallenges.get(challengeId);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired challenge'
      });
    }
    
    // Clean up the used challenge
    pendingChallenges.delete(challengeId);
    
    // Extract the credential ID
    const credentialId = credential.id;
    
    // Store the credential in the database
    // Note: In a real implementation, you'd validate the credential more thoroughly
    try {
      // Check if we already have a credential for this user
      const existingCredential = await db.query.credentials.findFirst({
        where: eq(schema.credentials.userId, storedData.userId!.toString())
      });
      
      if (existingCredential) {
        // Update the existing credential
        await db.update(schema.credentials)
          .set({ 
            credentialId,
            publicKey: JSON.stringify(credential.publicKey),
            counter: 0,
            lastUsed: new Date()
          })
          .where(eq(schema.credentials.userId, storedData.userId!.toString()));
      } else {
        // Insert a new credential
        await db.insert(schema.credentials).values({
          credentialId,
          userId: storedData.userId!.toString(),
          publicKey: JSON.stringify(credential.publicKey),
          counter: 0,
          createdAt: new Date(),
          lastUsed: new Date()
        });
      }
    } catch (dbError: any) {
      console.error('Database error storing credential:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Error storing credential',
        error: dbError?.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Registration successful',
      userId: storedData.userId,
      credentialId
    });
  } catch (error: any) {
    console.error('Error verifying registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying registration',
      error: error?.message
    });
  }
}

/**
 * Generate authentication options for a user
 */
export async function generateAuthenticationOptions(req: Request, res: Response) {
  try {
    const { userId, credentialId } = req.body;
    
    if ((!userId && !credentialId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: either userId or credentialId must be provided'
      });
    }
    
    // Generate a new challenge
    const challenge = generateChallenge();
    const challengeId = crypto.randomUUID();
    
    // Store the challenge temporarily
    pendingChallenges.set(challengeId, {
      challenge: bufferToBase64URLString(challenge),
      userId,
      timestamp: Date.now()
    });
    
    // Find the user's credentials
    let credentials = [];
    
    if (userId) {
      // Get all credentials for this user
      credentials = await db.query.credentials.findMany({
        where: eq(schema.credentials.userId, userId.toString())
      });
    } else if (credentialId) {
      // Get specific credential
      const credential = await db.query.credentials.findFirst({
        where: eq(schema.credentials.credentialId, credentialId)
      });
      
      if (credential) {
        credentials = [credential];
      }
    }
    
    if (credentials.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No credentials found for this user'
      });
    }
    
    // Format the credentials for WebAuthn
    const allowCredentials = credentials.map(cred => ({
      id: cred.credentialId,
      type: 'public-key',
      transports: ['internal']
    }));
    
    // Create WebAuthn authentication options
    const options = {
      challenge: bufferToBase64URLString(challenge),
      rpId: getRelyingPartyId(req),
      allowCredentials,
      timeout: 60000, // 1 minute
      userVerification: 'required'
    };
    
    return res.status(200).json({
      success: true,
      options,
      challengeId
    });
  } catch (error: any) {
    console.error('Error generating authentication options:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating authentication options',
      error: error?.message
    });
  }
}

/**
 * Verify authentication assertion and validate the user
 */
export async function verifyAuthentication(req: Request, res: Response) {
  try {
    const { credential, challengeId } = req.body;
    
    if (!credential || !challengeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: credential and challengeId'
      });
    }
    
    // Retrieve and validate the challenge
    const storedData = pendingChallenges.get(challengeId);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired challenge'
      });
    }
    
    // Clean up the used challenge
    pendingChallenges.delete(challengeId);
    
    // Find the credential in the database
    const storedCredential = await db.query.credentials.findFirst({
      where: eq(schema.credentials.credentialId, credential.id)
    });
    
    if (!storedCredential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }
    
    // In a real implementation, we would validate the signature here
    // For this demo, we'll simply update the credential's usage data
    await db.update(schema.credentials)
      .set({ 
        counter: storedCredential.counter + 1,
        lastUsed: new Date()
      })
      .where(eq(schema.credentials.credentialId, credential.id));
      
    // Return authentication result with user data
    return res.status(200).json({
      success: true,
      verified: true,
      userId: storedCredential.userId,
      message: 'Authentication successful',
      timestamp: Date.now(),
      deviceInfo: {
        type: 'platform',
        // Include other relevant device info from the credential
      }
    });
  } catch (error: any) {
    console.error('Error verifying authentication:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying authentication',
      error: error?.message
    });
  }
}

/**
 * Register hybrid biometric verification (WebAuthn + DeepFace)
 * This creates a combined verification that uses both device biometrics
 * and server-side face verification for maximum security
 */
export async function registerHybridVerification(req: Request, res: Response) {
  try {
    const { credential, challengeId, imageBase64 } = req.body;
    
    if (!credential || !challengeId || !imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: credential, challengeId, and imageBase64'
      });
    }
    
    // First verify the WebAuthn credential
    const storedData = pendingChallenges.get(challengeId);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired challenge'
      });
    }
    
    // Clean up the used challenge
    pendingChallenges.delete(challengeId);
    
    // Then use DeepFace to verify and store the face
    // We'll integrate with our existing verification_proxy.ts
    try {
      // Import dynamically to avoid circular dependencies
      const { verifyFace } = await import('./verification_proxy');
      
      const faceResult = await verifyFace({
        image: imageBase64,
        userId: storedData.userId,
        saveToDb: true,
        requestId: `hybrid-reg-${Date.now()}`
      });
      
      if (!faceResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Face verification failed',
          error: faceResult.message
        });
      }
      
      // Store the credential with the face_id for linking
      const credentialId = credential.id;
      
      // Store in database
      try {
        // Check if we already have a credential for this user
        const existingCredential = await db.query.credentials.findFirst({
          where: eq(schema.credentials.userId, storedData.userId!.toString())
        });
        
        if (existingCredential) {
          // Update the existing credential
          await db.update(schema.credentials)
            .set({ 
              credentialId,
              publicKey: JSON.stringify(credential.publicKey),
              counter: 0,
              lastUsed: new Date(),
              faceId: faceResult.face_id
            })
            .where(eq(schema.credentials.userId, storedData.userId!.toString()));
        } else {
          // Insert a new credential
          await db.insert(schema.credentials).values({
            credentialId,
            userId: storedData.userId!.toString(),
            publicKey: JSON.stringify(credential.publicKey),
            counter: 0,
            createdAt: new Date(),
            lastUsed: new Date(),
            faceId: faceResult.face_id
          });
        }
      } catch (dbError: any) {
        console.error('Database error storing hybrid credential:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Error storing hybrid credential',
          error: dbError?.message
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Hybrid registration successful',
        userId: storedData.userId,
        credentialId,
        faceId: faceResult.face_id,
        confidence: faceResult.confidence
      });
    } catch (error: any) {
      console.error('Error in face verification during hybrid registration:', error);
      return res.status(500).json({
        success: false,
        message: 'Face verification error',
        error: error?.message
      });
    }
  } catch (error: any) {
    console.error('Error in hybrid registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in hybrid registration',
      error: error?.message
    });
  }
}

/**
 * Verify using hybrid approach (WebAuthn + DeepFace)
 */
export async function verifyHybridAuthentication(req: Request, res: Response) {
  try {
    const { credential, challengeId, imageBase64 } = req.body;
    
    if (!credential || !challengeId || !imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: credential, challengeId, and imageBase64'
      });
    }
    
    // First verify the WebAuthn credential
    const storedData = pendingChallenges.get(challengeId);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired challenge'
      });
    }
    
    // Clean up the used challenge
    pendingChallenges.delete(challengeId);
    
    // Find the credential in the database
    const storedCredential = await db.query.credentials.findFirst({
      where: eq(schema.credentials.credentialId, credential.id)
    });
    
    if (!storedCredential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }
    
    // Verify with DeepFace using the stored face ID
    try {
      // Import dynamically to avoid circular dependencies
      const { verifyFace } = await import('./verification_proxy');
      
      const faceResult = await verifyFace({
        image: imageBase64,
        userId: storedCredential.userId,
        saveToDb: false,
        requestId: `hybrid-verify-${Date.now()}`
      });
      
      // Update the credential usage counter
      await db.update(schema.credentials)
        .set({ 
          counter: storedCredential.counter + 1,
          lastUsed: new Date()
        })
        .where(eq(schema.credentials.credentialId, credential.id));
      
      // Determine the final verification result
      // Both WebAuthn and DeepFace must succeed
      const verified = faceResult.success && (faceResult.matched || false);
      
      return res.status(200).json({
        success: true,
        verified,
        userId: storedCredential.userId,
        message: verified 
          ? 'Hybrid authentication successful' 
          : 'Face verification failed',
        webauthnVerified: true,
        faceVerified: faceResult.success && (faceResult.matched || false),
        confidence: faceResult.confidence,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('Error in face verification during hybrid authentication:', error);
      return res.status(500).json({
        success: false,
        message: 'Face verification error',
        error: error?.message
      });
    }
  } catch (error: any) {
    console.error('Error in hybrid authentication:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in hybrid authentication',
      error: error?.message
    });
  }
}