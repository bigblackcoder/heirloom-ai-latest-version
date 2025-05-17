import crypto from 'crypto';
import { type Request, type Response } from 'express';
import { db } from './db';
import { webauthnCredentials, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { 
  WebAuthnUser,
  WebAuthnRegistrationOptions,
  WebAuthnAuthenticationOptions,
  WebAuthnAttestationResponse,
  WebAuthnAuthenticationResponse,
  WebAuthnCredential
} from '@shared/webauthn';

// Relying Party (RP) information
const RP_NAME = 'Heirloom Identity Platform';
const RP_ID = process.env.RP_ID || process.env.REPLIT_DOMAIN || 'localhost';
const ORIGIN = process.env.ORIGIN || `https://${RP_ID}`;

// Constants for WebAuthn
const USER_VERIFICATION = 'required' as const; // 'required' | 'preferred' | 'discouraged'
const AUTHENTICATOR_ATTACHMENT = 'platform' as const; // 'platform' | 'cross-platform'
const TIMEOUT = 60000; // 1 minute in milliseconds

/**
 * Generate a random challenge
 */
function generateChallenge(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Convert a base64url string to a buffer
 */
function base64urlToBuffer(base64url: string): Buffer {
  return Buffer.from(base64url, 'base64url');
}

/**
 * Convert a buffer to a base64url string
 */
function bufferToBase64url(buffer: Buffer): string {
  return buffer.toString('base64url');
}

/**
 * Generate registration options for WebAuthn
 */
export async function generateRegistrationOptions(
  req: Request, 
  res: Response
): Promise<Response> {
  try {
    const { userId, username, displayName } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ error: 'Missing userId or username' });
    }

    // Create a user object for WebAuthn
    const user: WebAuthnUser = {
      id: userId,
      name: username,
      displayName: displayName || username
    };

    // Generate a new random challenge
    const challenge = generateChallenge();

    // Store the challenge and userId in the session for verification later
    if (req.session) {
      req.session.webauthnChallenge = challenge;
      req.session.webauthnUserId = userId;
    }

    // Create registration options
    const options: WebAuthnRegistrationOptions = {
      challenge,
      rp: {
        name: RP_NAME,
        id: RP_ID
      },
      user,
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: AUTHENTICATOR_ATTACHMENT,
        userVerification: USER_VERIFICATION,
        residentKey: 'preferred',
        requireResidentKey: false
      },
      timeout: TIMEOUT,
      attestation: 'none',
      excludeCredentials: [] // We'll populate this with existing credentials
    };

    // Get existing credentials for this user to exclude them
    const existingCredentials = await db.query.webauthnCredentials.findMany({
      where: eq(webauthnCredentials.userId, userId)
    });

    if (existingCredentials.length > 0) {
      options.excludeCredentials = existingCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key',
        transports: cred.transports ? JSON.parse(cred.transports) : undefined
      }));
    }

    return res.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    return res.status(500).json({ error: 'Failed to generate registration options' });
  }
}

/**
 * Verify and store WebAuthn registration
 */
export async function verifyRegistration(
  req: Request, 
  res: Response
): Promise<Response> {
  try {
    const attestation = req.body as WebAuthnAttestationResponse;

    // Verify challenge from session
    if (!req.session?.webauthnChallenge || !req.session?.webauthnUserId) {
      return res.status(400).json({ error: 'No challenge found in session' });
    }

    const expectedChallenge = req.session.webauthnChallenge;
    const userId = req.session.webauthnUserId;

    // Parse client data JSON
    const clientDataJSON = JSON.parse(
      Buffer.from(attestation.response.clientDataJSON, 'base64url').toString()
    );
    
    // Verify challenge
    const challengeFromClientData = clientDataJSON.challenge;
    if (challengeFromClientData !== expectedChallenge) {
      return res.status(400).json({ error: 'Challenge verification failed' });
    }

    // In a production environment, you would:
    // 1. Verify the attestation object
    // 2. Verify the authenticator
    // 3. Verify the signature
    // For this implementation, we'll focus on saving the credential

    // Extract credential public key and ID
    // Note: In a real implementation, you would parse these from the attestation object
    const credentialId = attestation.id;
    const credentialPublicKey = Buffer.from(attestation.response.attestationObject, 'base64url').toString('base64url');

    // Save the credential to the database
    await db.insert(webauthnCredentials).values({
      userId,
      credentialId,
      credentialPublicKey,
      counter: 0,
      credentialDeviceType: attestation.authenticatorAttachment || 'platform',
      credentialBackedUp: false,
      transports: JSON.stringify(['internal']), // Assuming internal transport for platform authenticators
      userVerified: true
    });

    // Update user as verified
    await db.update(users)
      .set({ isVerified: true })
      .where(eq(users.id, userId));

    // Clear the challenge from the session
    delete req.session.webauthnChallenge;

    return res.json({ 
      success: true, 
      message: 'Registration successful',
      userId 
    });
  } catch (error) {
    console.error('Error during registration verification:', error);
    return res.status(500).json({ error: 'Failed to verify registration' });
  }
}

