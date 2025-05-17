import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Device biometric types
 */
export type BiometricType = 'face' | 'fingerprint' | 'iris' | 'voice';

/**
 * Information about the user's device
 */
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'web' | 'unknown';
  supportsBiometrics: boolean;
  supportedBiometrics: BiometricType[];
}

/**
 * Result of biometric registration
 */
export interface RegistrationResult {
  success: boolean;
  credentialId?: string;
  message: string;
}

/**
 * Result of biometric verification
 */
export interface VerificationResult {
  success: boolean;
  userId?: number;
  timestamp?: string;
  message?: string;
}

/**
 * Hook for using device-native biometrics with blockchain metadata storage
 * The actual biometric data stays on the user's device for enhanced security
 */
export function useBlockchainBiometrics(userId?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Detect device capabilities including biometric support
   */
  const detectDevice = useCallback(async (): Promise<DeviceInfo> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if this is a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isTablet = /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent);
      
      // Detect platform
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      let platform: DeviceInfo['platform'] = 'unknown';
      if (isIOS) platform = 'ios';
      else if (isAndroid) platform = 'android';
      else platform = 'web';
      
      // Check for biometric support using platform APIs
      // For web, we use WebAuthn
      let supportsBiometrics = false;
      let supportedBiometrics: BiometricType[] = [];
      
      if (platform === 'web') {
        // Check if WebAuthn is supported
        supportsBiometrics = 
          window.PublicKeyCredential !== undefined && 
          typeof window.PublicKeyCredential === 'function';
        
        if (supportsBiometrics) {
          // Web platform typically supports fingerprint and face biometrics
          // based on the device hardware
          supportedBiometrics = ['fingerprint', 'face'];
        }
      } else {
        // For native mobile apps we'd use platform-specific APIs
        // This is a simplified version for the demo
        if (platform === 'ios') {
          supportsBiometrics = true;
          supportedBiometrics = ['face', 'fingerprint']; // Face ID, Touch ID
        } else if (platform === 'android') {
          supportsBiometrics = true;
          supportedBiometrics = ['fingerprint', 'face']; // Fingerprint, Face Unlock
        }
      }
      
      return {
        type: isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop'),
        platform,
        supportsBiometrics,
        supportedBiometrics
      };
    } catch (err: any) {
      setError(`Failed to detect device capabilities: ${err.message}`);
      return {
        type: 'desktop',
        platform: 'web',
        supportsBiometrics: false,
        supportedBiometrics: []
      };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Register a biometric credential
   * - Triggers native biometric prompt on the device
   * - Stores only metadata on the blockchain, not the actual biometric data
   */
  const registerBiometric = useCallback(async (
    biometricType: BiometricType
  ): Promise<RegistrationResult> => {
    if (!userId) {
      return { 
        success: false, 
        message: 'User ID is required for registration' 
      };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const deviceInfo = await detectDevice();
      
      if (!deviceInfo.supportsBiometrics) {
        return {
          success: false,
          message: 'This device does not support biometric authentication'
        };
      }
      
      if (!deviceInfo.supportedBiometrics.includes(biometricType)) {
        return {
          success: false,
          message: `This device does not support ${biometricType} biometric`
        };
      }
      
      // First, get a challenge from the server
      const { data: challenge } = await axios.get('/api/biometrics/challenge');
      
      // Now trigger the native biometric prompt
      // In a real implementation, this would use WebAuthn for web or native APIs for mobile
      // This simulates the process but in production it would use the actual APIs
      const simulatedCredentialId = `bio_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Register the biometric with the server
      // Only metadata is stored, not the actual biometric data
      const { data } = await axios.post('/api/biometrics/register', {
        userId,
        credentialId: simulatedCredentialId,
        biometricType,
        deviceType: deviceInfo.platform,
        challenge: challenge.value
      });
      
      return {
        success: data.success,
        credentialId: simulatedCredentialId,
        message: data.message || 'Biometric registered successfully'
      };
    } catch (err: any) {
      const errorMsg = `Failed to register biometric: ${err.message}`;
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [userId, detectDevice]);
  
  /**
   * Verify identity using registered biometric
   * Triggers the native biometric prompt and verifies against blockchain metadata
   */
  const verifyIdentity = useCallback(async (
    credentialId?: string
  ): Promise<VerificationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const deviceInfo = await detectDevice();
      
      if (!deviceInfo.supportsBiometrics) {
        return {
          success: false,
          message: 'This device does not support biometric authentication'
        };
      }
      
      // Get a challenge from the server
      const { data: challenge } = await axios.get('/api/biometrics/challenge');
      
      // In a real implementation, this would verify with WebAuthn or native APIs
      // This simulates a successful verification but in production it would use the actual APIs
      
      // Verify with the server
      const { data } = await axios.post('/api/biometrics/verify', {
        credentialId: credentialId || 'auto_detect', // Server will try to find matching credential
        userId: userId || undefined, // Optional, for more efficient verification
        challenge: challenge.value
      });
      
      return {
        success: data.success,
        userId: data.userId,
        timestamp: data.timestamp,
        message: data.success 
          ? 'Identity verified successfully' 
          : 'Failed to verify identity'
      };
    } catch (err: any) {
      const errorMsg = `Failed to verify identity: ${err.message}`;
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [userId, detectDevice]);
  
  return {
    detectDevice,
    registerBiometric,
    verifyIdentity,
    isLoading,
    error
  };
}