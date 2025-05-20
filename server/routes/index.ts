/**
 * Routes index file to centralize route registration
 */

import { Router } from 'express';
import webauthnRoutes from './webauthn';
import verificationTestRoutes from './verification-test';

const router = Router();

// Mount WebAuthn routes
router.use('/webauthn', webauthnRoutes);

// Mount Verification Test routes
router.use('/verification-test', verificationTestRoutes);

export default router;