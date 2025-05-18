/**
 * WebAuthn client utility functions
 * Handles communication with the WebAuthn API endpoints
 */

/**
 * Converts a base64 string to a Uint8Array
 * @param base64 Base64 encoded string
 * @returns Uint8Array representation
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
 * Converts an ArrayBuffer to a base64 string
 * @param buffer ArrayBuffer to convert
 * @returns Base64 encoded string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Starts the WebAuthn registration process
 * @param userId User ID for registration
 * @param username Optional username
 * @returns Promise resolving to registration result
 */
export async function startRegistration(userId: string, username?: string): Promise<any> {
  try {
    // Step 1: Get registration options from server
    const response = await fetch('/api/webauthn/registration/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start registration');
    }
    
    const options = await response.json();
    
    // Convert base64 challenge to ArrayBuffer
    options.publicKey.challenge = base64ToArrayBuffer(options.publicKey.challenge);
    
    // Convert base64 user ID to ArrayBuffer
    if (options.publicKey.user && options.publicKey.user.id) {
      options.publicKey.user.id = base64ToArrayBuffer(options.publicKey.user.id);
    }
    
    // Step 2: Create credentials with browser's WebAuthn API
    const credential = await navigator.credentials.create({
      publicKey: options.publicKey
    }) as PublicKeyCredential;
    
    // Step 3: Get attestation response for sending to server
    const attestationResponse = credential.response as AuthenticatorAttestationResponse;
    
    // Prepare response data
    const registrationResponse = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64(attestationResponse.clientDataJSON),
        attestationObject: arrayBufferToBase64(attestationResponse.attestationObject),
      },
      type: credential.type
    };
    
    // Step 4: Send attestation to server
    const verificationResponse = await fetch('/api/webauthn/registration/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        credential: registrationResponse
      })
    });
    
    if (!verificationResponse.ok) {
      const error = await verificationResponse.json();
      throw new Error(error.message || 'Failed to complete registration');
    }
    
    // Return server response
    return await verificationResponse.json();
    
  } catch (error: any) {
    console.error('WebAuthn registration error:', error);
    return {
      success: false,
      message: error.message || 'Failed to complete registration'
    };
  }
}

/**
 * Starts the WebAuthn authentication process
 * @param userId User ID for authentication
 * @returns Promise resolving to authentication result
 */
export async function startAuthentication(userId: string): Promise<any> {
  try {
    // Step 1: Get authentication options from server
    const response = await fetch('/api/webauthn/authentication/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start authentication');
    }
    
    const options = await response.json();
    
    // Convert base64 challenge to ArrayBuffer
    options.publicKey.challenge = base64ToArrayBuffer(options.publicKey.challenge);
    
    // Convert credential IDs from base64 to ArrayBuffer
    if (options.publicKey.allowCredentials) {
      options.publicKey.allowCredentials = options.publicKey.allowCredentials.map((credential: any) => {
        return {
          ...credential,
          id: base64ToArrayBuffer(credential.id)
        };
      });
    }
    
    // Step 2: Get credentials with browser's WebAuthn API
    const credential = await navigator.credentials.get({
      publicKey: options.publicKey
    }) as PublicKeyCredential;
    
    // Step 3: Get assertion response for sending to server
    const assertionResponse = credential.response as AuthenticatorAssertionResponse;
    
    // Prepare response data
    const authenticationResponse = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      response: {
        clientDataJSON: arrayBufferToBase64(assertionResponse.clientDataJSON),
        authenticatorData: arrayBufferToBase64(assertionResponse.authenticatorData),
        signature: arrayBufferToBase64(assertionResponse.signature),
        userHandle: assertionResponse.userHandle ? 
          arrayBufferToBase64(assertionResponse.userHandle) : null,
      },
      type: credential.type
    };
    
    // Step 4: Send assertion to server
    const verificationResponse = await fetch('/api/webauthn/authentication/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        credential: authenticationResponse
      })
    });
    
    if (!verificationResponse.ok) {
      const error = await verificationResponse.json();
      throw new Error(error.message || 'Failed to complete authentication');
    }
    
    // Return server response
    return await verificationResponse.json();
    
  } catch (error: any) {
    console.error('WebAuthn authentication error:', error);
    return {
      success: false,
      message: error.message || 'Failed to complete authentication'
    };
  }
}