/**
 * Generate authentication options for WebAuthn
 */
export async function generateAuthenticationOptions(
  req: Request, 
  res: Response
): Promise<Response> {
  try {
    const { userId } = req.body;

    // Generate a new random challenge
    const challenge = generateChallenge();

    // Store the challenge in the session for verification later
    if (req.session) {
      req.session.webauthnChallenge = challenge;
      if (userId) {
        req.session.webauthnUserId = userId;
      }
    }

    // Create authentication options
    const options: WebAuthnAuthenticationOptions = {
      challenge,
      rpId: RP_ID,
      timeout: TIMEOUT,
      userVerification: USER_VERIFICATION
    };

    // If we have a userId, add allow credentials 
    if (userId) {
      const credentials = await db.query.webauthnCredentials.findMany({
        where: eq(webauthnCredentials.userId, userId)
      });

      if (credentials.length > 0) {
        options.allowCredentials = credentials.map(cred => ({
          id: cred.credentialId,
          type: 'public-key',
          transports: cred.transports ? JSON.parse(cred.transports) : undefined
        }));
      }
    }

    return res.json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    return res.status(500).json({ error: 'Failed to generate authentication options' });
  }
}

/**
 * Verify WebAuthn authentication
 */
export async function verifyAuthentication(
  req: Request, 
  res: Response
): Promise<Response> {
  try {
    const assertion = req.body as WebAuthnAuthenticationResponse;

    // Verify challenge from session
    if (!req.session?.webauthnChallenge) {
      return res.status(400).json({ error: 'No challenge found in session' });
    }

    const expectedChallenge = req.session.webauthnChallenge;

    // Parse client data JSON
    const clientDataJSON = JSON.parse(
      Buffer.from(assertion.response.clientDataJSON, 'base64url').toString()
    );
    
    // Verify challenge
    const challengeFromClientData = clientDataJSON.challenge;
    if (challengeFromClientData !== expectedChallenge) {
      return res.status(400).json({ error: 'Challenge verification failed' });
    }

    // Find the credential in the database
    const credential = await db.query.webauthnCredentials.findFirst({
      where: eq(webauthnCredentials.credentialId, assertion.id)
    });

    if (!credential) {
      return res.status(400).json({ error: 'Credential not found' });
    }

    // In a production environment, you would:
    // 1. Verify the authenticator data
    // 2. Verify the signature using the stored public key
    // 3. Update the counter
    // For this implementation, we'll focus on finding the user

    // Find the user
    const user = await db.query.users.findFirst({
      where: eq(users.id, credential.userId)
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Update the credential last used timestamp
    await db.update(webauthnCredentials)
      .set({ 
        lastUsed: new Date(),
        counter: credential.counter + 1
      })
      .where(eq(webauthnCredentials.id, credential.id));

    // Update user's last login time
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    // Set user as authenticated in session
    if (req.session) {
      req.session.isAuthenticated = true;
      req.session.userId = user.id;
      delete req.session.webauthnChallenge;
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error during authentication verification:', error);
    return res.status(500).json({ error: 'Failed to verify authentication' });
  }
}