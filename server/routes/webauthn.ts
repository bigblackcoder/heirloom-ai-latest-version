/**
 * WebAuthn API routes for biometric authentication
 */
import { Router } from 'express';
import { WebAuthnController } from '../webauthn-controller';

const router = Router();
const webAuthnController = new WebAuthnController();

// Registration endpoints
router.post('/register-options', webAuthnController.getRegistrationOptions);
router.post('/register-verify', webAuthnController.verifyRegistration);
router.post('/register-hybrid', webAuthnController.verifyHybridRegistration);

// Authentication endpoints
router.post('/auth-options', webAuthnController.getAuthenticationOptions);
router.post('/verify', webAuthnController.verifyAuthentication);
router.post('/verify-hybrid', webAuthnController.verifyHybridAuthentication);

export default router;