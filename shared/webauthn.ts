/**
 * WebAuthn Interface Types
 * 
 * This file contains the TypeScript interfaces for WebAuthn authentication data
 * shared between the client and server
 */

export interface WebAuthnUser {
  id: string | number; // User ID can be string or number
  name: string; // Username
  displayName?: string; // User's display name
  isVerified?: boolean; // Whether user is verified
}

export interface WebAuthnRegistrationOptions {
  challenge: string; // Base64URL encoded challenge
  rp: {
    name: string; // Relying party name
    id?: string; // Optional Relying party ID
  };
  user: {
    id: string | number; // User ID can be string or number
    name: string; // Username
    displayName: string; // User's display name
  };
  pubKeyCredParams: Array<{
    type: 'public-key';
    alg: number; // Algorithm identifier
  }>;
  timeout?: number; // Optional timeout in milliseconds
  excludeCredentials?: Array<{
    id: string; // Base64URL encoded credential ID
    type: 'public-key';
    transports?: string[]; // Optional transports
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    requireResidentKey?: boolean;
    userVerification?: 'required' | 'preferred' | 'discouraged';
  };
  attestation?: 'none' | 'indirect' | 'direct';
  extensions?: Record<string, any>; // Optional extensions
}

export interface WebAuthnAuthenticationOptions {
  challenge: string; // Base64URL encoded challenge
  timeout?: number; // Optional timeout in milliseconds
  rpId?: string; // Optional Relying party ID
  allowCredentials: Array<{
    id: string; // Base64URL encoded credential ID
    type: 'public-key';
    transports?: string[]; // Optional transports
  }>;
  userVerification?: 'required' | 'preferred' | 'discouraged';
  extensions?: Record<string, any>; // Optional extensions
}

export interface WebAuthnAttestationResponse {
  id: string; // Base64URL encoded credential ID
  rawId: string; // Base64URL encoded raw credential ID
  type: 'public-key';
  response: {
    attestationObject: string; // Base64URL encoded attestation object
    clientDataJSON: string; // Base64URL encoded client data
  };
  extensions?: Record<string, any>; // Optional extensions
}

export interface WebAuthnAssertionResponse {
  id: string; // Base64URL encoded credential ID
  rawId: string; // Base64URL encoded raw credential ID
  type: 'public-key';
  response: {
    authenticatorData: string; // Base64URL encoded authenticator data
    clientDataJSON: string; // Base64URL encoded client data
    signature: string; // Base64URL encoded signature
    userHandle?: string; // Optional Base64URL encoded user handle
  };
  extensions?: Record<string, any>; // Optional extensions
}

export interface WebAuthnRegistrationResponse {
  success: boolean; // Whether registration was successful
  message?: string; // Optional message
  error?: string; // Optional error message
  user?: WebAuthnUser; // Optional user object
  credential?: {
    id: string; // Base64URL encoded credential ID
    publicKey: string; // Base64URL encoded public key
  };
  hybrid?: {
    faceVerified: boolean;
    score?: number;
  };
}

export interface WebAuthnAuthenticationResponse {
  success: boolean; // Whether authentication was successful
  message?: string; // Optional message
  error?: string; // Optional error message
  user?: WebAuthnUser; // Optional user object
  hybrid?: {
    faceVerified: boolean;
    score?: number;
  };
}

export interface WebAuthnCredential {
  id: string; // Base64URL encoded credential ID
  publicKey: string; // Base64URL encoded public key
  userId: string | number; // User ID can be string or number
  algorithm: number; // Algorithm identifier
  counter: number; // Signature counter
  createdAt: Date; // Creation date
  lastUsed?: Date; // Last usage date
  transports?: string[]; // Optional transports
}

export interface FaceVerificationResponse {
  success: boolean; // Whether verification was successful
  matched?: boolean; // Whether face matched with stored faces
  confidence?: number; // Confidence score
  faceId?: string; // ID of matched face
  message?: string; // Optional message
  error?: string; // Optional error message
}