/**
 * WebAuthn API Routes
 * 
 * These routes handle WebAuthn registration and authentication requests
 * They implement a hybrid approach with both device biometrics and server-side face verification
 */

import { Router } from 'express';
import { z } from 'zod';
import {
  getRegistrationOptions,
  getAuthenticationOptions,
  verifyRegistration,
  verifyAuthentication,
  saveCredential,
  hybridRegistration,
  hybridVerification
} from '../webauthn-controller';

const router = Router();

// Validate user info
const userInfoSchema = z.object({
  userId: z.union([z.string(), z.number()]),
  username: z.string()
});

// Registration options endpoint
router.post('/register-options', async (req, res) => {
  try {
    const { userId, username } = userInfoSchema.parse(req.body);
    
    const options = await getRegistrationOptions(userId, username);
    
    // Store the challenge in the session for verification later
    if (req.session) {
      req.session.webauthnChallenge = options.challenge;
      req.session.webauthnUserId = userId;
    }
    
    return res.json(options);
  } catch (error) {
    console.error('WebAuthn registration options error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate registration options'
    });
  }
});

// Registration verification endpoint
router.post('/register-verify', async (req, res) => {
  try {
    // Verify the challenge from the session
    if (!req.session?.webauthnChallenge || !req.session?.webauthnUserId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired registration session'
      });
    }
    
    const { attestationResponse } = req.body;
    
    if (!attestationResponse) {
      return res.status(400).json({
        success: false,
        error: 'Missing attestation response'
      });
    }
    
    // Verify the registration
    const result = await verifyRegistration(attestationResponse);
    
    if (result.success && result.credential) {
      // Save the credential to the database
      await saveCredential(result.credential, req.session.webauthnUserId);
      
      // Clear the challenge from the session
      delete req.session.webauthnChallenge;
    }
    
    return res.json(result);
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration verification failed'
    });
  }
});

// Hybrid registration (WebAuthn + face) endpoint
router.post('/register-hybrid', async (req, res) => {
  try {
    // Verify the challenge from the session
    if (!req.session?.webauthnChallenge || !req.session?.webauthnUserId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired registration session'
      });
    }
    
    const { attestationResponse, faceImage } = req.body;
    
    if (!attestationResponse) {
      return res.status(400).json({
        success: false,
        error: 'Missing attestation response'
      });
    }
    
    if (!faceImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing face image'
      });
    }
    
    // Perform hybrid registration
    const result = await hybridRegistration(
      attestationResponse,
      faceImage,
      req.session.webauthnUserId
    );
    
    // Clear the challenge from the session
    delete req.session.webauthnChallenge;
    
    return res.json(result);
  } catch (error) {
    console.error('WebAuthn hybrid registration error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Hybrid registration failed'
    });
  }
});

// Authentication options endpoint
router.post('/auth-options', async (req, res) => {
  try {
    const { userId } = z.object({
      userId: z.union([z.string(), z.number()])
    }).parse(req.body);
    
    const options = await getAuthenticationOptions(userId);
    
    // Store the challenge in the session for verification later
    if (req.session) {
      req.session.webauthnChallenge = options.challenge;
      req.session.webauthnUserId = userId;
    }
    
    return res.json(options);
  } catch (error) {
    console.error('WebAuthn authentication options error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate authentication options'
    });
  }
});

// Authentication verification endpoint
router.post('/verify', async (req, res) => {
  try {
    // Verify the challenge from the session
    if (!req.session?.webauthnChallenge) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired authentication session'
      });
    }
    
    const { assertionResponse } = req.body;
    
    if (!assertionResponse) {
      return res.status(400).json({
        success: false,
        error: 'Missing assertion response'
      });
    }
    
    // Verify the authentication
    const result = await verifyAuthentication(assertionResponse);
    
    // Clear the challenge from the session
    delete req.session.webauthnChallenge;
    
    if (result.success && result.user) {
      // Set the user in the session
      req.session.userId = result.user.id;
      req.session.isAuthenticated = true;
    }
    
    return res.json(result);
  } catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication verification failed'
    });
  }
});

// Hybrid verification (WebAuthn + face) endpoint
router.post('/verify-hybrid', async (req, res) => {
  try {
    // Verify the challenge from the session
    if (!req.session?.webauthnChallenge) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired authentication session'
      });
    }
    
    const { assertionResponse, faceImage } = req.body;
    
    if (!assertionResponse) {
      return res.status(400).json({
        success: false,
        error: 'Missing assertion response'
      });
    }
    
    if (!faceImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing face image'
      });
    }
    
    // Perform hybrid verification
    const result = await hybridVerification(assertionResponse, faceImage);
    
    // Clear the challenge from the session
    delete req.session.webauthnChallenge;
    
    if (result.success && result.user) {
      // Set the user in the session
      req.session.userId = result.user.id;
      req.session.isAuthenticated = true;
    }
    
    return res.json(result);
  } catch (error) {
    console.error('WebAuthn hybrid verification error:', error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Hybrid verification failed'
    });
  }
});

export default router;