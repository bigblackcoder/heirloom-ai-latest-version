/**
 * Routes index file to centralize route registration
 */

import { Router } from 'express';
import webauthnRoutes from './webauthn';

const router = Router();

// Mount WebAuthn routes
router.use('/webauthn', webauthnRoutes);

export default router;