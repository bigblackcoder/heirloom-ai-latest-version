/**
 * WebAuthn Controller for biometric authentication
 * Handles WebAuthn registration and verification, with optional face verification
 */
import crypto from 'crypto';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  WebAuthnRegistrationOptions,
  WebAuthnAuthenticationOptions,
  WebAuthnAttestationResponse,
  WebAuthnAssertionResponse,
  WebAuthnRegistrationResponse,
  WebAuthnAuthenticationResponse,
  StoredCredential,
  HybridRegistrationRequest,
  HybridVerificationRequest
} from '../shared/webauthn';
import { verifyFace, detectFaceBasic, FaceVerificationResult } from './deepface';
import { db } from './db';
import { credentials } from '../shared/schema';
import { and, eq } from 'drizzle-orm';

/**
 * WebAuthn controller class
 */
export class WebAuthnController {
  // WebAuthn configuration
  private rpName = 'Heirloom Identity Platform';
  private rpID = process.env.NODE_ENV === 'production' 
    ? process.env.RP_ID || window.location.hostname
    : 'localhost';
  
  // Challenge storage (in-memory for simplicity, should use a more persistent solution in production)
  private challenges: Map<string | number, string> = new Map();
  
  /**
   * Generate WebAuthn registration options
   */
  public getRegistrationOptions = async (req: Request, res: Response) => {
    try {
      const { userId, username } = req.body;
      
      if (!userId || !username) {
        return res.status(400).json({
          success: false,
          error: 'User ID and username are required'
        });
      }
      
      // Generate a random challenge
      const challenge = this.generateChallenge();
      
      // Store the challenge for this user
      this.challenges.set(userId, challenge);
      
      // Create registration options
      const options: WebAuthnRegistrationOptions = {
        challenge,
        rp: {
          name: this.rpName,
          id: this.rpID
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
        attestation: 'none',
        authenticatorSelection: {
          userVerification: 'preferred',
          authenticatorAttachment: 'platform',
          requireResidentKey: false
        }
      };
      
      return res.json(options);
    } catch (error) {
      console.error('Error generating registration options:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate registration options'
      });
    }
  };
  
  /**
   * Verify WebAuthn registration (credential creation)
   */
  public verifyRegistration = async (req: Request, res: Response) => {
    try {
      const { attestationResponse } = req.body;
      
      if (!attestationResponse) {
        return res.status(400).json({
          success: false,
          error: 'Attestation response is required'
        });
      }
      
      // Extract basic information
      const { id, rawId, type, response } = attestationResponse as WebAuthnAttestationResponse;
      
      // Decode client data
      const clientDataJSON = JSON.parse(
        Buffer.from(response.clientDataJSON, 'base64').toString('utf-8')
      );
      
      // Verify the challenge
      const userId = this.extractUserIdFromClientData(clientDataJSON);
      const expectedChallenge = this.challenges.get(userId);
      
      if (!expectedChallenge || clientDataJSON.challenge !== expectedChallenge) {
        return res.status(400).json({
          success: false,
          error: 'Challenge verification failed'
        });
      }
      
      // Clear the challenge after use
      this.challenges.delete(userId);
      
      // In a real implementation, we would also validate the attestation object
      // and extract the public key for future authentications
      
      // For this demo, we'll assume the attestation is valid and extract a simple credential
      const credentialId = rawId;
      
      // Save the credential to the database
      const credentialData = {
        id: uuidv4(),
        credentialId,
        userId,
        publicKey: response.publicKey || null, // In a real implementation, extract from attestationObject
        counter: 0,
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      await db.insert(credentials).values(credentialData);
      
      return res.json({
        success: true,
        message: 'Registration successful'
      } as WebAuthnRegistrationResponse);
    } catch (error) {
      console.error('Error verifying registration:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify registration',
        details: (error as Error).message
      } as WebAuthnRegistrationResponse);
    }
  };
  
