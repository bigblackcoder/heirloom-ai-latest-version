import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { credentials, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { FaceVerificationResult, verifyFace } from './deepface';

// WebAuthn registered authenticators will be stored in the credentials table

// Helper functions
function generateRandomBuffer(length: number): Buffer {
  return crypto.randomBytes(length);
}

function bufferToBase64URLString(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64URLStringToBuffer(base64URLString: string): Buffer {
  // Add back any missing padding
  const paddedBase64 = base64URLString
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64URLString.length + (4 - (base64URLString.length % 4)) % 4, '=');
  
  return Buffer.from(paddedBase64, 'base64');
}

// Controller functions

/**
 * Generates registration options for WebAuthn
 */
export async function getRegistrationOptions(req: Request, res: Response): Promise<void> {
  try {
    const { userId, username } = req.body;
    
    if (!userId || !username) {
      res.status(400).json({ error: 'User ID and username are required' });
      return;
    }
    
    // Create a challenge
    const challenge = generateRandomBuffer(32);
    
    // Store challenge in session
    if (req.session) {
      req.session.challenge = bufferToBase64URLString(challenge);
      req.session.username = username;
      req.session.userId = userId;
    }
    
    const options = {
      challenge: bufferToBase64URLString(challenge),
      rp: {
        name: 'Heirloom Identity Platform',
        id: req.hostname
      },
      user: {
        id: userId,
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        requireResidentKey: false
      }
    };
    
    res.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    res.status(500).json({ error: 'Failed to generate registration options' });
  }
}

/**
 * Verifies WebAuthn registration
 */
export async function verifyRegistration(req: Request, res: Response): Promise<void> {
  try {
    const { attestationResponse } = req.body;
    
    if (!attestationResponse) {
      res.status(400).json({ error: 'Attestation response is required' });
      return;
    }
    
    if (!req.session?.challenge || !req.session?.userId) {
      res.status(400).json({ error: 'No challenge found in session' });
      return;
    }
    
    // Verify response against challenge stored in session
    const expectedChallenge = req.session.challenge;
    const userId = req.session.userId;
    
    // Extract credential ID and public key from the response
    const credentialId = attestationResponse.id;
    const publicKey = JSON.stringify(attestationResponse.response.publicKey);
    
    // Store credential in database
    await db.insert(credentials).values({
      credentialId,
      userId,
      publicKey,
      metadata: { 
        attestation: attestationResponse.response,
        device: req.headers['user-agent']
      }
    });
    
    // Clear challenge from session
    delete req.session.challenge;
    
    res.json({ 
      success: true,
      message: 'Device biometric registration successful' 
    });
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ error: 'Failed to verify registration' });
  }
}

/**
 * Generates authentication options for WebAuthn
 */
export async function getAuthenticationOptions(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    
    // Retrieve credentials for the user
    const userCredentials = await db
      .select()
      .from(credentials)
      .where(eq(credentials.userId, userId));
    
    if (!userCredentials.length) {
      res.status(404).json({ error: 'No credentials found for this user' });
      return;
    }
    
    // Create a challenge
    const challenge = generateRandomBuffer(32);
    
    // Store challenge in session
    if (req.session) {
      req.session.challenge = bufferToBase64URLString(challenge);
      req.session.userId = userId;
    }
    
    const options = {
      challenge: bufferToBase64URLString(challenge),
      timeout: 60000,
      rpId: req.hostname,
      userVerification: 'required',
      allowCredentials: userCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key'
      }))
    };
    
    res.json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    res.status(500).json({ error: 'Failed to generate authentication options' });
  }
}

/**
 * Verifies WebAuthn authentication
 */
export async function verifyAuthentication(req: Request, res: Response): Promise<void> {
  try {
    const { assertionResponse } = req.body;
    
    if (!assertionResponse) {
      res.status(400).json({ error: 'Assertion response is required' });
      return;
    }
    
    if (!req.session?.challenge || !req.session?.userId) {
      res.status(400).json({ error: 'No challenge found in session' });
      return;
    }
    
    // Verify response against challenge stored in session
    const expectedChallenge = req.session.challenge;
    const userId = req.session.userId;
    
    // Extract credential ID from the response
    const credentialId = assertionResponse.id;
    
    // Find credential in database
    const credential = await db
      .select()
      .from(credentials)
      .where(eq(credentials.credentialId, credentialId))
      .limit(1);
    
    if (!credential[0]) {
      res.status(404).json({ error: 'Credential not found' });
      return;
    }
    
    // Update counter and last used timestamp
    await db
      .update(credentials)
      .set({ 
        counter: credential[0].counter + 1,
        lastUsed: new Date()
      })
      .where(eq(credentials.credentialId, credentialId));
    
    // Clear challenge from session and set authenticated user
    delete req.session.challenge;
    req.session.authenticated = true;
    
    // Find user details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);
    
    res.json({ 
      success: true,
      message: 'Device biometric authentication successful',
      user: user[0] ? {
        id: user[0].id,
        username: user[0].username,
        isVerified: user[0].isVerified
      } : null
    });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(500).json({ error: 'Failed to verify authentication' });
  }
}

