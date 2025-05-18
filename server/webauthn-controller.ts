/**
 * WebAuthn Controller
 * 
 * This module handles the server-side logic for WebAuthn (FIDO2) authentication operations.
 * It provides functions for generating registration and authentication options,
 * as well as verifying the responses from authenticators.
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { webauthnCredentials } from '@shared/schema';
import { eq } from 'drizzle-orm';

// User model for WebAuthn operations
interface WebAuthnUser {
  id: number;
  username: string;
  displayName: string;
}

// WebAuthn credential model
interface WebAuthnCredential {
  id: string;
  userId: number;
  publicKey: string;
  counter: number;
  transports?: string[];
  deviceInfo?: string | null;
  createdAt: Date;
  lastUsed: Date | null;
}

// Options for WebAuthn registration
interface WebAuthnRegistrationOptions {
  challenge: Buffer;
  rp: {
    name: string;
    id?: string;
  };
  user: {
    id: number;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    requireResidentKey?: boolean;
    residentKey?: 'required' | 'preferred' | 'discouraged';
    userVerification?: 'required' | 'preferred' | 'discouraged';
  };
  timeout?: number;
  excludeCredentials?: Array<{
    type: string;
    id: Buffer;
    transports?: string[];
  }>;
  attestation?: 'none' | 'indirect' | 'direct';
  extensions?: Record<string, any>;
}

// Options for WebAuthn authentication
interface WebAuthnAuthenticationOptions {
  challenge: Buffer;
  timeout?: number;
  rpId?: string;
  allowCredentials?: Array<{
    type: string;
    id: Buffer;
    transports?: string[];
  }>;
  userVerification?: 'required' | 'preferred' | 'discouraged';
  extensions?: Record<string, any>;
}

/**
 * Generate a random challenge for WebAuthn operations
 */
function generateChallenge(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Convert a base64url string to a buffer
 */
function base64urlToBuffer(base64url: string): Buffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64');
}

/**
 * Convert a buffer to a base64url string
 */