  /**
   * Verify WebAuthn registration with face capture (hybrid registration)
   */
  public verifyHybridRegistration = async (req: Request, res: Response) => {
    try {
      const { attestationResponse, faceImage } = req.body as HybridRegistrationRequest;
      
      if (!attestationResponse || !faceImage) {
        return res.status(400).json({
          success: false,
          error: 'Attestation response and face image are required'
        });
      }
      
      // First, verify the WebAuthn attestation
      const webAuthnResult = await this.verifyRegistration({ 
        body: { attestationResponse } 
      } as Request, {
        status: () => ({ json: (data: any) => data }),
        json: (data: any) => data
      } as unknown as Response);
      
      if (!webAuthnResult.success) {
        return res.json(webAuthnResult);
      }
      
      // Extract user ID from the attestation
      const { rawId, response } = attestationResponse as WebAuthnAttestationResponse;
      const clientDataJSON = JSON.parse(
        Buffer.from(response.clientDataJSON, 'base64').toString('utf-8')
      );
      const userId = this.extractUserIdFromClientData(clientDataJSON);
      
      // Now verify the face and save it to the database
      const faceResult = await verifyFace(faceImage, userId, true);
      
      if (!faceResult.success) {
        return res.json({
          success: false,
          error: 'Face verification failed',
          details: faceResult.message
        } as WebAuthnRegistrationResponse);
      }
      
      // Update the credential with the face ID
      const credential = await this.findCredentialByRawId(rawId);
      
      if (credential && faceResult.face_id) {
        await db.update(credentials)
          .set({ faceId: faceResult.face_id })
          .where(eq(credentials.id, credential.id));
      }
      
      return res.json({
        success: true,
        message: 'Hybrid registration successful'
      } as WebAuthnRegistrationResponse);
    } catch (error) {
      console.error('Error verifying hybrid registration:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify hybrid registration',
        details: (error as Error).message
      } as WebAuthnRegistrationResponse);
    }
  };
  
  /**
   * Generate WebAuthn authentication options
   */
  public getAuthenticationOptions = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }
      
      // Generate a random challenge
      const challenge = this.generateChallenge();
      
      // Store the challenge for this user
      this.challenges.set(userId, challenge);
      
      // Get the user's registered credentials
      const userCredentials = await db.select()
        .from(credentials)
        .where(eq(credentials.userId, userId.toString()));
      
      if (!userCredentials || userCredentials.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No registered credentials found for this user'
        });
      }
      
      // Create authentication options
      const options: WebAuthnAuthenticationOptions = {
        challenge,
        rpId: this.rpID,
        timeout: 60000,
        userVerification: 'preferred',
        allowCredentials: userCredentials.map(cred => ({
          id: cred.credentialId,
          type: 'public-key'
        }))
      };
      
      return res.json(options);
    } catch (error) {
      console.error('Error generating authentication options:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate authentication options'
      });
    }
  };
  
  /**
   * Verify WebAuthn authentication (assertion)
   */
  public verifyAuthentication = async (req: Request, res: Response) => {
    try {
      const { assertionResponse } = req.body;
      
      if (!assertionResponse) {
        return res.status(400).json({
          success: false,
          error: 'Assertion response is required'
        });
      }
      
      // Extract basic information
      const { id, rawId, type, response } = assertionResponse as WebAuthnAssertionResponse;
      
      // Decode client data
      const clientDataJSON = JSON.parse(
        Buffer.from(response.clientDataJSON, 'base64').toString('utf-8')
      );
      
      // Find the credential
      const credential = await this.findCredentialByRawId(rawId);
      
      if (!credential) {
        return res.status(400).json({
          success: false,
          error: 'Unknown credential'
        } as WebAuthnAuthenticationResponse);
      }
      
      // Verify the challenge
      const expectedChallenge = this.challenges.get(credential.userId);
      
      if (!expectedChallenge || clientDataJSON.challenge !== expectedChallenge) {
        return res.status(400).json({
          success: false,
          error: 'Challenge verification failed'
        } as WebAuthnAuthenticationResponse);
      }
      
      // Clear the challenge after use
      this.challenges.delete(credential.userId);
      
      // In a real implementation, we would also validate the signature using the public key
      // and verify the counter to prevent replay attacks
      
      // Update the credential usage timestamp
      await db.update(credentials)
        .set({ lastUsed: new Date() })
        .where(eq(credentials.id, credential.id));
      
      return res.json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: credential.userId,
          username: 'user', // In a real app, fetch the username from the user record
          isVerified: true
        }
      } as WebAuthnAuthenticationResponse);
    } catch (error) {
      console.error('Error verifying authentication:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify authentication',
        details: (error as Error).message
      } as WebAuthnAuthenticationResponse);
    }
  };
  
  /**
   * Verify WebAuthn authentication with face verification (hybrid authentication)
   */
  public verifyHybridAuthentication = async (req: Request, res: Response) => {
    try {
      const { assertionResponse, faceImage } = req.body as HybridVerificationRequest;
      
      if (!assertionResponse) {
        return res.status(400).json({
          success: false,
          error: 'Assertion response is required'
        });
      }
      
      // First, verify the WebAuthn assertion
      const webAuthnResult = await this.verifyAuthentication({ 
        body: { assertionResponse } 
      } as Request, {
        status: () => ({ json: (data: any) => data }),
        json: (data: any) => data
      } as unknown as Response);
      
      if (!webAuthnResult.success) {
        return res.json(webAuthnResult);
      }
      
      // Get credential from the response
      const { rawId } = assertionResponse as WebAuthnAssertionResponse;
      const credential = await this.findCredentialByRawId(rawId);
      
      if (!credential) {
        return res.status(400).json({
          success: false,
          error: 'Unknown credential'
        } as WebAuthnAuthenticationResponse);
      }
      
      let faceVerified = false;
      let faceDetails: FaceVerificationResult | null = null;
      
      // If face image is provided, verify against the stored face
      if (faceImage) {
        faceDetails = await verifyFace(faceImage, credential.userId);
        faceVerified = faceDetails.success && (faceDetails.matched === true);
        
        // If face verification failed, return error
        if (!faceVerified) {
          return res.json({
            success: false,
            error: 'Face verification failed',
            details: faceDetails.message,
            // Provide details about the face analysis even if verification failed
            faceDetails: faceDetails.results ? {
              confidence: faceDetails.confidence,
              results: faceDetails.results
            } : undefined
          } as WebAuthnAuthenticationResponse);
        }
      }
      
      return res.json({
        success: true,
        message: 'Hybrid authentication successful',
        user: {
          id: credential.userId,
          username: 'user', // In a real app, fetch the username from the user record
          isVerified: true
        },
        faceDetails: faceDetails ? {
          confidence: faceDetails.confidence,
          results: faceDetails.results
        } : undefined
      } as WebAuthnAuthenticationResponse);
    } catch (error) {
      console.error('Error verifying hybrid authentication:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify hybrid authentication',
        details: (error as Error).message
      } as WebAuthnAuthenticationResponse);
    }
  };
  
  /**
   * Find a credential by its raw ID
   */
  private findCredentialByRawId = async (rawId: string): Promise<StoredCredential | null> => {
    const result = await db.select()
      .from(credentials)
      .where(eq(credentials.credentialId, rawId));
    
    return result && result.length > 0 ? result[0] : null;
  };
  
  /**
   * Generate a random challenge
   */
  private generateChallenge = (): string => {
    const randomBytes = crypto.randomBytes(32);
    return this.bufferToBase64Url(randomBytes);
  };
  
  /**
   * Convert buffer to base64url
   */
  private bufferToBase64Url = (buffer: Buffer): string => {
    return buffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  /**
   * Extract user ID from client data (for demo purposes)
   * In a real application, this would be done differently
   */
  private extractUserIdFromClientData = (clientData: any): string => {
    // This is a simplified extraction method for demo purposes
    // Extract from origin path or use a default
    if (clientData && clientData.origin) {
      const originParts = new URL(clientData.origin).pathname.split('/');
      const potentialId = originParts[originParts.length - 1];
      
      if (potentialId && potentialId.length > 0) {
        return potentialId;
      }
    }
    
    // Default to test user if we can't extract
    return 'test-user-123';
  };
}