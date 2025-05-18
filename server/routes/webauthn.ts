import { Router } from 'express';
import * as WebAuthnController from '../webauthn-controller';

const router = Router();

// Registration routes
router.post('/register/start', WebAuthnController.startRegistration);
router.post('/register/complete', WebAuthnController.completeRegistration);
router.post('/register/status', WebAuthnController.getRegistrationStatus);

// Authentication routes
router.post('/authenticate/start', WebAuthnController.startAuthentication);
router.post('/authenticate/complete', WebAuthnController.completeAuthentication);
router.post('/authenticate/status', WebAuthnController.getAuthenticationStatus);

export default router;