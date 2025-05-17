/**
 * WebAuthn utility for handling device biometric authentication
 * This provides client-side functionality for registering and verifying with WebAuthn
 */

/**
 * Convert a base64 string to a Uint8Array
 */
export function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert an ArrayBuffer to a Base64 URL string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Start WebAuthn registration
 * @param userId User ID to associate with this registration
 * @param username Username for display
 * @param displayName Display name for the user
 */
export async function startRegistration(userId: string, username?: string, displayName?: string) {
  try {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    // Request registration options from server
    const response = await fetch('/api/webauthn/register/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        username,
        displayName
      }),
    });

    const options = await response.json();
    
    if (!options || response.status !== 200) {
      throw new Error(options.error || 'Failed to get registration options');
    }

    // Convert challenge from base64 to array buffer
    const publicKeyOptions = {
      ...options,
      challenge: base64ToArrayBuffer(options.challenge),
      user: {
        ...options.user,
        id: new TextEncoder().encode(options.user.id),
      },
    };

    // Create new credential
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    // Prepare credential for sending to server
    const attestationResponse = credential.response as AuthenticatorAttestationResponse;
    
    const credentialId = arrayBufferToBase64(credential.rawId);
    const clientDataJSON = arrayBufferToBase64(attestationResponse.clientDataJSON);
    const attestationObject = arrayBufferToBase64(attestationResponse.attestationObject);

    // Send credential to server for verification
    const verificationResponse = await fetch('/api/webauthn/register/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challengeId: options.challengeId,
        credential: {
          id: credentialId,
          type: credential.type,
          rawId: credentialId,
          clientDataJSON,
          attestationObject,
          publicKey: attestationObject, // Using attestation object as the public key for simplicity
          metadata: {
            // Add device information for additional security checks
            platform: navigator.platform,
            userAgent: navigator.userAgent,
          }
        },
      }),
    });

    const verificationResult = await verificationResponse.json();
    
    if (!verificationResult.success) {
      throw new Error(verificationResult.error || 'Registration verification failed');
    }

    return {
      success: true,
      credential: {
        id: credentialId,
        type: credential.type,
        deviceType: getDeviceType()
      },
      ...verificationResult
    };
  } catch (error) {
    console.error('WebAuthn registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during registration',
    };
  }
}

/**
 * Start WebAuthn authentication
 * @param userId User ID to authenticate
 */
export async function startAuthentication(userId: string) {
  try {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    // Request authentication options from server
    const response = await fetch('/api/webauthn/authenticate/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const options = await response.json();
    
    if (!options || response.status !== 200) {
      throw new Error(options.error || 'Failed to get authentication options');
    }

    // Convert challenge and credential IDs from base64 to array buffer
    const publicKeyOptions = {
      ...options,
      challenge: base64ToArrayBuffer(options.challenge),
      allowCredentials: options.allowCredentials.map((cred: any) => ({
        ...cred,
        id: base64ToArrayBuffer(cred.id),
      })),
    };

    // Request credential from authenticator
    const credential = await navigator.credentials.get({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    // Prepare credential for sending to server
    const assertionResponse = credential.response as AuthenticatorAssertionResponse;
    
    const credentialId = arrayBufferToBase64(credential.rawId);
    const clientDataJSON = arrayBufferToBase64(assertionResponse.clientDataJSON);
    const authenticatorData = arrayBufferToBase64(assertionResponse.authenticatorData);
    const signature = arrayBufferToBase64(assertionResponse.signature);

    // Send assertion to server for verification
    const verificationResponse = await fetch('/api/webauthn/authenticate/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challengeId: options.challengeId,
        credential: {
          id: credentialId,
          type: credential.type,
          rawId: credentialId,
          clientDataJSON,
          authenticatorData,
          signature,
        },
      }),
    });

    const verificationResult = await verificationResponse.json();
    
    if (!verificationResult.success) {
      throw new Error(verificationResult.error || 'Authentication verification failed');
    }

    return {
      success: true,
      credential: {
        id: credentialId,
        type: credential.type,
        deviceType: getDeviceType()
      },
      ...verificationResult
    };
  } catch (error) {
    console.error('WebAuthn authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during authentication',
    };
  }
}

/**
 * Get the type of device being used
 * This is helpful for adapting the UI based on the device
 */
