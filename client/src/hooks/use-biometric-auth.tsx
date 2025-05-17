import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

type BiometricType = 'face' | 'fingerprint' | 'both' | 'none';

interface BiometricAuthHook {
  isSupported: boolean;
  isBusy: boolean;
  biometricType: BiometricType;
  error: string | null;
  registerBiometric: (userId: string) => Promise<any>;
  verifyBiometric: (userId: string) => Promise<any>;
}

interface Challenge {
  challenge: string;
  credentialId?: string;
}

export function useBiometricAuth(): BiometricAuthHook {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [error, setError] = useState<string | null>(null);

  // Check device compatibility on mount
  useEffect(() => {
    checkDeviceSupport();
  }, []);

  const checkDeviceSupport = async () => {
    try {
      // Check if WebAuthn is supported
      if (window.PublicKeyCredential === undefined) {
        setIsSupported(false);
        setBiometricType('none');
        return;
      }

      // Check platform authenticator availability
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsSupported(available);

      // Detect likely biometric type based on user agent
      const ua = navigator.userAgent.toLowerCase();
      
      if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('macintosh')) {
        // Apple devices typically use Face ID or Touch ID
        if (ua.includes('iphone x') || ua.includes('iphone 1') || ua.includes('iphone 2')) {
          setBiometricType('face'); // Newer iPhones use Face ID
        } else {
          setBiometricType('fingerprint'); // Older iPhones and iPads use Touch ID
        }
      } else if (ua.includes('android')) {
        // Most Android devices have fingerprint sensors
        setBiometricType('fingerprint');
      } else if (ua.includes('windows') && available) {
        // Windows Hello could be face or fingerprint
        setBiometricType('both');
      } else {
        setBiometricType('none');
      }
    } catch (err) {
      console.error('Error checking biometric support:', err);
      setIsSupported(false);
      setBiometricType('none');
    }
  };

  const getChallenge = async (userId: string, forVerification = false): Promise<Challenge> => {
    try {
      const endpoint = forVerification 
        ? '/api/biometrics/challenge/verify' 
        : '/api/biometrics/challenge/register';
      
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: { userId }
      });
      
      return response as Challenge;
    } catch (err: any) {
      console.error('Error getting challenge:', err);
      throw new Error(err.message || 'Failed to get authentication challenge');
    }
  };

  const registerBiometric = async (userId: string) => {
    setError(null);
    setIsBusy(true);
    
    try {
      // Get challenge from server
      const challenge = await getChallenge(userId);
      
      // Request credential creation from browser
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(challenge.challenge, c => c.charCodeAt(0)),
          rp: {
            name: 'Heirloom Identity Platform',
            id: window.location.hostname
          },
          user: {
            id: Uint8Array.from(userId, c => c.charCodeAt(0)),
            name: `user-${userId}`,
            displayName: `User ${userId}`
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 } // ES256
          ],
          timeout: 60000,
          attestation: 'direct',
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          }
        }
      });
      
      if (!credential) {
        throw new Error('Failed to create credential');
      }
      
      // Format credential for server
      const publicKeyCredential = credential as PublicKeyCredential;
      const response = publicKeyCredential.response as AuthenticatorAttestationResponse;
      
      // Convert ArrayBuffer to base64
      const attestationObj = btoa(
        String.fromCharCode(...new Uint8Array(response.attestationObject))
      );
      const clientDataJSON = btoa(
        String.fromCharCode(...new Uint8Array(response.clientDataJSON))
      );
      
      // Submit to server
      const registrationResult = await apiRequest('/api/biometrics/register', {
        method: 'POST',
        body: {
          userId,
          credentialId: btoa(
            String.fromCharCode(...new Uint8Array(publicKeyCredential.rawId))
          ),
          attestationObj,
          clientDataJSON,
          type: publicKeyCredential.type
        }
      });
      
      return registrationResult;
    } catch (err: any) {
      console.error('Biometric registration error:', err);
      setError(err.message || 'Failed to register biometric credential');
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  const verifyBiometric = async (userId: string) => {
    setError(null);
    setIsBusy(true);
    
    try {
      // Get challenge from server
      const challenge = await getChallenge(userId, true);
      
      if (!challenge.credentialId) {
        throw new Error('No biometric credential found for this user');
      }
      
      // Convert base64 credentialId to ArrayBuffer
      const credentialIdArray = Uint8Array.from(
        atob(challenge.credentialId), c => c.charCodeAt(0)
      );
      
      // Request assertion from browser
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(challenge.challenge, c => c.charCodeAt(0)),
          allowCredentials: [{
            id: credentialIdArray.buffer,
            type: 'public-key',
            transports: ['internal']
          }],
          timeout: 60000,
          userVerification: 'required'
        }
      });
      
      if (!assertion) {
        throw new Error('Biometric verification failed');
      }
      
      // Format assertion for server
      const publicKeyCredential = assertion as PublicKeyCredential;
      const response = publicKeyCredential.response as AuthenticatorAssertionResponse;
      
      // Convert ArrayBuffer to base64
      const authenticatorData = btoa(
        String.fromCharCode(...new Uint8Array(response.authenticatorData))
      );
      const clientDataJSON = btoa(
        String.fromCharCode(...new Uint8Array(response.clientDataJSON))
      );
      const signature = btoa(
        String.fromCharCode(...new Uint8Array(response.signature))
      );
      
      // Submit to server
      const verificationResult = await apiRequest('/api/biometrics/verify', {
        method: 'POST',
        body: {
          userId,
          credentialId: challenge.credentialId,
          authenticatorData,
          clientDataJSON,
          signature,
          userHandle: response.userHandle 
            ? btoa(String.fromCharCode(...new Uint8Array(response.userHandle))) 
            : null
        }
      });
      
      return verificationResult;
    } catch (err: any) {
      console.error('Biometric verification error:', err);
      setError(err.message || 'Failed to verify biometric credential');
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  return {
    isSupported,
    isBusy,
    biometricType,
    error,
    registerBiometric,
    verifyBiometric
  };
}