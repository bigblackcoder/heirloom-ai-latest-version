
import { useState, useCallback } from "react";

type BiometricMethod = "face" | "fingerprint" | "none";
type BiometricPlatform = "apple" | "google" | "windows" | "other";

interface BiometricResult {
  success: boolean;
  verified?: boolean;
  method?: string;
  error?: string;
  details?: any;
}

/**
 * Hook to handle native biometric authentication
 */
export const useNativeBiometrics = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [availableMethods, setAvailableMethods] = useState<BiometricMethod[]>([]);
  const [platform, setPlatform] = useState<BiometricPlatform>("other");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if biometrics are supported on this device
  const checkSupport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check platform
      const ua = navigator.userAgent;
      let detectedPlatform: BiometricPlatform = "other";
      
      if (/iPhone|iPad|iPod/i.test(ua)) {
        detectedPlatform = "apple";
        setAvailableMethods(["face"]);
        setIsSupported(true);
      } else if (/Android/i.test(ua)) {
        detectedPlatform = "google";
        setAvailableMethods(["fingerprint", "face"]);
        setIsSupported(true);
      } else if (/Windows/i.test(ua)) {
        detectedPlatform = "windows";
        // Windows Hello support check would go here
        const windowsHelloSupported = false; // This would be a real check in production
        setIsSupported(windowsHelloSupported);
        if (windowsHelloSupported) {
          setAvailableMethods(["face", "fingerprint"]);
        }
      }
      
      setPlatform(detectedPlatform);
      
      // Check WebAuthn/FIDO2 support
      if (window.PublicKeyCredential) {
        const publicKeyCredentialSupport = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        
        if (publicKeyCredentialSupport) {
          setIsSupported(true);
          // If we already detected methods based on platform, keep them
          if (availableMethods.length === 0) {
            setAvailableMethods(["fingerprint"]);
          }
        }
      }
    } catch (err) {
      setError("Failed to check biometric support");
      console.error("Biometric support check error:", err);
    } finally {
      setLoading(false);
    }
  }, [availableMethods.length]);

  // Authenticate using available biometric method
  const authenticate = useCallback(async (userId: string): Promise<BiometricResult> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupported) {
        throw new Error("Biometric authentication not supported on this device");
      }
      
      // Use the WebAuthn API for real biometric authentication
      const response = await fetch('/api/webauthn/authentication/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Authentication failed");
      }
      
      return {
        success: true,
        verified: result.verified,
        method: result.method,
        details: result
      };
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errMessage);
      return {
        success: false,
        error: errMessage
      };
    } finally {
      setLoading(false);
    }
  }, [isSupported, platform]);

  return {
    isSupported,
    availableMethods,
    platform,
    loading,
    error,
    checkSupport,
    authenticate
  };
};
