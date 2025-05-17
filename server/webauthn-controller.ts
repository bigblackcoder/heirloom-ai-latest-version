/**
 * WebAuthn Controller
 * Handles registration and authentication of WebAuthn credentials
 */

import crypto from 'crypto';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { users, webauthnCredentials } from '../shared/schema';
import { verifyFace } from './deepface';
import type {
  WebAuthnRegistrationOptions,
  WebAuthnAuthenticationOptions,
  WebAuthnAttestationResponse,
  WebAuthnAssertionResponse,
  WebAuthnRegistrationResponse,
  WebAuthnAuthenticationResponse,
  WebAuthnCredential,
  WebAuthnUser
} from '../shared/webauthn';

// Configuration for WebAuthn
const WEBAUTHN_CONFIG = {
  // Relying Party info
  rpName: 'Heirloom Identity Platform',
  rpId: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
  origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  // Challenge settings
  challengeSize: 32,
  // Timeout in milliseconds
  timeout: 60000,
  // Supported algorithms, see https://www.iana.org/assignments/cose/cose.xhtml#algorithms
  supportedAlgorithms: [-7, -257] // ES256, RS256
};

/**
 * Generate a random challenge for WebAuthn operations
 * @returns Base64URL encoded challenge
 */
export function generateChallenge(): string {
  const challenge = crypto.randomBytes(WEBAUTHN_CONFIG.challengeSize);
  return bufferToBase64Url(challenge);
}

/**
 * Convert a Buffer to a Base64URL string
 */
