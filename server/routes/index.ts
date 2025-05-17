import { Express } from 'express';
import { 
  handleWebAuthnRegisterOptions,
  handleWebAuthnRegisterVerify,
  handleHybridRegistration,
  handleWebAuthnAuthenticateOptions,
  handleWebAuthnAuthenticateVerify,
  handleHybridVerify
} from './webauthn';

export function registerWebAuthnRoutes(app: Express) {
  // WebAuthn routes
  app.post('/api/webauthn/register/options', handleWebAuthnRegisterOptions);
  app.post('/api/webauthn/register/verify', handleWebAuthnRegisterVerify);
  app.post('/api/webauthn/hybrid/register', handleHybridRegistration);
  app.post('/api/webauthn/authenticate/options', handleWebAuthnAuthenticateOptions);
  app.post('/api/webauthn/authenticate/verify', handleWebAuthnAuthenticateVerify);
  app.post('/api/webauthn/hybrid/verify', handleHybridVerify);
}