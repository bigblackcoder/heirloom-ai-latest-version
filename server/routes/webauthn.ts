import { Router } from 'express';
import * as WebAuthnController from '../webauthn-controller';

// Create a router for WebAuthn routes
const router = Router();

// Registration routes
router.post('/register/options', WebAuthnController.getRegistrationOptions);
router.post('/register/verify', WebAuthnController.verifyRegistration);

// Authentication routes
router.post('/authenticate/options', WebAuthnController.getAuthenticationOptions);
router.post('/authenticate/verify', WebAuthnController.verifyAuthentication);

// Hybrid routes (device biometrics + server facial verification)
router.post('/hybrid/register', WebAuthnController.hybridRegistration);
router.post('/hybrid/verify', WebAuthnController.hybridVerification);

export default router;