/**
 * WebAuthn utility module for biometric authentication
 * This enables secure device-based biometric verification 
 * without requiring biometric data to leave the user's device
 */

// Base64 encoding utilities
export function bufferToBase64URLString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64URLStringToBuffer(base64URLString: string): ArrayBuffer {
  const base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64.padEnd(base64.length + padLength, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return buffer;
}

// Types for WebAuthn operations
export interface PublicKeyCredentialCreationOptions {
  challenge: BufferSource;
  rp: { name: string; id?: string };
  user: {
    id: BufferSource;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  excludeCredentials?: PublicKeyCredentialDescriptor[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: AttestationConveyancePreference;
}

export interface PublicKeyCredentialRequestOptions {
  challenge: BufferSource;
  rpId?: string;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  timeout?: number;
  userVerification?: UserVerificationRequirement;
}

export interface PublicKeyCredentialParameters {
  type: string;
  alg: number;
}

export interface PublicKeyCredentialDescriptor {
  type: string;
  id: BufferSource;
  transports?: AuthenticatorTransport[];
}

export interface AuthenticatorSelectionCriteria {
  authenticatorAttachment?: AuthenticatorAttachment;
  residentKey?: ResidentKeyRequirement;
  requireResidentKey?: boolean;
  userVerification?: UserVerificationRequirement;
}

export type AuthenticatorAttachment = "platform" | "cross-platform";
export type ResidentKeyRequirement = "discouraged" | "preferred" | "required";
export type UserVerificationRequirement = "discouraged" | "preferred" | "required";
export type AttestationConveyancePreference = "none" | "indirect" | "direct";
export type AuthenticatorTransport = "usb" | "nfc" | "ble" | "internal";

// WebAuthn API interfaces
export interface RegistrationCredential extends Credential {
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject: ArrayBuffer;
  };
  getClientExtensionResults(): Record<string, any>;
}

export interface AuthenticationCredential extends Credential {
  response: {
    clientDataJSON: ArrayBuffer;
    authenticatorData: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle?: ArrayBuffer;
  };
  getClientExtensionResults(): Record<string, any>;
}

// Our custom interfaces for server communication
export interface RegistrationRequest {
  username: string;
  userId: string | number;
  displayName: string;
}

export interface RegistrationResponse {
  credential: any;
  credentialId: string;
  userId: string | number;
}

export interface VerificationRequest {
  credentialId: string;
  userId?: string | number;
}

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  userId?: string | number;
  message?: string;
  error?: string;
  timestamp: number;
  deviceInfo?: {
    type: string;
    platform?: string;
    browser?: string;
  };
}

// Feature detection utility
export function isBiometricSupported(): boolean {
  return window && 
    window.PublicKeyCredential !== undefined && 
    typeof window.PublicKeyCredential === 'function';
}

// Device biometric capability detection
export async function getBiometricCapabilities(): Promise<{
  available: boolean;
  platform: string | null;
  biometricAuth: 'faceID' | 'fingerprint' | 'other' | null;
}> {
  // Default response
  const result = {
    available: false,
    platform: null,
    biometricAuth: null as 'faceID' | 'fingerprint' | 'other' | null
  };
  
  // Check if WebAuthn is supported
  if (!isBiometricSupported()) {
    return result;
  }
  
  // Check if platform authenticator is available
  try {
    // Check if user verification is available
    const supportsUV = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!supportsUV) {
      result.available = false;
      return result;
    }
    
    result.available = true;
    
    // Detect platform
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      result.platform = 'iOS';
      result.biometricAuth = 'faceID'; // Newer iOS devices use Face ID
    } else if (/Android/.test(ua)) {
      result.platform = 'Android';
      result.biometricAuth = 'fingerprint'; // Most Android devices use fingerprint
    } else if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 0) {
      result.platform = 'iPadOS';
      result.biometricAuth = 'touchID';
    } else if (/Macintosh|Mac OS X/.test(ua)) {
      result.platform = 'macOS';
      result.biometricAuth = 'touchID'; // Modern MacBooks use Touch ID
    } else if (/Windows/.test(ua)) {
      result.platform = 'Windows';
      result.biometricAuth = 'other'; // Windows Hello could be facial or fingerprint
    } else {
      result.platform = 'other';
      result.biometricAuth = 'other';
    }
    
    return result;
  } catch (error) {
    console.error('Error detecting biometric capabilities:', error);
    return result;
  }
}