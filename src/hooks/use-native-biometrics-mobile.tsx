
import { useState, useCallback, useEffect } from "react";

type BiometricType = "face" | "fingerprint" | "iris" | "none";
type BiometricPlatform = "apple" | "android" | "windows" | "other";

interface BiometricVerificationResult {
  success: boolean;
  verified?: boolean;
  method?: string;
  error?: string;
  details?: any;
}

/**
 * A React hook to handle native biometric authentication on mobile devices
 */
export function useNativeBiometricsMobile() {
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);
  const [availableBiometrics, setAvailableBiometrics] = useState<BiometricType[]>([]);
  const [platform, setPlatform] = useState<BiometricPlatform>("other");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Check if biometric authentication is supported on this device
   */
  const checkBiometricSupport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Detect platform from user agent
      const userAgent = navigator.userAgent.toLowerCase();
      let detectedPlatform: BiometricPlatform = "other";
      let supportedBiometrics: BiometricType[] = [];
      
      if (/iphone|ipad|ipod/.test(userAgent)) {
        detectedPlatform = "apple";
        supportedBiometrics = ["face"];
        setIsBiometricSupported(true);
      } else if (/android/.test(userAgent)) {
        detectedPlatform = "android";
        supportedBiometrics = ["fingerprint", "face", "iris"];
        setIsBiometricSupported(true);
      } else if (/windows/.test(userAgent)) {
        detectedPlatform = "windows";
        // Check for Windows Hello capability
        const windowsHelloSupported = window.PublicKeyCredential !== undefined;
        if (windowsHelloSupported) {
          supportedBiometrics = ["face", "fingerprint"];
          setIsBiometricSupported(true);
        }
      }
      
      setPlatform(detectedPlatform);
      setAvailableBiometrics(supportedBiometrics);
      
      // Check for WebAuthn capability
      if (window.PublicKeyCredential !== undefined) {
        try {
          const platformAuthSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (platformAuthSupported) {
            setIsBiometricSupported(true);
            // Add fingerprint capability if not already detected
            if (!supportedBiometrics.includes("fingerprint")) {
              setAvailableBiometrics([...supportedBiometrics, "fingerprint"]);
            }
          }
        } catch (webAuthnError) {
          console.warn("WebAuthn check failed:", webAuthnError);
          // Continue with other detection methods
        }
      }
      
      // If React Native is detected, check for its biometric APIs
      if (window.ReactNativeWebView !== undefined) {
        setIsBiometricSupported(true);
        // For React Native, we can't determine exact biometric types, 
        // so we'll just indicate it's supported
        if (supportedBiometrics.length === 0) {
          setAvailableBiometrics(["face", "fingerprint"]);
        }
      }
    } catch (error) {
      console.error("Error checking biometric support:", error);
      setError("Failed to detect biometric support");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Authenticate using device biometrics
   */
  const authenticateWithBiometrics = useCallback(async (userId: string): Promise<BiometricVerificationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isBiometricSupported) {
        throw new Error("Biometric authentication is not supported on this device");
      }
      
      // If we're in React Native WebView, use the bridge
      if (window.ReactNativeWebView !== undefined) {
        try {
          // Send message to React Native to trigger native biometrics
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'authenticate_biometric',
            userId
          }));
          
          // In a real implementation, we would wait for a response
          // For now, we'll simulate a successful authentication
          return {
            success: true,
            verified: true,
            method: platform === "apple" ? "Face ID" : "Biometric",
            details: {
              platform,
              timestamp: new Date().toISOString()
            }
          };
        } catch (nativeError) {
          console.error("Native bridge error:", nativeError);
          throw new Error("Failed to communicate with native biometrics");
        }
      }
      
      // For web-based authentication, use WebAuthn if available
      if (window.PublicKeyCredential !== undefined) {
        // In a real implementation, we would call our server to get a challenge
        // and then use WebAuthn APIs to authenticate
        
        // For the demo, we'll make a direct API call to simulate
        const response = await fetch('/verify_native', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            platform,
            auth_token: 'simulated_biometric_token',
            device_info: navigator.userAgent
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Authentication failed");
        }
        
        const result = await response.json();
        
        return {
          success: true,
          verified: result.verified,
          method: result.method || `${platform} biometric`,
          details: result
        };
      }
      
      // If Web Authentication is not available, but we detected biometric support
      // This would be a fallback for devices that support biometrics but not WebAuthn
      if (platform === "apple" || platform === "android") {
        // Make an API call to simulate biometric auth verification
        const response = await fetch('/verify_native', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            platform,
            auth_type: availableBiometrics[0] || "face",
            device_info: navigator.userAgent
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Authentication failed");
        }
        
        const result = await response.json();
        
        return {
          success: true,
          verified: result.verified,
          method: result.method || `${platform} ${availableBiometrics[0] || "biometric"}`,
          details: result
        };
      }
      
      throw new Error("No biometric authentication method available");
    } catch (error) {
      console.error("Biometric authentication error:", error);
      setError(error instanceof Error ? error.message : "Authentication failed");
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        method: "biometric"
      };
    } finally {
      setIsLoading(false);
    }
  }, [isBiometricSupported, platform, availableBiometrics]);

  // Check for biometric support on initial mount
  useEffect(() => {
    checkBiometricSupport();
  }, [checkBiometricSupport]);
  
  return {
    isBiometricSupported,
    availableBiometrics,
    platform,
    isLoading,
    error,
    checkBiometricSupport,
    authenticateWithBiometrics
  };
}