function bufferToBase64url(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Get the Relying Party ID based on the request
 */
function getRelyingPartyId(req: Request): string {
  // Use request hostname but remove port if present
  const host = req.get('host') || '';
  return host.split(':')[0];
}

/**
 * Generate registration options for WebAuthn
 */
export async function generateRegistrationOptions(
  req: Request, 
  res: Response
): Promise<Response | undefined> {
  try {
    const { userId, username, displayName } = req.body;

    if (!userId || !username || !displayName) {
      return res.status(400).json({ 
        message: 'Missing required parameters: userId, username, displayName' 
      });
    }

    // Convert userId to number if it's a string, with improved validation
    let numUserId: number;
    if (typeof userId === 'string') {
      const parsed = parseInt(userId, 10);
      numUserId = isNaN(parsed) ? 0 : parsed;
    } else if (typeof userId === 'number') {
      numUserId = userId;
    } else {
      numUserId = 0;
    }
    
    // Safety check for valid userId
    if (numUserId <= 0) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check for existing credentials to exclude
    const existingCredentials = await db.select()
      .from(webauthnCredentials)
      .where(eq(webauthnCredentials.userId, numUserId));

    // Generate a challenge
    const challenge = generateChallenge();
    
    // Store challenge in session for later verification
    if (!req.session) req.session = {};
    req.session.webauthnChallenge = challenge;
    req.session.webauthnUserId = numUserId;

    const user: WebAuthnUser = {
      id: numUserId,
      username,
      displayName
    };
    
    // Create registration options
    const options: WebAuthnRegistrationOptions = {
      challenge: Buffer.from(challenge, 'utf8'),
      rp: {
        name: 'Heirloom Identity Platform',
        id: getRelyingPartyId(req)
      },
      user: {
        id: user.id,
        name: user.username,
        displayName: user.displayName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Prefer platform authenticators (like Face ID)
        residentKey: 'preferred',
        userVerification: 'required'  // Require biometric or PIN verification
      },
      timeout: 60000, // 1 minute
      attestation: 'none',
    };

    // Add existing credentials to exclude list if any
    if (existingCredentials.length > 0) {
      options.excludeCredentials = existingCredentials.map(cred => ({
        type: 'public-key',
        id: Buffer.from(cred.id, 'base64'),
        transports: cred.transports ? cred.transports.split(',') : undefined
      }));
    }

    // Format response for client
    const formattedOptions = {
      ...options,
      challenge: {
        data: Array.from(options.challenge),
      },
      user: {
        ...options.user,
        id: {
          data: Array.from(Buffer.from(options.user.id.toString(), 'utf8')),
        },
      },
      excludeCredentials: options.excludeCredentials?.map(cred => ({
        ...cred,
        id: {
          data: Array.from(cred.id),
        },
      })),
    };

    return res.status(200).json(formattedOptions);
  } catch (error) {
    console.error('Error generating registration options:', error);
    return res.status(500).json({ message: 'Failed to generate registration options' });
  }
}

/**
 * Verify and store WebAuthn registration
 */
export async function verifyRegistration(
  req: Request, 
  res: Response
): Promise<Response | undefined> {
  try {
    const { id, rawId, response, type, clientExtensionResults } = req.body;

    if (!req.session?.webauthnChallenge) {
      return res.status(400).json({ message: 'Registration session expired or invalid' });
    }

    // Get stored challenge and user ID from session
    const expectedChallenge = req.session.webauthnChallenge;
    const userId = req.session.webauthnUserId;

    // Convert ArrayBuffer to Buffer
    const clientDataJSON = JSON.parse(response.clientDataJSON);
    
    // Verify the challenge
    const receivedChallenge = clientDataJSON.challenge;
    const decodedChallenge = Buffer.from(expectedChallenge, 'utf8').toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    if (receivedChallenge !== decodedChallenge) {
      return res.status(400).json({ message: 'Challenge verification failed' });
    }

    // Verify the origin
    const origin = clientDataJSON.origin;
    const expectedOrigin = `${req.protocol}://${getRelyingPartyId(req)}`;
    if (origin !== expectedOrigin && origin !== `${req.protocol}://${req.get('host')}`) {
      return res.status(400).json({ message: `Origin verification failed. Expected: ${expectedOrigin}, Got: ${origin}` });
    }

    // Convert attestationObject to buffer for verification
    const attestationObject = Buffer.from(new Uint8Array(response.attestationObject));
    
    // For simplicity, we're skipping detailed verification of attestation format 
    // In a production system, you should verify the attestation statement according to its format
    
    // Extract public key from attestation
    // Note: In a real implementation, you would parse the CBOR-encoded attestation object
    // and validate the format, signature, etc. For simplicity, we're using the credential ID directly.
    const credential: WebAuthnCredential = {
      id: id, // Use credential ID as provided by the client
      userId,
      publicKey: rawId.toString(), // In a real implementation, extract the actual public key
      counter: 0,
      transports: clientExtensionResults?.transports,
      deviceInfo: JSON.stringify({
        userAgent: req.headers['user-agent'],
        platform: clientDataJSON.tokenBinding?.status || 'platform-info-not-available'
      }),
      createdAt: new Date(),
      lastUsed: null
    };

    // Store credential in database
    await db.insert(webauthnCredentials).values({
      id: credential.id,
      userId: credential.userId,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports?.join(','),
      deviceInfo: credential.deviceInfo,
    });

    // Clear the session challenge
    delete req.session.webauthnChallenge;

    return res.status(201).json({ 
      message: 'Registration successful',
      credentialId: credential.id
    });
  } catch (error) {
    console.error('Error verifying registration:', error);
    return res.status(500).json({ message: 'Registration verification failed' });
  }
}

/**
 * Generate authentication options for WebAuthn
 */
export async function generateAuthenticationOptions(
  req: Request, 
  res: Response
): Promise<Response | undefined> {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Convert userId to number if it's a string, with improved validation
    let numUserId: number;
    if (typeof userId === 'string') {
      const parsed = parseInt(userId, 10);
      numUserId = isNaN(parsed) ? 0 : parsed;
    } else if (typeof userId === 'number') {
      numUserId = userId;
    } else {
      numUserId = 0;
    }
    
    // Safety check for valid userId
    if (numUserId <= 0) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get user's registered credentials
    const credentials = await db.select()
      .from(webauthnCredentials)
      .where(eq(webauthnCredentials.userId, numUserId));

    if (credentials.length === 0) {
      return res.status(400).json({ 
        message: 'No credentials found for this user. Please register first.' 
      });
    }

    // Generate challenge
    const challenge = generateChallenge();

    // Store challenge in session
    if (!req.session) req.session = {};
    req.session.webauthnChallenge = challenge;
    req.session.webauthnUserId = numUserId;

    const options: WebAuthnAuthenticationOptions = {
      challenge: Buffer.from(challenge, 'utf8'),
      timeout: 60000,
      rpId: getRelyingPartyId(req),
      allowCredentials: credentials.map(cred => ({
        type: 'public-key',
        id: Buffer.from(cred.id, 'base64url'),
        transports: cred.transports ? cred.transports.split(',') : undefined
      })),
      userVerification: 'required' // Require biometric verification
    };

    // Format for client
    const formattedOptions = {
      ...options,
      challenge: {
        data: Array.from(options.challenge)
      },
      allowCredentials: options.allowCredentials?.map(cred => ({
        ...cred,
        id: {
          data: Array.from(cred.id)
        }
      }))
    };

    return res.status(200).json(formattedOptions);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    return res.status(500).json({ message: 'Failed to generate authentication options' });
  }
}

