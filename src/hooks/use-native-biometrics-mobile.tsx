
import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NativeBiometricsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useNativeBiometricsMobile({ onSuccess, onError }: NativeBiometricsProps = {}) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<'faceId' | 'touchId' | 'fingerprint' | 'face' | 'none'>('none');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if biometrics are available on this device
  const checkBiometricAvailability = useCallback(async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        setIsAvailable(false);
        return;
      }
      
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        setIsAvailable(false);
        return;
      }
      
      setIsAvailable(true);
      
      // Determine biometric type
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (Platform.OS === 'ios') {
        // Check if device supports Face ID
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('faceId');
        } 
        // Otherwise it's likely Touch ID
        else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('touchId');
        }
      } else if (Platform.OS === 'android') {
        // On Android, check if device supports fingerprint or face recognition
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('face');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  }, []);

  // Initialize on component mount
  useEffect(() => {
    checkBiometricAvailability();
    
    // Check if user has previously disabled native biometrics
    AsyncStorage.getItem('preferNativeBiometrics').then(value => {
      if (value === 'false') {
        setIsAvailable(false);
      }
    });
  }, [checkBiometricAvailability]);

  // Authenticate with device biometrics
  const authenticate = useCallback(async () => {
    if (!isAvailable) {
      const errorMsg = 'Biometric authentication not available on this device';
      console.error(errorMsg);
      onError?.(errorMsg);
      return false;
    }

    try {
      setIsAuthenticating(true);
      
      // Use device biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        fallbackLabel: 'Use passcode instead',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel'
      });
      
      if (result.success) {
        console.log('Biometric authentication successful');
        onSuccess?.();
        return true;
      } else {
        const errorMsg = result.error || 'Authentication failed';
        console.error('Biometric authentication failed:', errorMsg);
        onError?.(errorMsg);
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during biometric authentication';
      console.error('Biometric authentication error:', error);
      onError?.(errorMsg);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAvailable, onSuccess, onError]);

  return {
    isAvailable,
    biometricType,
    isAuthenticating,
    authenticate,
    checkBiometricAvailability
  };
}
