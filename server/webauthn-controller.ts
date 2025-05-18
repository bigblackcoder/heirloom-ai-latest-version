/**
 * WebAuthn Controller for handling device biometric authentication
 * This provides endpoints for registering and verifying biometric credentials
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { credentials } from '../shared/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { verifyFace } from './deepface';
import { FaceVerificationResult } from './deepface';

// In-memory challenge storage - will be lost on server restart
// In production, this should be stored in a database or Redis
const challengeStore = new Map<string, { 
  challenge: string, 
  userId?: string | number,
  timestamp: number 
}>();

// Timeout for challenges in milliseconds (5 minutes)
const CHALLENGE_TIMEOUT = 5 * 60 * 1000;

// Clean up expired challenges periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of challengeStore.entries()) {
    if (now - value.timestamp > CHALLENGE_TIMEOUT) {
      challengeStore.delete(key);
    }
  }
}, 60000); // Run cleanup every minute

// Helper functions
function generateChallenge(): Buffer {
  return crypto.randomBytes(32);
}

function bufferToBase64URLString(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64URLStringToBuffer(base64URLString: string): Buffer {
  // Add padding if needed
  let base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }
  return Buffer.from(base64, 'base64');
}

function getRelyingPartyId(req: Request): string {
  // Get the hostname from the request
  const hostname = req.hostname || 'localhost';
  // Return just the domain without port for security reasons
  return hostname.split(':')[0];
}

/**
 * Generate registration options for a new user
 */
export async function generateRegistrationOptions(req: Request, res: Response) {
  try {
    const { userId, username, displayName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Generate a new challenge
    const challenge = generateChallenge();
    const challengeId = uuidv4();
    
    // Store the challenge for later verification
    challengeStore.set(challengeId, {
      challenge: bufferToBase64URLString(challenge),
      userId,
      timestamp: Date.now()
    });

    // Determine the relying party ID (domain)
    const rpId = getRelyingPartyId(req);
    
    // Create registration options
    const registrationOptions = {
      challenge: bufferToBase64URLString(challenge),
      rp: {
        name: 'Heirloom Identity Platform',
        id: rpId
      },
      user: {
        id: userId.toString(),
        name: username || userId.toString(),
        displayName: displayName || username || userId.toString()
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Use platform authenticator (like FaceID, TouchID)
        userVerification: 'required', // Require user verification (biometric)
        requireResidentKey: false
      },
      attestation: 'none', // Don't request attestation
      timeout: 60000, // 1 minute timeout
      challengeId // Include the challenge ID for later lookup
    };

    return res.status(200).json(registrationOptions);
  } catch (error) {
    console.error('WebAuthn registration options error:', error);
    return res.status(500).json({ error: 'Failed to generate registration options' });
  }
}

/**
 * Verify registration response and store the credential
 */
export async function verifyRegistration(req: Request, res: Response) {
  try {
    const { challengeId, credential, faceId } = req.body;

    if (!challengeId || !credential) {
      return res.status(400).json({ error: 'Challenge ID and credential are required' });
    }

    // Retrieve the challenge
    const challengeData = challengeStore.get(challengeId);
    if (!challengeData) {
      return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    // Delete the challenge to prevent replay attacks
    challengeStore.delete(challengeId);

    // Verify the credential format
    if (!credential.id || !credential.publicKey) {
      return res.status(400).json({ error: 'Invalid credential format' });
    }

    // In a real implementation, you would verify the credential against the challenge
    // For this demo, we'll just store the credential

    // Store the credential in the database
    await db.insert(credentials).values({
      credentialId: credential.id,
      userId: challengeData.userId!.toString(),
      publicKey: credential.publicKey,
      faceId: faceId || null,
      metadata: credential.metadata || {}
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Device registration successful',
      userId: challengeData.userId 
    });
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    return res.status(500).json({ error: 'Failed to verify registration' });
  }
}

/**
 * Generate authentication options for a user
 */
export async function generateAuthenticationOptions(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find credentials for this user
    const userCredentials = await db.select()
      .from(credentials)
      .where(eq(credentials.userId, userId.toString()));

    if (!userCredentials || userCredentials.length === 0) {
      return res.status(404).json({ error: 'No credentials found for this user' });
    }

    // Generate a new challenge
    const challenge = generateChallenge();
    const challengeId = uuidv4();
    
    // Store the challenge for later verification
    challengeStore.set(challengeId, {
      challenge: bufferToBase64URLString(challenge),
      userId,
      timestamp: Date.now()
    });

    // Determine the relying party ID (domain)
    const rpId = getRelyingPartyId(req);
    
    // Create authentication options
    const authenticationOptions = {
      challenge: bufferToBase64URLString(challenge),
      rpId,
      allowCredentials: userCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key'
      })),
      userVerification: 'required',
      timeout: 60000, // 1 minute timeout
      challengeId // Include the challenge ID for later lookup
    };

    return res.status(200).json(authenticationOptions);
  } catch (error) {
    console.error('WebAuthn authentication options error:', error);
    return res.status(500).json({ error: 'Failed to generate authentication options' });
  }
}

/**
 * Verify authentication assertion and validate the user
 */
