/**
 * WebAuthn Type Definitions
 * 
 * This file contains shared type definitions for WebAuthn (FIDO2) biometric authentication
 * used by both the client and server components.
 */

/**
 * WebAuthn Registration Options
 * These options are sent from the server to the client to initiate registration
 */
export interface WebAuthnRegistrationOptions {
  challenge: string | ArrayBuffer;
  rp: {
    name: string;
    id?: string;
  };
  user: {
    id: string | ArrayBuffer;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: {
    type: string;
    alg: number;
  }[];
  timeout?: number;
  excludeCredentials?: {
    id: string | ArrayBuffer;
    type: string;
    transports?: string[];
  }[];
  authenticatorSelection?: {
    authenticatorAttachment?: string;
    requireResidentKey?: boolean;
    residentKey?: string;
    userVerification?: string;
  };
  attestation?: string;
  extensions?: {
    credProps?: boolean;
  };
}

/**
 * WebAuthn Authentication Options
 * These options are sent from the server to the client to initiate authentication
 */
export interface WebAuthnAuthenticationOptions {
  challenge: string | ArrayBuffer;
  timeout?: number;
  rpId?: string;
  allowCredentials?: {
    id: string | ArrayBuffer;
    type: string;
    transports?: string[];
  }[];
  userVerification?: string;
  extensions?: Record<string, any>;
}

/**
 * WebAuthn Attestation Response
 * The client sends this response to the server after registration
 */
export interface WebAuthnAttestationResponse {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
  authenticatorAttachment?: string;
  clientExtensionResults?: Record<string, any>;
}

/**
 * WebAuthn Authentication Response
 * The client sends this response to the server after authentication
 */
export interface WebAuthnAuthenticationResponse {
  id: string;
  rawId: string;
  type: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
  };
  clientExtensionResults?: Record<string, any>;
}

/**
 * WebAuthn User
 * This represents a user in the WebAuthn system
 */
export interface WebAuthnUser {
  id: string | ArrayBuffer;
  name: string;
  displayName: string;
}

/**
 * WebAuthn Credential
 * This represents a credential stored by an authenticator
 */
export interface WebAuthnCredential {
  id: string;
  publicKey: string;
  algorithm: string | number;
  counter: number;
  userId: string;
  transports?: string[];
  created?: Date;
  lastUsed?: Date;
}

/**
 * Face Verification Response
 * This represents the response from a face verification operation
 */
export interface FaceVerificationResponse {
  verified: boolean;
  confidence?: number;
  faceId?: string;
  userId?: string;
  timestamp?: Date | string;
  metadata?: Record<string, any>;
}