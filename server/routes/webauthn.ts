import { Router } from 'express';
import { 
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication
} from '../webauthn-controller';

const router = Router();

// WebAuthn registration endpoints
router.post('/register/options', generateRegistrationOptions);
router.post('/register/verify', verifyRegistration);

// WebAuthn authentication endpoints
router.post('/authenticate/options', generateAuthenticationOptions);
router.post('/authenticate/verify', verifyAuthentication);

export default router;