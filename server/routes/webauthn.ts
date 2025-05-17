/**
 * WebAuthn API routes for device-based biometric authentication
 */

import { Router } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  registerHybridVerification,
  verifyHybridAuthentication
} from '../webauthn-controller';

const router = Router();

// Registration endpoints
router.post('/register/options', generateRegistrationOptions);
router.post('/register/verify', verifyRegistration);

// Authentication endpoints
router.post('/authenticate/options', generateAuthenticationOptions);
router.post('/authenticate/verify', verifyAuthentication);

// Hybrid verification endpoints (WebAuthn + DeepFace)
router.post('/hybrid/register', registerHybridVerification);
router.post('/hybrid/verify', verifyHybridAuthentication);

export default router;