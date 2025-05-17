import { Request, Response } from 'express';
import { db } from '../db';
import { users, credentials } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { verifyFace } from '../deepface';

// WebAuthn registration options
export async function handleWebAuthnRegisterOptions(req: Request, res: Response) {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Find or create user
    let user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user) {
      // Create a new user if needed
      const [newUser] = await db.insert(users).values({
        username: username,
        email: `${username}@example.com`, // Placeholder
        password: crypto.randomBytes(16).toString('hex'), // Random password
      }).returning();
      
      user = newUser;
    }
    
    if (!user || !user.id) {
      return res.status(400).json({ error: 'Failed to find or create user' });
    }
    
    // Generate challenge
    const challenge = crypto.randomBytes(32);
    
    // Store challenge in session for verification later
    if (!req.session) {
      return res.status(500).json({ error: 'Session not available' });
    }
    
    req.session.challenge = challenge.toString('base64');
    req.session.username = username;
    
    // Create PublicKey credential request options
    const publicKeyCredentialCreationOptions = {
      challenge: challenge.toString('base64'),
      rp: {
        name: 'Heirloom Identity',
        id: req.headers.host
      },
      user: {
        id: Buffer.from(user.id.toString()).toString('base64'),
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Prefer platform authenticator (like Touch ID/Face ID)
        userVerification: 'preferred',
        requireResidentKey: false
      },
      timeout: 60000,
      attestation: 'direct'
    };
    
    return res.json({ publicKey: publicKeyCredentialCreationOptions });
  } catch (error) {
    console.error('Error generating WebAuthn registration options:', error);
    return res.status(500).json({ error: 'Failed to generate registration options' });
  }
}

// WebAuthn registration verification
export async function handleWebAuthnRegisterVerify(req: Request, res: Response) {
  try {
    if (!req.session || !req.session.challenge) {
      return res.status(400).json({ error: 'Registration session expired' });
    }
    
    const expectedChallenge = req.session.challenge;
    const username = req.session.username;
    
    // Get the credential ID and public key from the client
    const { id, rawId, response, type } = req.body;
    
    if (!id || !rawId || !response || !type) {
      return res.status(400).json({ error: 'Missing registration data' });
    }
    
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user || !user.id) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // For simplicity, in a real implementation, you would:
    // 1. Verify the attestation object
    // 2. Extract credential public key and credential ID from attestation
    // 3. Store credential details
    
    // In this simplified implementation, we'll store the credential ID
    await db.insert(credentials).values({
      userId: user.id.toString(),
      credentialId: rawId,
      publicKey: JSON.stringify(response),
      counter: 0,
      transports: null,
      created: new Date()
    });
    
    // Clear the challenge from session
    delete req.session.challenge;
    
    return res.json({ 
      success: true,
      message: 'WebAuthn registration successful',
      userId: user.id
    });
  } catch (error) {
    console.error('Error verifying WebAuthn registration:', error);
    return res.status(500).json({ error: 'Failed to verify registration' });
  }
}

// WebAuthn hybrid registration (WebAuthn + Face recognition)
export async function handleHybridRegistration(req: Request, res: Response) {
  try {
    const { username, faceImage } = req.body;
    
    if (!username || !faceImage) {
      return res.status(400).json({ error: 'Username and face image are required' });
    }
    
    // Find or create user
    let user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user) {
      // Create a new user if needed
      const [newUser] = await db.insert(users).values({
        username: username,
        email: `${username}@example.com`, // Placeholder
        password: crypto.randomBytes(16).toString('hex'), // Random password
      }).returning();
      
      user = newUser;
    }
    
    if (!user || !user.id) {
      return res.status(400).json({ error: 'Failed to find or create user' });
    }
    
    // Register face with DeepFace
    const faceResult = await verifyFace(
      faceImage,
      user.id.toString(),
      true // Save to database if verified
    );
    
    if (!faceResult.success) {
      return res.status(400).json({ 
        error: 'Face verification failed', 
        details: faceResult.message
      });
    }
    
    // Generate credentials for WebAuthn
    const credentialId = crypto.randomBytes(16).toString('base64');
    
    // Store credential
    await db.insert(credentials).values({
      userId: user.id.toString(),
      credentialId: credentialId,
      publicKey: JSON.stringify({ hybrid: true }),
      counter: 0,
      transports: null,
      created: new Date()
    });
    
    return res.json({ 
      success: true,
      message: 'Hybrid registration successful',
      userId: user.id,
      faceId: faceResult.face_id
    });
  } catch (error) {
    console.error('Error during hybrid registration:', error);
    return res.status(500).json({ error: 'Failed to complete hybrid registration' });
  }
}

