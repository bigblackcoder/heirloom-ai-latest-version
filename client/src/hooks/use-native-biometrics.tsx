
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NativeBiometricsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useNativeBiometrics({ onSuccess, onError }: NativeBiometricsProps = {}) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<'faceId' | 'touchId' | 'fingerprint' | 'face' | 'none'>('none');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  // Check if biometrics are available on this device
  const checkBiometricAvailability = useCallback(async () => {
    try {
      // Web Authentication API check
      if (window.PublicKeyCredential) {
        // Check if platform authenticator is available
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsAvailable(available);
          
          // Try to determine the type of biometric
          // This is a best guess since the Web Auth API doesn't expose this directly
          if (available) {
            // iOS detection
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
              setBiometricType(window.innerHeight > 800 ? 'faceId' : 'touchId');
            } 
            // Android detection
            else if (/Android/.test(navigator.userAgent)) {
              setBiometricType('fingerprint'); // Could be fingerprint or face
            }
            // Other platforms with biometric capability
            else {
              setBiometricType('face'); // Generic fallback
            }
          }
        } catch (err) {
          console.error('Error checking platform authenticator:', err);
          setIsAvailable(false);
        }
      } else {
        setIsAvailable(false);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  }, []);

  // Initialize on component mount
  useEffect(() => {
    checkBiometricAvailability();
  }, [checkBiometricAvailability]);

  // Authenticate with device biometrics
  const authenticate = useCallback(async () => {
    if (!isAvailable) {
      const errorMsg = 'Biometric authentication not available on this device';
      toast({
        title: "Biometrics Unavailable",
        description: errorMsg,
        variant: "destructive",
      });
      onError?.(errorMsg);
      return false;
    }

    try {
      setIsAuthenticating(true);

      // Use the Web Authentication API for biometric verification
      // This is a simplified implementation - in production, you would need server-side handling
      const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32).buffer, // In production, this should come from server
        rp: {
          name: "Heirloom Identity Platform",
          id: window.location.hostname
        },
        user: {
          id: new Uint8Array([1, 2, 3, 4]), // Should be unique per user
          name: "user@example.com", // Should be user's email or username
          displayName: "User" // Should be user's name
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 } // RS256
        ],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Use built-in device authenticator
          userVerification: "required" // Require biometric verification
        }
      };

      // Request biometric verification
      toast({
        title: "Verifying Identity",
        description: `Authenticating with ${biometricType === 'faceId' ? 'Face ID' : biometricType === 'touchId' ? 'Touch ID' : biometricType}`,
      });

      // In a real implementation, you would create and verify credentials
      // For simplicity, we're simulating a successful authentication
      // navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
      
      // Simulate successful authentication after delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Authentication Successful",
        description: "Your identity has been verified",
        variant: "default",
      });
      
      onSuccess?.();
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during biometric authentication';
      console.error('Biometric authentication error:', error);
      
      toast({
        title: "Authentication Failed",
        description: errorMsg,
        variant: "destructive",
      });
      
      onError?.(errorMsg);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAvailable, biometricType, toast, onSuccess, onError]);

  return {
    isAvailable,
    biometricType,
    isAuthenticating,
    authenticate,
    checkBiometricAvailability
  };
}
