/**
 * Shared WebAuthn types and utilities
 */

// WebAuthn registration request
export interface WebAuthnRegistrationRequest {
  username: string;
  displayName?: string;
}

// WebAuthn registration response
export interface WebAuthnRegistrationResponse {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
  type: string;
}

// WebAuthn authentication request
export interface WebAuthnAuthenticationRequest {
  username: string;
}

// WebAuthn authentication response
export interface WebAuthnAuthenticationResponse {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string | null;
  };
  type: string;
}

// Hybrid auth request with face image
export interface HybridAuthRequest extends WebAuthnAuthenticationRequest {
  faceImage: string;
}

// Hybrid auth response
export interface HybridAuthResponse extends WebAuthnAuthenticationResponse {
  faceImage: string;
}