/**
 * Shared types for WebAuthn implementation
 * These types ensure consistency between client and server components
 */

// WebAuthn Registration Options
export interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string | number;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout: number;
  attestation: string;
  authenticatorSelection: {
    authenticatorAttachment?: string;
    userVerification?: string;
    requireResidentKey?: boolean;
  };
}

// WebAuthn Authentication Options
export interface WebAuthnAuthenticationOptions {
  challenge: string;
  timeout: number;
  rpId: string;
  userVerification?: string;
  allowCredentials: Array<{
    id: string;
    type: string;
  }>;
}

// Attestation Response (for registration)
export interface WebAuthnAttestationResponse {
  id: string;
  rawId: string;
  type: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
    publicKey?: any;
  };
}

// Assertion Response (for authentication)
export interface WebAuthnAssertionResponse {
  id: string;
  rawId: string;
  type: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
  };
}

// Hybrid Registration Request
export interface HybridRegistrationRequest {
  attestationResponse: WebAuthnAttestationResponse;
  faceImage: string; // Base64 encoded image
}

// Hybrid Verification Request
export interface HybridVerificationRequest {
  assertionResponse: WebAuthnAssertionResponse;
  faceImage?: string; // Optional base64 encoded image
}

// Response from the server after registration
export interface WebAuthnRegistrationResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string;
}

// Response from the server after authentication
export interface WebAuthnAuthenticationResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    username: string;
    isVerified: boolean;
  };
  error?: string;
  details?: string;
  faceDetails?: {
    confidence: number;
    results?: {
      age?: number;
      gender?: string | Record<string, number>;
      dominant_race?: string;
      dominant_emotion?: string;
    };
  };
}

// Credential record as stored in the database
export interface StoredCredential {
  id: number;
  credentialId: string;
  userId: string | number;
  publicKey?: string;
  counter: number;
  faceId?: string;
  createdAt: Date;
  lastUsed: Date;
  metadata?: Record<string, any>;
}