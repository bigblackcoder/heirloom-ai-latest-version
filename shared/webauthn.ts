/**
 * Type definitions for WebAuthn operations
 */

export interface WebAuthnUser {
  id: string;
  name: string;
  displayName: string;
}

export interface WebAuthnRegistrationOptions {
  user: WebAuthnUser;
  challenge: string;
  rp: {
    name: string;
    id?: string;
  };
  pubKeyCredParams: {
    type: "public-key";
    alg: number;
  }[];
  authenticatorSelection?: {
    authenticatorAttachment?: "platform" | "cross-platform";
    userVerification?: "required" | "preferred" | "discouraged";
    requireResidentKey?: boolean;
    residentKey?: "required" | "preferred" | "discouraged";
  };
  timeout?: number;
  attestation?: "none" | "indirect" | "direct";
  excludeCredentials?: {
    id: string;
    type: "public-key";
    transports?: ("ble" | "internal" | "nfc" | "usb")[];
  }[];
}

export interface WebAuthnAuthenticationOptions {
  challenge: string;
  rpId?: string;
  timeout?: number;
  userVerification?: "required" | "preferred" | "discouraged";
  allowCredentials?: {
    id: string;
    type: "public-key";
    transports?: ("ble" | "internal" | "nfc" | "usb")[];
  }[];
}

export interface WebAuthnAttestationResponse {
  id: string;
  rawId: string;
  type: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
  clientExtensionResults?: any;
  authenticatorAttachment?: "platform" | "cross-platform";
}

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
  clientExtensionResults?: any;
}

export interface WebAuthnCredential {
  id: string;
  userId: string;
  credentialId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports?: string[];
  createdAt: Date;
  lastUsed?: Date | null;
  userVerified?: boolean;
}