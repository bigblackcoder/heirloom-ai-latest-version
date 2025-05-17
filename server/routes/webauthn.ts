import express, { Router } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication
} from '../webauthn-controller';

/**
 * Router for WebAuthn-related endpoints
 */
const webauthnRouter = Router();

// WebAuthn registration endpoints
webauthnRouter.post('/generate-registration-options', generateRegistrationOptions);
webauthnRouter.post('/verify-registration', verifyRegistration);

// WebAuthn authentication endpoints
webauthnRouter.post('/generate-authentication-options', generateAuthenticationOptions);
webauthnRouter.post('/verify-authentication', verifyAuthentication);

export default webauthnRouter;