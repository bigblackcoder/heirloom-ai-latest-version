/**
 * WebAuthn API Routes
 * Handles registration and authentication using the WebAuthn protocol
 */

import express from 'express';
import * as controller from '../webauthn-controller';

const router = express.Router();

/**
 * Registration endpoints
 */
router.post('/registration/start', controller.startRegistration);
router.post('/registration/complete', controller.completeRegistration);
router.get('/registration/status', controller.getRegistrationStatus);

/**
 * Authentication endpoints
 */
router.post('/authentication/start', controller.startAuthentication);
router.post('/authentication/complete', controller.completeAuthentication);
router.get('/authentication/status', controller.getAuthenticationStatus);

export default router;