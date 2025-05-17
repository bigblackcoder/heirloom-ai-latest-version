import { useState, useEffect } from 'react';
import { 
  isWebAuthnSupported, 
  isBiometricAvailable, 
  detectBiometricType, 
  registerBiometricCredential, 
  authenticateWithBiometric
} from '../utils/webAuthn';

type BiometricType = 'faceId' | 'fingerprint' | 'other';

interface BiometricAuthHook {
  isSupported: boolean;
  isAvailable: boolean;
  biometricType: BiometricType;
  isLoading: boolean;
  error: string | null;
  register: (userId: string, username: string) => Promise<boolean>;
  authenticate: (credentialId?: string) => Promise<boolean>;
}

export function useBiometricAuth(): BiometricAuthHook {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('other');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkBiometricCapabilities() {
      try {
        // Check if WebAuthn is supported by this browser
        const supported = isWebAuthnSupported();
        setIsSupported(supported);
        
        if (supported) {
          // Check if device has biometric capabilities
          const available = await isBiometricAvailable();
          setIsAvailable(available);
          
          // Detect type of biometric method available
          const type = detectBiometricType();
          setBiometricType(type);
        }
      } catch (err) {
        console.error('Error checking biometric capabilities:', err);
        setError('Failed to detect biometric capabilities');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkBiometricCapabilities();
  }, []);

  /**
   * Register a new biometric credential
   * @param userId - User's unique identifier
   * @param username - User's username or display name
   * @returns Promise resolving to success status
   */
  async function register(userId: string, username: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isSupported) {
        throw new Error('WebAuthn is not supported in this browser');
      }
      
      if (!isAvailable) {
        throw new Error('No biometric authenticator available on this device');
      }
      
      const result = await registerBiometricCredential(userId, username);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to register biometric credential');
      }
      
      // In a real implementation, you'd send the credential ID to your server
      console.log(`Registered credential ID: ${result.credentialId}`);
      
      return true;
    } catch (err: any) {
      console.error('Error registering biometric:', err);
      setError(err.message || 'Failed to register biometric credential');
      return false;
    } finally {
      setIsLoading(false);
    }
  }
  
  /**
   * Authenticate using biometric
   * @param credentialId - Optional credential ID to use for authentication
   * @returns Promise resolving to authentication success status
   */
  async function authenticate(credentialId?: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isSupported) {
        throw new Error('WebAuthn is not supported in this browser');
      }
      
      if (!isAvailable) {
        throw new Error('No biometric authenticator available on this device');
      }
      
      const result = await authenticateWithBiometric(credentialId);
      
      if (!result.success) {
        throw new Error(result.error || 'Biometric verification failed');
      }
      
      // In a real implementation, you'd verify this with your server
      console.log(`Authenticated user: ${result.userId}`);
      
      return true;
    } catch (err: any) {
      console.error('Error authenticating with biometric:', err);
      setError(err.message || 'Biometric verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }
  
  return {
    isSupported,
    isAvailable,
    biometricType,
    isLoading,
    error,
    register,
    authenticate,
  };
}