/**
 * Hybrid registration process: 
 * 1. Register WebAuthn credential (device biometric)
 * 2. Verify user's face and store face record
 * 3. Link the WebAuthn credential to the face record
 */
export async function hybridRegistration(req: Request, res: Response): Promise<void> {
  try {
    const { attestationResponse, faceImage } = req.body;
    
    if (!attestationResponse || !faceImage) {
      res.status(400).json({ error: 'Attestation response and face image are required' });
      return;
    }
    
    if (!req.session?.challenge || !req.session?.userId) {
      res.status(400).json({ error: 'No challenge found in session' });
      return;
    }
    
    const userId = req.session.userId;
    
    // 1. Process WebAuthn registration
    const credentialId = attestationResponse.id;
    const publicKey = JSON.stringify(attestationResponse.response.publicKey);
    
    // 2. Verify face
    const faceResult: FaceVerificationResult = await verifyFace(
      faceImage,
      userId.toString(),
      true // Save to database
    );
    
    if (!faceResult.success || !faceResult.face_id) {
      res.status(400).json({ 
        error: 'Face verification failed',
        details: faceResult.message
      });
      return;
    }
    
    // 3. Store credential with link to face record
    await db.insert(credentials).values({
      credentialId,
      userId,
      publicKey,
      faceId: faceResult.face_id,
      metadata: { 
        attestation: attestationResponse.response,
        device: req.headers['user-agent'],
        faceVerification: {
          confidence: faceResult.confidence,
          results: faceResult.results
        }
      }
    });
    
    // Clear challenge from session
    delete req.session.challenge;
    
    // 4. Update user verification status
    await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, Number(userId)));
    
    res.json({ 
      success: true,
      message: 'Hybrid biometric registration successful',
      faceDetails: {
        confidence: faceResult.confidence,
        results: faceResult.results
      }
    });
  } catch (error) {
    console.error('Error in hybrid registration:', error);
    res.status(500).json({ error: 'Failed to complete hybrid registration' });
  }
}

/**
 * Hybrid verification process:
 * 1. Verify WebAuthn credential (device biometric)
 * 2. Verify user's face against stored face record
 * 3. Compare results for enhanced security
 */
export async function hybridVerification(req: Request, res: Response): Promise<void> {
  try {
    const { assertionResponse, faceImage } = req.body;
    
    if (!assertionResponse) {
      res.status(400).json({ error: 'Assertion response is required' });
      return;
    }
    
    if (!req.session?.challenge || !req.session?.userId) {
      res.status(400).json({ error: 'No challenge found in session' });
      return;
    }
    
    const userId = req.session.userId;
    const credentialId = assertionResponse.id;
    
    // 1. Find credential in database
    const credential = await db
      .select()
      .from(credentials)
      .where(eq(credentials.credentialId, credentialId))
      .limit(1);
    
    if (!credential[0]) {
      res.status(404).json({ error: 'Credential not found' });
      return;
    }
    
    // 2. Update counter and last used timestamp
    await db
      .update(credentials)
      .set({ 
        counter: credential[0].counter + 1,
        lastUsed: new Date()
      })
      .where(eq(credentials.credentialId, credentialId));
    
    let faceResult: FaceVerificationResult | null = null;
    
    // 3. If face image provided, verify against stored records
    if (faceImage) {
      faceResult = await verifyFace(
        faceImage,
        userId.toString(),
        false // Don't save to database
      );
      
      if (!faceResult.success) {
        res.status(400).json({ 
          error: 'Face verification failed',
          details: faceResult.message
        });
        return;
      }
    }
    
    // Clear challenge from session and set authenticated user
    delete req.session.challenge;
    req.session.authenticated = true;
    
    // Find user details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);
    
    res.json({ 
      success: true,
      message: faceResult 
        ? 'Hybrid biometric verification successful' 
        : 'Device biometric verification successful',
      faceDetails: faceResult ? {
        confidence: faceResult.confidence,
        results: faceResult.results
      } : null,
      user: user[0] ? {
        id: user[0].id,
        username: user[0].username,
        isVerified: user[0].isVerified
      } : null
    });
  } catch (error) {
    console.error('Error in hybrid verification:', error);
    res.status(500).json({ error: 'Failed to complete hybrid verification' });
  }
}