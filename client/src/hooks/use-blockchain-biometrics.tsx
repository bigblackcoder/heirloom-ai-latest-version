import { useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useNativeBiometrics } from './use-native-biometrics';
import { apiRequest } from '../lib/queryClient';

/**
 * This hook combines native device biometrics with blockchain metadata storage
 * The actual biometric data stays on the device, while only metadata is stored on-chain
 */

interface BlockchainMetadata {
  credentialId: string;
  authenticatorType: string;
  registrationTime: string;
  deviceId?: string;
}

export function useBlockchainBiometrics() {
  const { user } = useAuth();
  const { 
    isAvailable, 
    biometricType, 
    authenticate, 
    checkBiometricAvailability 
  } = useNativeBiometrics();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registeredCredential, setRegisteredCredential] = useState<string | null>(null);
  
  // Register a new biometric credential and store metadata on blockchain
  const registerBiometric = useCallback(async () => {
    if (!user?.id) {
      throw new Error('User must be authenticated to register biometrics');
    }
    
    if (!isAvailable) {
      throw new Error('Native biometrics not available on this device');
    }
    
    try {
      setIsRegistering(true);
      
      // 1. Verify the user's identity with device biometrics first
      const authResult = await authenticate();
      if (!authResult) {
        throw new Error('Biometric authentication failed');
      }
      
      // 2. Generate a credential ID (normally this would be from WebAuthn)
      const credentialId = `${biometricType}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // 3. Register metadata with the blockchain (NOT the actual biometric data)
      const metadata: BlockchainMetadata = {
        credentialId,
        authenticatorType: biometricType || 'unknown',
        registrationTime: new Date().toISOString(),
        deviceId: navigator.userAgent // This is just for demo purposes
      };
      
      // 4. Call API to store metadata on blockchain
      const result = await apiRequest('/api/blockchain/register-contract', {
        method: 'POST',
        data: {
          userId: user.id,
          contractType: 'biometric-credential',
          metadata
        }
      });
      
      // 5. Store credential ID for future use
      setRegisteredCredential(credentialId);
      localStorage.setItem('biometricCredentialId', credentialId);
      
      return {
        success: true,
        credentialId,
        contractAddress: result.contractAddress
      };
    } catch (error) {
      console.error('Error registering biometric with blockchain:', error);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  }, [user, isAvailable, authenticate, biometricType]);
  
  // Verify user with biometrics and log verification on blockchain
  const verifyBiometric = useCallback(async () => {
    if (!user?.id) {
      throw new Error('User must be authenticated to verify biometrics');
    }
    
    // Get stored credential ID
    const credentialId = registeredCredential || localStorage.getItem('biometricCredentialId');
    if (!credentialId) {
      throw new Error('No registered biometric credential found');
    }
    
    try {
      setIsVerifying(true);
      
      // 1. Authenticate with device biometrics
      const authResult = await authenticate();
      if (!authResult) {
        throw new Error('Biometric authentication failed');
      }
      
      // 2. Log the successful verification to the blockchain
      const result = await apiRequest('/api/blockchain/verify-onchain', {
        method: 'POST',
        data: {
          userId: user.id,
          credentialId,
          verificationType: 'biometric',
          verificationTime: new Date().toISOString(),
          authenticatorType: biometricType
        }
      });
      
      return {
        success: true,
        verified: true,
        blockchainResult: result
      };
    } catch (error) {
      console.error('Error verifying biometric with blockchain:', error);
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, [user, authenticate, biometricType, registeredCredential]);
  
  // Check if user has registered biometrics
  const checkRegistration = useCallback(async () => {
    if (!user?.id) {
      return false;
    }
    
    try {
      // Check local storage first
      const localCredentialId = localStorage.getItem('biometricCredentialId');
      if (localCredentialId) {
        setRegisteredCredential(localCredentialId);
        return true;
      }
      
      // If not found locally, check blockchain
      const result = await apiRequest(`/api/blockchain/user-credentials/${user.id}`, {
        method: 'GET'
      });
      
      const hasBiometrics = result.credentials?.some(
        (cred: any) => cred.type === 'biometric-credential'
      );
      
      if (hasBiometrics && result.credentials?.[0]?.id) {
        setRegisteredCredential(result.credentials[0].id);
        localStorage.setItem('biometricCredentialId', result.credentials[0].id);
      }
      
      return hasBiometrics;
    } catch (error) {
      console.error('Error checking biometric registration:', error);
      return false;
    }
  }, [user]);
  
  return {
    isAvailable,
    biometricType,
    isRegistering,
    isVerifying,
    registeredCredential,
    registerBiometric,
    verifyBiometric,
    checkRegistration,
    checkBiometricAvailability
  };
}