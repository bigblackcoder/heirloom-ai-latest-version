/**
 * WebAuthn utility functions for the client side
 * This file contains functions for registering and authenticating with device biometrics
 */

// Base64 encoding/decoding utilities
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Start the registration process for WebAuthn
 * 
 * @param userId - User ID to associate with the credential
 * @param username - Optional username for the credential
 * @returns Promise with the registration result
 */
export async function startRegistration(userId: string, username?: string): Promise<any> {
  try {
    // 1. Get the challenge from the server
    const challengeResponse = await fetch(`/api/webauthn/register/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username: username || 'user' })
    });
    
    if (!challengeResponse.ok) {
      const error = await challengeResponse.json();
      throw new Error(error.message || 'Failed to start registration');
    }
    
    const challengeData = await challengeResponse.json();
    
    // 2. Prepare the credential creation options
    const publicKeyCredentialCreationOptions = {
      challenge: base64ToBuffer(challengeData.challenge),
      rp: {
        name: 'Heirloom Identity Platform',
        id: window.location.hostname
      },
      user: {
        id: base64ToBuffer(btoa(userId.toString())),
        name: username || 'user',
        displayName: username || 'User'
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false
      }
    };
    
    // 3. Create the credential using WebAuthn API
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions as PublicKeyCredentialCreationOptions
    }) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error('Failed to create credential');
    }
    
    // 4. Format the response to send back to server
    const attestationResponse = credential.response as AuthenticatorAttestationResponse;
    
    const registrationResult = {
      id: credential.id,
      rawId: bufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        attestationObject: bufferToBase64(attestationResponse.attestationObject),
        clientDataJSON: bufferToBase64(attestationResponse.clientDataJSON)
      },
      challengeId: challengeData.id,
      faceImage: null // This will be set by the verification component if face image is captured
    };
    
    // 5. Complete registration with the server
    const completeResponse = await fetch(`/api/webauthn/register/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationResult)
    });
    
    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.message || 'Failed to complete registration');
    }
    
    const completeData = await completeResponse.json();
    return { success: true, ...completeData };
    
  } catch (error) {
    console.error('WebAuthn registration error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Registration failed' 
    };
  }
}

/**
 * Start the authentication process for WebAuthn
 * 
 * @param userId - User ID to authenticate
 * @returns Promise with the authentication result
 */
export async function startAuthentication(userId: string): Promise<any> {
  try {
    // 1. Get the challenge from the server
    const challengeResponse = await fetch(`/api/webauthn/authenticate/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (!challengeResponse.ok) {
      const error = await challengeResponse.json();
      throw new Error(error.message || 'Failed to start authentication');
    }
    
    const challengeData = await challengeResponse.json();
    
    // 2. Prepare the credential request options
    const publicKeyCredentialRequestOptions = {
      challenge: base64ToBuffer(challengeData.challenge),
      rpId: window.location.hostname,
      timeout: 60000,
      userVerification: 'preferred',
      allowCredentials: challengeData.allowCredentials?.map((credential: any) => ({
        id: base64ToBuffer(credential.id),
        type: 'public-key',
        transports: ['internal']
      })) || []
    };
    
    // 3. Get the credential using WebAuthn API
    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions as PublicKeyCredentialRequestOptions
    }) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error('Failed to get credential');
    }
    
    // 4. Format the response to send back to server
    const assertionResponse = credential.response as AuthenticatorAssertionResponse;
    
    const authenticationResult = {
      id: credential.id,
      rawId: bufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        authenticatorData: bufferToBase64(assertionResponse.authenticatorData),
        clientDataJSON: bufferToBase64(assertionResponse.clientDataJSON),
        signature: bufferToBase64(assertionResponse.signature),
        userHandle: assertionResponse.userHandle ? bufferToBase64(assertionResponse.userHandle) : null
      },
      challengeId: challengeData.id,
      faceImage: null // This will be set by the verification component if face image is captured
    };
    
    // 5. Complete authentication with the server
    const completeResponse = await fetch(`/api/webauthn/authenticate/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authenticationResult)
    });
    
    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.message || 'Failed to complete authentication');
    }
    
    const completeData = await completeResponse.json();
    return { success: true, ...completeData };
    
  } catch (error) {
    console.error('WebAuthn authentication error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}