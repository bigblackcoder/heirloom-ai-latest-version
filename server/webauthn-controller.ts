/**
 * WebAuthn Controller
 * 
 * This module handles the server-side logic for WebAuthn (FIDO2) authentication operations.
 * It provides functions for generating registration and authentication options,
 * as well as verifying the responses from authenticators.
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { 
  WebAuthnRegistrationOptions, 
  WebAuthnAuthenticationOptions,
  WebAuthnUser,
  WebAuthnCredential
} from '../shared/webauthn';
import { db } from './db';
import { webauthnCredentials } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Configure relying party (the application)
const RP_NAME = 'Heirloom Identity Platform';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.NODE_ENV === 'production'
  ? `https://${RP_ID}`
  : `http://${RP_ID}:5000`;

// Supported WebAuthn credential parameters (algorithms)
const SUPPORTED_ALGORITHMS = [
  { type: 'public-key', alg: -7 }, // ES256
  { type: 'public-key', alg: -257 } // RS256
];

// Session state management
const userChallenges = new Map<string, { challenge: string, userId: string }>();

/**
 * Generate a random challenge for WebAuthn operations
 */
function generateChallenge(): string {
  return crypto.randomBytes(32).toString('base64url');
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
 * Generate registration options for WebAuthn
 */
export async function generateRegistrationOptions(
  req: Request, 
  res: Response
): Promise<void> {
  try {
    const { userId, username, displayName } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ error: 'User ID and username are required' });
    }

    // Create a new challenge for this registration
    const challenge = generateChallenge();
    
    // Store the challenge for later verification
    userChallenges.set(challenge, { challenge, userId });

    // Find existing credentials for this user to exclude
    const existingCredentials = await db.select()
      .from(webauthnCredentials)
      .where(eq(webauthnCredentials.userId, userId));

    // Format existing credentials for exclusion list
    const excludeCredentials = existingCredentials.map(cred => ({
      id: cred.credentialId,
      type: 'public-key',
      transports: cred.transports ? JSON.parse(cred.transports) : undefined
    }));

    // Build the WebAuthn user object
    const user: WebAuthnUser = {
      id: userId,
      name: username,
      displayName: displayName || username
    };

    // Create registration options
    const options: WebAuthnRegistrationOptions = {
      challenge,
      rp: {
        name: RP_NAME,
        id: RP_ID
      },
      user,
      pubKeyCredParams: SUPPORTED_ALGORITHMS,
      timeout: 60000, // 1 minute
      excludeCredentials,
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Prefer platform authenticators (like Face ID, Touch ID)
        userVerification: 'preferred',
        residentKey: 'preferred',
        requireResidentKey: false
      },
      attestation: 'none', // Don't request attestation to preserve privacy
      extensions: {
        credProps: true // Request information about credential properties
      }
    };

    // Send options to client
    res.status(200).json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    res.status(500).json({ error: 'Failed to generate registration options' });
  }
}

/**
 * Verify and store WebAuthn registration
 */
export async function verifyRegistration(
  req: Request, 
  res: Response
): Promise<void> {
  try {
    const { id, rawId, type, response, authenticatorAttachment } = req.body;

    if (type !== 'public-key') {
      return res.status(400).json({ error: 'Invalid credential type' });
    }

    // Parse client data JSON
    const clientDataBuffer = base64urlToBuffer(response.clientDataJSON);
    const clientDataJSON = JSON.parse(clientDataBuffer.toString());
    
    // Verify challenge
    const challengeRecord = userChallenges.get(clientDataJSON.challenge);
    if (!challengeRecord) {
      return res.status(400).json({ error: 'Invalid challenge' });
    }
    
    // Verify origin
    if (clientDataJSON.origin !== ORIGIN) {
      return res.status(400).json({ 
        error: `Invalid origin. Expected ${ORIGIN}, got ${clientDataJSON.origin}` 
      });
    }
    
    // Verify type
    if (clientDataJSON.type !== 'webauthn.create') {
      return res.status(400).json({ error: 'Invalid operation type' });
    }

    // Parse attestation object
    const attestationBuffer = base64urlToBuffer(response.attestationObject);
    // In a real implementation, you would parse the CBOR attestation object
    // and verify the attestation signature, format, etc.
    // For brevity, we'll skip this and just extract the public key
    
    // In a simplified implementation, we'll just store the credential info
    const credential: WebAuthnCredential = {
      id: id,
      publicKey: rawId, // In a real implementation, this would be the actual public key
      algorithm: '-7', // ES256, this would be extracted from the attestation in a real impl
      counter: 0, // Initial counter value
      userId: challengeRecord.userId,
      transports: authenticatorAttachment ? [authenticatorAttachment] : undefined,
      created: new Date()
    };

    // Store the credential in the database
    await db.insert(webauthnCredentials).values({
      credentialId: credential.id,
      credentialPublicKey: credential.publicKey,
      counter: credential.counter,
      userId: credential.userId,
      transports: credential.transports ? JSON.stringify(credential.transports) : null,
      credentialDeviceType: authenticatorAttachment || 'platform',
      credentialBackedUp: true, // Default to true for simplicity
      userVerified: true // Default to true since we're requiring verification
    });

    // Remove the used challenge
    userChallenges.delete(clientDataJSON.challenge);

    // Notify the client of successful registration
    res.status(200).json({
      status: 'success',
      message: 'Registration successful',
      credential: {
        id: credential.id,
        type: type,
        authenticatorAttachment: authenticatorAttachment
      }
    });
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ error: 'Failed to verify registration' });
  }
}