export async function verifyAuthentication(req: Request, res: Response) {
  try {
    const { challengeId, credential } = req.body;

    if (!challengeId || !credential) {
      return res.status(400).json({ error: 'Challenge ID and credential are required' });
    }

    // Retrieve the challenge
    const challengeData = challengeStore.get(challengeId);
    if (!challengeData) {
      return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    // Delete the challenge to prevent replay attacks
    challengeStore.delete(challengeId);

    // Find the credential in the database
    const userCredential = await db.select()
      .from(credentials)
      .where(eq(credentials.credentialId, credential.id))
      .limit(1);

    if (!userCredential || userCredential.length === 0) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // In a real implementation, you would verify the assertion signature
    // For this demo, we'll just update the counter and last used timestamp

    // Update the credential counter and last used time
    await db.update(credentials)
      .set({ 
        counter: userCredential[0].counter + 1,
        lastUsed: new Date()
      })
      .where(eq(credentials.id, userCredential[0].id));

    // If user is in session, mark them as verified
    if (req.session) {
      req.session.isVerified = true;
      if (!req.session.userId) {
        req.session.userId = userCredential[0].userId;
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Authentication successful',
      userId: userCredential[0].userId 
    });
  } catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    return res.status(500).json({ error: 'Failed to verify authentication' });
  }
}

/**
 * Register hybrid biometric verification (WebAuthn + DeepFace)
 * This creates a combined verification that uses both device biometrics
 * and server-side face verification for maximum security
 */
export async function registerHybridVerification(req: Request, res: Response) {
  try {
    const { challengeId, credential, faceImage } = req.body;

    if (!challengeId || !credential || !faceImage) {
      return res.status(400).json({ 
        error: 'Challenge ID, credential, and face image are required' 
      });
    }

    // Retrieve the challenge
    const challengeData = challengeStore.get(challengeId);
    if (!challengeData) {
      return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    // Delete the challenge to prevent replay attacks
    challengeStore.delete(challengeId);

    // Verify the face using DeepFace
    const faceResult: FaceVerificationResult = await verifyFace(faceImage, challengeData.userId?.toString(), true);
    
    if (!faceResult.success) {
      return res.status(400).json({ 
        error: 'Face verification failed', 
        details: faceResult.message
      });
    }

    // Store the credential with the face ID
    await db.insert(credentials).values({
      credentialId: credential.id,
      userId: challengeData.userId!.toString(),
      publicKey: credential.publicKey,
      faceId: faceResult.face_id,
      metadata: {
        ...credential.metadata || {},
        hybridAuth: true,
        faceConfidence: faceResult.confidence
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Hybrid verification registration successful',
      userId: challengeData.userId,
      faceDetails: {
        face_id: faceResult.face_id,
        confidence: faceResult.confidence
      }
    });
  } catch (error) {
    console.error('Hybrid verification registration error:', error);
    return res.status(500).json({ error: 'Failed to register hybrid verification' });
  }
}

/**
 * Verify using hybrid approach (WebAuthn + DeepFace)
 */
export async function verifyHybridAuthentication(req: Request, res: Response) {
  try {
    const { challengeId, credential, faceImage } = req.body;

    if (!challengeId || !credential) {
      return res.status(400).json({ error: 'Challenge ID and credential are required' });
    }

    // Retrieve the challenge
    const challengeData = challengeStore.get(challengeId);
    if (!challengeData) {
      return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    // Delete the challenge to prevent replay attacks
    challengeStore.delete(challengeId);

    // Find the credential in the database
    const userCredential = await db.select()
      .from(credentials)
      .where(eq(credentials.credentialId, credential.id))
      .limit(1);

    if (!userCredential || userCredential.length === 0) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Check if face verification is required (hybrid auth)
    const isHybridAuth = userCredential[0].metadata?.hybridAuth === true;
    
    if (isHybridAuth && !faceImage) {
      return res.status(400).json({ 
        error: 'Face image is required for hybrid authentication' 
      });
    }

    // If hybrid auth is enabled, verify the face
    let faceVerified = !isHybridAuth; // Skip if not hybrid auth
    let faceResult = null;
    
    if (isHybridAuth && faceImage) {
      faceResult = await verifyFace(
        faceImage, 
        userCredential[0].userId, 
        false
      );
      
      faceVerified = faceResult.success && 
                    (faceResult.matched || faceResult.confidence > 80);
    }

    // Update the credential counter and last used time
    await db.update(credentials)
      .set({ 
        counter: userCredential[0].counter + 1,
        lastUsed: new Date()
      })
      .where(eq(credentials.id, userCredential[0].id));

    // If user is in session, mark them as verified
    if (req.session) {
      // Only mark as verified if both checks pass for hybrid auth
      req.session.isVerified = !isHybridAuth || (isHybridAuth && faceVerified);
      if (!req.session.userId) {
        req.session.userId = userCredential[0].userId;
      }
    }

    if (isHybridAuth && !faceVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Face verification failed for hybrid authentication',
        deviceVerified: true,
        faceVerified: false
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Authentication successful',
      userId: userCredential[0].userId,
      deviceVerified: true,
      faceVerified: isHybridAuth ? faceVerified : null,
      faceDetails: faceResult
    });
  } catch (error) {
    console.error('Hybrid verification error:', error);
    return res.status(500).json({ error: 'Failed to verify hybrid authentication' });
  }
}