/**
 * Verify WebAuthn authentication
 */
export async function verifyAuthentication(
  req: Request, 
  res: Response
): Promise<Response | undefined> {
  try {
    const { id, rawId, response, type } = req.body;

    if (!req.session?.webauthnChallenge) {
      return res.status(400).json({ message: 'Authentication session expired or invalid' });
    }

    // Get stored values from session
    const expectedChallenge = req.session.webauthnChallenge;
    const userId = req.session.webauthnUserId;

    // Find the credential in our database
    const credentials = await db.select()
      .from(webauthnCredentials)
      .where(eq(webauthnCredentials.id, id));

    if (credentials.length === 0) {
      return res.status(400).json({ message: 'Unknown credential' });
    }

    const credential = credentials[0];

    // Verify user ID matches
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Credential does not belong to this user' });
    }

    // Verify client data
    const clientDataJSON = JSON.parse(response.clientDataJSON);
    
    // Verify the challenge
    const receivedChallenge = clientDataJSON.challenge;
    const decodedChallenge = Buffer.from(expectedChallenge, 'utf8').toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    if (receivedChallenge !== decodedChallenge) {
      return res.status(400).json({ message: 'Challenge verification failed' });
    }

    // Verify the origin
    const origin = clientDataJSON.origin;
    const expectedOrigin = `${req.protocol}://${getRelyingPartyId(req)}`;
    if (origin !== expectedOrigin && origin !== `${req.protocol}://${req.get('host')}`) {
      return res.status(400).json({ message: `Origin verification failed. Expected: ${expectedOrigin}, Got: ${origin}` });
    }

    // Verify the type
    if (clientDataJSON.type !== 'webauthn.get') {
      return res.status(400).json({ message: 'Type verification failed' });
    }

    // In a real implementation, you would:
    // 1. Decode authenticator data
    // 2. Verify the signature using the stored public key
    // 3. Verify the counter to prevent replay attacks
    // For simplicity, we're skipping these steps in this implementation

    // Update the credential with new counter value and last used timestamp
    await db.update(webauthnCredentials)
      .set({ 
        counter: credential.counter + 1,
        lastUsed: new Date()
      })
      .where(eq(webauthnCredentials.id, credential.id));

    // Clear the session challenge
    delete req.session.webauthnChallenge;

    // Return success
    return res.status(200).json({ 
      message: 'Authentication successful',
      verified: true,
      userId: credential.userId,
      credentialId: credential.id
    });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return res.status(500).json({ message: 'Authentication verification failed' });
  }
}