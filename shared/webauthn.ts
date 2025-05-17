/**
 * Shared WebAuthn types for both client and server
 */

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

export interface HybridRegistrationRequest {
  attestationResponse: WebAuthnAttestationResponse;
  faceImage: string; // Base64 encoded image
}

export interface HybridVerificationRequest {
  assertionResponse: WebAuthnAssertionResponse;
  faceImage?: string; // Optional base64 encoded image
}

export interface WebAuthnRegistrationResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string;
}

export interface WebAuthnAuthenticationResponse {
  success: boolean;
  message: string;
  user?: {
    id: number | string;
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