export function bufferToBase64Url(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert a Base64URL string to a Buffer
 */
export function base64UrlToBuffer(base64Url: string): Buffer {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = 4 - (base64.length % 4);
  const padding = paddingLength < 4 ? '='.repeat(paddingLength) : '';
  return Buffer.from(base64 + padding, 'base64');
}

/**
 * Get registration options for a user
 * @param userId User ID
 * @param username Username
 * @returns Registration options for the WebAuthn client
 */
export async function getRegistrationOptions(userId: string | number, username: string): Promise<WebAuthnRegistrationOptions> {
  console.log(`Generating registration options for user ${username} (${userId})`);
  
  // Generate a new challenge
  const challenge = generateChallenge();
  
  // Check if the user already has credentials
  let userCredentials: WebAuthnCredential[] = [];
  try {
    const result = await db.select().from(webauthnCredentials)
      .where(eq(webauthnCredentials.userId, userId.toString()));
    userCredentials = result;
  } catch (error) {
    console.error('Error fetching user credentials:', error);
  }
  
  // Create registration options
  const registrationOptions: WebAuthnRegistrationOptions = {
    challenge,
    rp: {
      name: WEBAUTHN_CONFIG.rpName,
      id: WEBAUTHN_CONFIG.rpId
    },
    user: {
      id: userId,
      name: username,
      displayName: username
    },
    pubKeyCredParams: WEBAUTHN_CONFIG.supportedAlgorithms.map(alg => ({
      type: 'public-key',
      alg
    })),
    timeout: WEBAUTHN_CONFIG.timeout,
    excludeCredentials: userCredentials.map(cred => ({
      id: cred.id,
      type: 'public-key',
      transports: cred.transports || undefined
    })),
    authenticatorSelection: {
      userVerification: 'preferred',
      authenticatorAttachment: 'platform'  // Prefer platform authenticators (like Face ID, Touch ID, Windows Hello)
    },
    attestation: 'none'  // Don't require attestation to simplify the process
  };
  
  return registrationOptions;
}

/**
 * Get authentication options for a user
 * @param userId User ID
 * @returns Authentication options for the WebAuthn client
 */
export async function getAuthenticationOptions(userId: string | number): Promise<WebAuthnAuthenticationOptions> {
  console.log(`Generating authentication options for user ${userId}`);
  
  // Generate a new challenge
  const challenge = generateChallenge();
  
  // Fetch user credentials
  let userCredentials: WebAuthnCredential[] = [];
  try {
    const result = await db.select().from(webauthnCredentials)
      .where(eq(webauthnCredentials.userId, userId.toString()));
    userCredentials = result;
  } catch (error) {
    console.error('Error fetching user credentials:', error);
  }
  
  if (userCredentials.length === 0) {
    throw new Error(`No credentials found for user ${userId}`);
  }
  
  // Create authentication options
  const authenticationOptions: WebAuthnAuthenticationOptions = {
    challenge,
    timeout: WEBAUTHN_CONFIG.timeout,
    rpId: WEBAUTHN_CONFIG.rpId,
    allowCredentials: userCredentials.map(cred => ({
      id: cred.id,
      type: 'public-key',
      transports: cred.transports || undefined
    })),
    userVerification: 'preferred'
  };
  
  return authenticationOptions;
}

/**
 * Verify registration response from client
 * @param attestation Attestation response from client
 * @returns Registration result
 */
export async function verifyRegistration(attestation: WebAuthnAttestationResponse): Promise<WebAuthnRegistrationResponse> {
  console.log('Verifying registration response');
  
  // Here we would normally implement a full verification of the attestation
  // For simplicity in this example, we're just extracting the credential ID and public key
  // In a production environment, use a library like @simplewebauthn/server for proper verification
  
  try {
    // In a real implementation, we would:
    // 1. Verify the attestation object format and signature
    // 2. Verify the client data JSON including challenge, origin, and type
    // 3. Extract the credential public key in the correct format
    
    // For this example, we're mocking this by assuming the credential ID is valid
    const credentialId = attestation.id;
    
    // In a real implementation, we'd extract the public key from the attestation object
    // For now, just generate a mock public key
    const publicKey = bufferToBase64Url(crypto.randomBytes(32));
    
    return {
      success: true,
      message: 'Registration successful',
      credential: {
        id: credentialId,
        publicKey
      }
    };
  } catch (error) {
    console.error('Error verifying registration:', error);
    return {
      success: false,
      error: `Registration verification failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Save a verified credential to the database
 * @param credential WebAuthn credential
 * @param userId User ID
 * @returns Success status
 */
export async function saveCredential(credential: { id: string, publicKey: string }, userId: string | number): Promise<boolean> {
  console.log(`Saving credential for user ${userId}`);
  
  try {
    // Create a new credential record
    await db.insert(webauthnCredentials).values({
      id: credential.id,
      publicKey: credential.publicKey,
      userId: userId.toString(),
      algorithm: -7, // ES256 as default
      counter: 0,
      createdAt: new Date()
    });
    
    // Update user's verification status
    await db.update(users)
      .set({ isVerified: true })
      .where(eq(users.id, userId.toString()));
    
    return true;
  } catch (error) {
    console.error('Error saving credential:', error);
    return false;
  }
}

/**
 * Verify authentication response from client
 * @param assertion Assertion response from client
 * @returns Authentication result
 */
export async function verifyAuthentication(assertion: WebAuthnAssertionResponse): Promise<WebAuthnAuthenticationResponse> {
  console.log('Verifying authentication response');
  
  // In a production environment, use a library like @simplewebauthn/server for proper verification
  try {
    // Fetch the credential from the database
    const credentialResult = await db.select().from(webauthnCredentials)
      .where(eq(webauthnCredentials.id, assertion.id));
    
    if (credentialResult.length === 0) {
      return {
        success: false,
        error: 'Credential not found'
      };
    }
    
    const credential = credentialResult[0];
    
    // In a real implementation, we would:
    // 1. Verify the signature using the stored public key
    // 2. Verify the authenticator data including counters
    // 3. Verify the client data JSON including challenge, origin, and type
    
    // Update the credential's last used date and counter
    await db.update(webauthnCredentials)
      .set({ 
        lastUsed: new Date(),
        counter: credential.counter + 1
      })
      .where(eq(webauthnCredentials.id, assertion.id));
    
    // Fetch the user
    const userResult = await db.select().from(users)
      .where(eq(users.id, credential.userId));
    
    if (userResult.length === 0) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    const user = userResult[0];
    
    return {
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        name: user.username,
        displayName: user.displayName || user.username,
        isVerified: user.isVerified
      }
    };
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return {
      success: false,
      error: `Authentication verification failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Hybrid verification: Combine WebAuthn with face verification
 * @param assertion WebAuthn assertion response
 * @param faceImage Base64 encoded face image
 * @returns Authentication result with hybrid verification
 */
export async function hybridVerification(
  assertion: WebAuthnAssertionResponse, 
  faceImage: string
): Promise<WebAuthnAuthenticationResponse> {
  console.log('Performing hybrid verification (WebAuthn + Face)');
  
  // First, verify the WebAuthn assertion
  const webAuthnResult = await verifyAuthentication(assertion);
  
  if (!webAuthnResult.success) {
    return webAuthnResult;
  }
  
  // Now verify the face if WebAuthn succeeded
  const userId = webAuthnResult.user?.id;
  
  if (!userId) {
    return {
      ...webAuthnResult,
      success: false,
      error: 'User ID not found for face verification'
    };
  }
  
  try {
    // Perform face verification
    const faceResult = await verifyFace(faceImage, userId.toString(), false);
    
    return {
      ...webAuthnResult,
      hybrid: {
        faceVerified: faceResult.matched === true,
        score: faceResult.confidence || 0
      }
    };
  } catch (error) {
    console.error('Face verification error:', error);
    return {
      ...webAuthnResult,
      hybrid: {
        faceVerified: false,
        score: 0
      }
    };
  }
}

/**
 * Hybrid registration: Combine WebAuthn with face registration
 * @param attestation WebAuthn attestation response
 * @param faceImage Base64 encoded face image
 * @param userId User ID
 * @returns Registration result with hybrid verification
 */
export async function hybridRegistration(
  attestation: WebAuthnAttestationResponse,
  faceImage: string,
  userId: string | number
): Promise<WebAuthnRegistrationResponse> {
  console.log('Performing hybrid registration (WebAuthn + Face)');
  
  // First, verify the WebAuthn attestation
  const webAuthnResult = await verifyRegistration(attestation);
  
  if (!webAuthnResult.success) {
    return webAuthnResult;
  }
  
  // Now register the face if WebAuthn succeeded
  try {
    // Save the credential
    if (webAuthnResult.credential) {
      await saveCredential(webAuthnResult.credential, userId);
    }
    
    // Register face
    const faceResult = await verifyFace(faceImage, userId.toString(), true);
    
    return {
      ...webAuthnResult,
      hybrid: {
        faceVerified: faceResult.success,
        score: faceResult.confidence || 0
      }
    };
  } catch (error) {
    console.error('Face registration error:', error);
    return {
      ...webAuthnResult,
      hybrid: {
        faceVerified: false,
        score: 0
      }
    };
  }
}