export function getDeviceType() {
  const ua = navigator.userAgent;
  
  // Detect operating system
  let os = null;
  let authenticatorType = null;
  
  // iOS detection
  if (/iPhone|iPad|iPod/.test(ua)) {
    if (/iPhone/.test(ua)) {
      os = "iOS";
      // iPhone X and newer use Face ID
      authenticatorType = /iPhone X/.test(ua) || /iPhone 1[1-9]/.test(ua) ? "faceID" : "touchID";
    } else if (/iPad/.test(ua)) {
      os = "iPadOS";
      authenticatorType = "touchID"; // Most iPads use Touch ID
    }
  } 
  // Android detection
  else if (/Android/.test(ua)) {
    os = "Android";
    authenticatorType = "fingerprint"; // Most Android devices use fingerprint
  }
  // macOS detection
  else if (/Mac OS X/.test(ua)) {
    os = "macOS";
    authenticatorType = "touchID"; // Modern Macs use Touch ID
  }
  // Windows detection
  else if (/Windows/.test(ua)) {
    os = "Windows";
    authenticatorType = "fingerprint"; // Windows Hello typically uses fingerprint or facial recognition
  }
  // Fallback
  else {
    os = "other";
    authenticatorType = "other";
  }
  
  return {
    os,
    authenticatorType,
    isMobile: /iPhone|iPad|iPod|Android/.test(ua),
    isDesktop: /Mac OS X|Windows|Linux/.test(ua),
    isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
    isChrome: /Chrome/.test(ua),
    isFirefox: /Firefox/.test(ua)
  };
}

/**
 * Register with hybrid authentication (WebAuthn + Face)
 * @param userId User ID to associate with this registration
 * @param username Username for display
 * @param faceImage Base64 encoded face image
 */
export async function registerHybrid(userId: string, username?: string, faceImage?: string) {
  try {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    if (!faceImage) {
      throw new Error('Face image is required for hybrid registration');
    }

    // Request registration options from server
    const response = await fetch('/api/webauthn/register/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        username,
        displayName: username
      }),
    });

    const options = await response.json();
    
    if (!options || response.status !== 200) {
      throw new Error(options.error || 'Failed to get registration options');
    }

    // Convert challenge from base64 to array buffer
    const publicKeyOptions = {
      ...options,
      challenge: base64ToArrayBuffer(options.challenge),
      user: {
        ...options.user,
        id: new TextEncoder().encode(options.user.id),
      },
    };

    // Create new credential
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    // Prepare credential for sending to server
    const attestationResponse = credential.response as AuthenticatorAttestationResponse;
    
    const credentialId = arrayBufferToBase64(credential.rawId);
    const clientDataJSON = arrayBufferToBase64(attestationResponse.clientDataJSON);
    const attestationObject = arrayBufferToBase64(attestationResponse.attestationObject);

    // Send credential and face image to server for hybrid verification
    const verificationResponse = await fetch('/api/webauthn/hybrid/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challengeId: options.challengeId,
        credential: {
          id: credentialId,
          type: credential.type,
          rawId: credentialId,
          clientDataJSON,
          attestationObject,
          publicKey: attestationObject,
          metadata: {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            deviceType: getDeviceType()
          }
        },
        faceImage
      }),
    });

    const verificationResult = await verificationResponse.json();
    
    if (!verificationResult.success) {
      throw new Error(verificationResult.error || 'Hybrid registration failed');
    }

    return {
      success: true,
      credential: {
        id: credentialId,
        type: credential.type,
        deviceType: getDeviceType()
      },
      faceDetails: verificationResult.faceDetails,
      ...verificationResult
    };
  } catch (error) {
    console.error('Hybrid registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during hybrid registration',
    };
  }
}

/**
 * Authenticate with hybrid verification (WebAuthn + Face)
 * @param userId User ID to authenticate
 * @param faceImage Base64 encoded face image (required for hybrid auth)
 */
export async function authenticateHybrid(userId: string, faceImage?: string) {
  try {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    // Request authentication options from server
    const response = await fetch('/api/webauthn/authenticate/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const options = await response.json();
    
    if (!options || response.status !== 200) {
      throw new Error(options.error || 'Failed to get authentication options');
    }

    // Convert challenge and credential IDs from base64 to array buffer
    const publicKeyOptions = {
      ...options,
      challenge: base64ToArrayBuffer(options.challenge),
      allowCredentials: options.allowCredentials.map((cred: any) => ({
        ...cred,
        id: base64ToArrayBuffer(cred.id),
      })),
    };

    // Request credential from authenticator
    const credential = await navigator.credentials.get({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    // Prepare credential for sending to server
    const assertionResponse = credential.response as AuthenticatorAssertionResponse;
    
    const credentialId = arrayBufferToBase64(credential.rawId);
    const clientDataJSON = arrayBufferToBase64(assertionResponse.clientDataJSON);
    const authenticatorData = arrayBufferToBase64(assertionResponse.authenticatorData);
    const signature = arrayBufferToBase64(assertionResponse.signature);

    // Send assertion to server for hybrid verification
    const verificationResponse = await fetch('/api/webauthn/hybrid/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challengeId: options.challengeId,
        credential: {
          id: credentialId,
          type: credential.type,
          rawId: credentialId,
          clientDataJSON,
          authenticatorData,
          signature,
        },
        faceImage
      }),
    });

    const verificationResult = await verificationResponse.json();
    
    if (!verificationResult.success) {
      throw new Error(verificationResult.error || 'Hybrid authentication failed');
    }

    return {
      success: true,
      credential: {
        id: credentialId,
        type: credential.type,
        deviceType: getDeviceType()
      },
      ...verificationResult
    };
  } catch (error) {
    console.error('Hybrid authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during hybrid authentication',
    };
  }
}