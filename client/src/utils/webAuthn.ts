/**
 * WebAuthn API utilities for biometric authentication
 * 
 * This module implements the Web Authentication API (WebAuthn) to enable
 * biometric authentication using the device's native capabilities:
 * - Face ID on supported iOS devices
 * - Fingerprint sensors on Android and other devices
 * - Windows Hello on supported Windows devices
 */

// Conversion utilities for working with byte arrays
function bufferToBase64URLString(buffer: ArrayBuffer): string {
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

function base64URLStringToBuffer(base64URLString: string): ArrayBuffer {
  const base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64.padEnd(base64.length + padLen, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return buffer;
}

/**
 * Check if the current device/browser supports WebAuthn
 */
export function isWebAuthnSupported(): boolean {
  return window.PublicKeyCredential !== undefined && 
         typeof window.PublicKeyCredential === 'function';
}

/**
 * Check if the device has biometric capabilities
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }

  // Check if platform authenticator is available
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error('Error checking platform authenticator availability:', error);
    return false;
  }
}

/**
 * Detect the type of biometric authentication available on the device
 */
export function detectBiometricType(): 'faceId' | 'fingerprint' | 'other' {
  const ua = navigator.userAgent.toLowerCase();
  
  // iOS devices with FaceID (iPhone X and newer)
  if (
    /iphone/.test(ua) && 
    (
      // Rough detection for iPhone X and newer based on screen dimensions
      (window.screen.width === 375 && window.screen.height === 812) ||
      (window.screen.width === 414 && window.screen.height === 896) ||
      (/iphone/.test(ua) && /OS 15|OS 16|OS 17/.test(ua))
    )
  ) {
    return 'faceId';
  }
  
  // Android devices typically use fingerprint 
  if (/android/.test(ua)) {
    return 'fingerprint';
  }
  
  // Default fallback
  return 'other';
}

/**
 * Register a new biometric credential
 * @param userId - User's unique identifier
 * @param username - User's username or display name
 */
export async function registerBiometricCredential(
  userId: string,
  username: string
): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  try {
    if (!isWebAuthnSupported()) {
      return { 
        success: false, 
        error: 'WebAuthn is not supported in this browser'
      };
    }

    // Challenge should come from server in a real implementation
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    
    // This would be provided by the server in a real implementation
    // The server would create this options object and provide it to the client
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        // These would match your domain in production
        id: window.location.hostname,
        name: 'Heirloom Identity Platform'
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        // ES256 (Recommended)
        { type: 'public-key', alg: -7 },
        // RS256
        { type: 'public-key', alg: -257 }
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        // Require biometric verification
        userVerification: 'required',
        // Prefer platform authenticator (built-in to device)
        authenticatorAttachment: 'platform',
        // Require resident key (allows username-less authentication)
        requireResidentKey: true
      }
    };

    // Request the biometric credential creation
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions
    }) as PublicKeyCredential;

    if (!credential) {
      return { 
        success: false, 
        error: 'Failed to create credential' 
      };
    }

    // Extract the credential ID and public key
    const credentialId = bufferToBase64URLString(credential.rawId);
    const response = credential.response as AuthenticatorAttestationResponse;
    
    // This attestation data would be sent to the server for verification
    // and storage in a real implementation
    const attestationData = {
      id: credential.id,
      rawId: credentialId,
      type: credential.type,
      attestationObject: bufferToBase64URLString(response.attestationObject),
      clientDataJSON: bufferToBase64URLString(response.clientDataJSON)
    };

    // In a real implementation, you'd send this data to the server
    console.log('Credential registered:', attestationData);

    return {
      success: true,
      credentialId
    };
  } catch (error) {
    console.error('Error registering biometric credential:', error);
    return {
      success: false,
      error: error.message || 'Unknown error during registration'
    };
  }
}

/**
 * Authenticate with an existing biometric credential
 * @param credentialId - Optional credential ID (if null, device will present a list of available credentials)
 */
export async function authenticateWithBiometric(
  credentialId?: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    if (!isWebAuthnSupported()) {
      return { 
        success: false, 
        error: 'WebAuthn is not supported in this browser'
      };
    }
    
    // Challenge should come from server in a real implementation
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    
    const allowCredentials: PublicKeyCredentialDescriptor[] = credentialId
      ? [
          {
            type: 'public-key',
            id: base64URLStringToBuffer(credentialId),
            // Support USB keys, NFC, and internal authenticators
            transports: ['internal', 'usb', 'nfc', 'ble']
          }
        ]
      : [];
    
    // Request biometric authentication
    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      // If credentials are provided, use them, otherwise allow any registered credential
      allowCredentials,
      // Require biometric verification
      userVerification: 'required',
      // Unique ID for the relying party
      rpId: window.location.hostname
    };
    
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyOptions
    }) as PublicKeyCredential;
    
    if (!assertion) {
      return { 
        success: false, 
        error: 'No credential provided' 
      };
    }
    
    const authData = {
      id: assertion.id,
      rawId: bufferToBase64URLString(assertion.rawId),
      type: assertion.type,
      response: {
        authenticatorData: bufferToBase64URLString(
          (assertion.response as AuthenticatorAssertionResponse).authenticatorData
        ),
        clientDataJSON: bufferToBase64URLString(
          (assertion.response as AuthenticatorAssertionResponse).clientDataJSON
        ),
        signature: bufferToBase64URLString(
          (assertion.response as AuthenticatorAssertionResponse).signature
        ),
        userHandle: (assertion.response as AuthenticatorAssertionResponse).userHandle
          ? bufferToBase64URLString(
              (assertion.response as AuthenticatorAssertionResponse).userHandle!
            )
          : null
      }
    };
    
    // In a real implementation, you'd send this data to the server for verification
    console.log('Authentication successful:', authData);
    
    // Extract user ID from the user handle if available
    let userId = 'user-1'; // Default placeholder
    if (authData.response.userHandle) {
      try {
        // Decode the user handle to get the actual user ID
        const userHandleBuffer = base64URLStringToBuffer(authData.response.userHandle);
        userId = new TextDecoder().decode(userHandleBuffer);
      } catch (e) {
        console.error('Error decoding user handle:', e);
      }
    }
    
    return {
      success: true,
      userId
    };
  } catch (error) {
    console.error('Error authenticating with biometric:', error);
    return {
      success: false,
      error: error.message || 'Unknown error during authentication'
    };
  }
}