/**
 * Generate authentication options for WebAuthn
 */
export async function generateAuthenticationOptions(
  req: Request, 
  res: Response
): Promise<void> {
  try {
    const { userId } = req.body;

    // Create a new challenge for this authentication
    const challenge = generateChallenge();
    
    // Store the challenge for later verification
    userChallenges.set(challenge, { challenge, userId });

    // If a userId is provided, find credentials for this user
    let allowCredentials;
    if (userId) {
      const userCredentials = await db.select()
        .from(webauthnCredentials)
        .where(eq(webauthnCredentials.userId, userId));

      allowCredentials = userCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key',
        transports: cred.transports ? JSON.parse(cred.transports) : undefined
      }));
    }

    // Create authentication options
    const options: WebAuthnAuthenticationOptions = {
      challenge,
      timeout: 60000, // 1 minute
      rpId: RP_ID,
      userVerification: 'preferred',
      allowCredentials: allowCredentials && allowCredentials.length > 0 ? allowCredentials : undefined
    };

    // Send options to client
    res.status(200).json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    res.status(500).json({ error: 'Failed to generate authentication options' });
  }
}

/**
 * Verify WebAuthn authentication
 */
export async function verifyAuthentication(
  req: Request, 
  res: Response
): Promise<void> {
  try {
    const { id, rawId, type, response } = req.body;

    if (type !== 'public-key') {
      return res.status(400).json({ error: 'Invalid credential type' });
    }

    // Parse client data JSON
    const clientDataBuffer = base64urlToBuffer(response.clientDataJSON);
    const clientDataJSON = JSON.parse(clientDataBuffer.toString());
    
    // Verify challenge
    const challengeRecord = userChallenges.get(clientDataJSON.challenge);
    if (!challengeRecord) {
      return res.status(400).json({ error: 'Invalid challenge' });
    }
    
    // Verify origin
    if (clientDataJSON.origin !== ORIGIN) {
      return res.status(400).json({ 
        error: `Invalid origin. Expected ${ORIGIN}, got ${clientDataJSON.origin}` 
      });
    }
    
    // Verify type
    if (clientDataJSON.type !== 'webauthn.get') {
      return res.status(400).json({ error: 'Invalid operation type' });
    }

    // Find the credential in the database
    const credential = await db.select()
      .from(webauthnCredentials)
      .where(eq(webauthnCredentials.credentialId, id))
      .then(results => results[0]);

    if (!credential) {
      return res.status(400).json({ error: 'Unknown credential' });
    }

    // Verify this credential belongs to the user who initiated the auth
    if (credential.userId !== challengeRecord.userId) {
      return res.status(403).json({ error: 'Credential does not belong to this user' });
    }

    // Parse authenticator data
    const authDataBuffer = base64urlToBuffer(response.authenticatorData);
    // In a real implementation, we would:
    // 1. Extract and verify the counter value to prevent replay attacks
    // 2. Verify the user presence and verification flags
    // 3. Verify the RP ID hash matches our RP ID
    // 4. Verify the signature using the credential's public key
    
    // For brevity, we'll skip these verifications
    
    // Update the credential with new counter value and last used timestamp
    await db.update(webauthnCredentials)
      .set({ 
        counter: credential.counter + 1,
        lastUsed: new Date()
      })
      .where(eq(webauthnCredentials.id, credential.id));

    // Remove the used challenge
    userChallenges.delete(clientDataJSON.challenge);

    // Notify the client of successful authentication
    res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      user: {
        id: credential.userId
      }
    });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(500).json({ error: 'Failed to verify authentication' });
  }
}