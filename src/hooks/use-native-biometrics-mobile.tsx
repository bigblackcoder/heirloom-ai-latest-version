
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

type BiometricType = 'fingerprint' | 'facial' | 'iris';

interface BiometricResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

export function useNativeBiometricsMobile() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<BiometricType[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lastResult, setLastResult] = useState<BiometricResult | null>(null);

  // Check biometric availability on component mount
  useEffect(() => {
    async function checkBiometricAvailability() {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsAvailable(compatible);

        if (compatible) {
          const enrolledTypes = await LocalAuthentication.isEnrolledAsync();
          if (enrolledTypes) {
            // Get available biometric types
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const mappedTypes: BiometricType[] = [];
            
            if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
              mappedTypes.push('fingerprint');
            }
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
              mappedTypes.push('facial');
            }
            if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
              mappedTypes.push('iris');
            }
            
            setBiometricTypes(mappedTypes);
          }
        }
      } catch (error) {
        console.error('Error checking biometric availability:', error);
      }
    }

    checkBiometricAvailability();
  }, []);

  // Authenticate with native biometrics
  const authenticate = async (
    promptMessage: string = 'Authenticate to continue',
    fallbackLabel: string = 'Use Passcode'
  ): Promise<BiometricResult> => {
    try {
      setIsAuthenticating(true);
      
      // Check if hardware is available
      if (!isAvailable) {
        const result = { success: false, error: 'Biometric hardware not available' };
        setLastResult(result);
        return result;
      }

      // Authenticate using biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel,
        disableDeviceFallback: false,
        cancelLabel: 'Cancel'
      });

      // Handle authentication result
      if (result.success) {
        // Determine which biometric type was used (this is an approximation as the API doesn't directly tell us)
        let usedType: BiometricType = 'fingerprint'; // Default assumption
        
        if (Platform.OS === 'ios' && biometricTypes.includes('facial')) {
          usedType = 'facial'; // On iOS, if facial is available, it's likely Face ID was used
        } else if (biometricTypes.length > 0) {
          usedType = biometricTypes[0]; // Use the first available type as best guess
        }
        
        const successResult = { 
          success: true, 
          biometricType: usedType 
        };
        
        setLastResult(successResult);
        return successResult;
      } else {
        const errorResult = { 
          success: false, 
          error: result.error ? String(result.error) : 'Authentication failed or canceled'
        };
        setLastResult(errorResult);
        return errorResult;
      }
    } catch (error) {
      const errorResult = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Create a hybrid verification function that combines DeepFace and native biometrics
  const hybridVerification = async (
    faceImageBase64: string,
    userId: string,
    useNative: boolean = true
  ): Promise<{
    success: boolean;
    nativeVerified: boolean;
    deepfaceVerified: boolean;
    confidence: number;
    error?: string;
  }> => {
    try {
      let nativeResult = { success: false };
      
      // Step 1: Try native verification if requested
      if (useNative && isAvailable && biometricTypes.includes('facial')) {
        nativeResult = await authenticate('Verify your identity', 'Use Alternative Method');
      }
      
      // Step 2: Always perform DeepFace verification
      const deepfaceResult = await verifyWithDeepFace(faceImageBase64, userId);
      
      // Step 3: Combine results
      // Successful if either native or DeepFace verification succeeds (or both)
      const combinedSuccess = nativeResult.success || deepfaceResult.success;
      
      return {
        success: combinedSuccess,
        nativeVerified: nativeResult.success,
        deepfaceVerified: deepfaceResult.success,
        confidence: deepfaceResult.confidence || 0,
        error: !combinedSuccess ? (deepfaceResult.error || 'Verification failed') : undefined
      };
    } catch (error) {
      return {
        success: false,
        nativeVerified: false,
        deepfaceVerified: false,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error during hybrid verification'
      };
    }
  };

  // Helper function to call DeepFace API
  const verifyWithDeepFace = async (
    faceImageBase64: string,
    userId: string
  ): Promise<{
    success: boolean;
    confidence?: number;
    error?: string;
  }> => {
    try {
      // Make API call to your server's DeepFace endpoint
      const response = await fetch('/api/verification/face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: faceImageBase64,
          userId,
          saveToDb: false, // Don't save during verification, just verify
          requestId: Math.random().toString(36).substring(2, 15)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          confidence: data.confidence || 0.95
        };
      } else {
        return {
          success: false,
          error: data.message || 'Face verification failed'
        };
      }
    } catch (error) {
      console.error('DeepFace verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network or server error'
      };
    }
  };

  return {
    isAvailable,
    biometricTypes,
    isAuthenticating,
    lastResult,
    authenticate,
    hybridVerification
  };
}