// WebAuthn authentication options
export async function handleWebAuthnAuthenticateOptions(req: Request, res: Response) {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user || !user.id) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Get user's credentials
    const userCredentials = await db.query.credentials.findMany({
      where: eq(credentials.userId, user.id.toString())
    });
    
    if (userCredentials.length === 0) {
      return res.status(400).json({ error: 'No credentials found for user' });
    }
    
    // Generate challenge
    const challenge = crypto.randomBytes(32);
    
    // Store challenge in session for verification later
    if (!req.session) {
      return res.status(500).json({ error: 'Session not available' });
    }
    
    req.session.challenge = challenge.toString('base64');
    req.session.username = username;
    
    // Create allowCredentials list
    const allowCredentials = userCredentials.map(cred => ({
      type: 'public-key',
      id: cred.credentialId,
      transports: cred.transports || ['internal']
    }));
    
    // Create PublicKey credential request options
    const publicKeyCredentialRequestOptions = {
      challenge: challenge.toString('base64'),
      rpId: req.headers.host,
      allowCredentials,
      timeout: 60000,
      userVerification: 'preferred'
    };
    
    return res.json({ publicKey: publicKeyCredentialRequestOptions });
  } catch (error) {
    console.error('Error generating WebAuthn authentication options:', error);
    return res.status(500).json({ error: 'Failed to generate authentication options' });
  }
}

// WebAuthn authentication verification
export async function handleWebAuthnAuthenticateVerify(req: Request, res: Response) {
  try {
    if (!req.session || !req.session.challenge) {
      return res.status(400).json({ error: 'Authentication session expired' });
    }
    
    const expectedChallenge = req.session.challenge;
    const username = req.session.username;
    
    // Get the credential ID and response from the client
    const { id, rawId, response, type } = req.body;
    
    if (!id || !rawId || !response || !type) {
      return res.status(400).json({ error: 'Missing authentication data' });
    }
    
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user || !user.id) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Find credential
    const credential = await db.query.credentials.findFirst({
      where: eq(credentials.credentialId, rawId)
    });
    
    if (!credential) {
      return res.status(400).json({ error: 'Invalid credential' });
    }
    
    // Verify credential belongs to this user
    if (credential.userId !== user.id.toString()) {
      return res.status(400).json({ error: 'Credential does not belong to this user' });
    }
    
    // For simplicity, in a real implementation, you would:
    // 1. Verify the authenticator data
    // 2. Verify signature using stored public key
    // 3. Update credential counter
    
    // Set authentication in session
    if (req.session) {
      req.session.userId = user.id.toString();
      req.session.isVerified = true;
    }
    
    // Clear the challenge from session
    delete req.session.challenge;
    
    return res.json({ 
      success: true,
      message: 'WebAuthn authentication successful',
      userId: user.id
    });
  } catch (error) {
    console.error('Error verifying WebAuthn authentication:', error);
    return res.status(500).json({ error: 'Failed to verify authentication' });
  }
}

// WebAuthn hybrid authentication verification (WebAuthn + Face recognition)
export async function handleHybridVerify(req: Request, res: Response) {
  try {
    // Extract credential and face image from client
    const { id, rawId, response, type, faceImage } = req.body;
    
    if (!id || !rawId || !response || !type || !faceImage) {
      return res.status(400).json({ error: 'Missing hybrid authentication data' });
    }
    
    // Find credential
    const credential = await db.query.credentials.findFirst({
      where: eq(credentials.credentialId, rawId)
    });
    
    if (!credential) {
      return res.status(400).json({ error: 'Invalid credential' });
    }
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(credential.userId))
    });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Verify face with DeepFace
    const faceResult = await verifyFace(
      faceImage,
      user.id.toString(),
      false // Don't save to database
    );
    
    if (!faceResult.success || !faceResult.matched) {
      return res.status(401).json({ 
        error: 'Face verification failed', 
        details: faceResult.message
      });
    }
    
    // Set authentication in session
    if (req.session) {
      req.session.userId = user.id.toString();
      req.session.isVerified = true;
    }
    
    return res.json({ 
      success: true,
      message: 'Hybrid authentication successful',
      userId: user.id,
      confidence: faceResult.confidence
    });
  } catch (error) {
    console.error('Error during hybrid verification:', error);
    return res.status(500).json({ error: 'Failed to verify hybrid authentication' });
  }
}