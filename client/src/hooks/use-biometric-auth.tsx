import { useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BiometricCredential } from "@shared/schema";

type BiometricType = "face" | "fingerprint" | "iris" | "voice";

interface BiometricAuthStatus {
  supported: boolean;
  registeredCredentials: BiometricCredential[];
  availableDeviceTypes: string[];
  preferredBiometricType: BiometricType;
}

export function useBiometricAuth() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if browser/device supports WebAuthn/biometric authentication
  const checkSupport = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !window.PublicKeyCredential) {
        return false;
      }
      
      // Check if user verification is available
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (err) {
      console.error("Failed to check biometric support:", err);
      return false;
    }
  }, []);

  // Query for current biometric status
  const { data: biometricStatus, isLoading, refetch } = useQuery({
    queryKey: ["/api/biometrics/status"],
    enabled: isAuthenticated,
    select: (data: any): BiometricAuthStatus => ({
      supported: data.supported,
      registeredCredentials: data.credentials || [],
      availableDeviceTypes: data.availableDeviceTypes || [],
      preferredBiometricType: data.preferredBiometricType || "fingerprint",
    }),
  });

  // Register a new biometric credential
  const registerBiometric = useCallback(async (biometricType: BiometricType = "fingerprint") => {
    if (!user) {
      setError("You must be logged in to register biometrics");
      return null;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsRegistering(true);

      // 1. Get registration options from server
      const options = await apiRequest("/api/biometrics/register/options", {
        method: "POST",
        body: { 
          userId: user.id,
          biometricType,
          deviceType: detectDeviceType()
        }
      });

      // 2. WebAuthn credential creation
      // Convert base64 challenge to ArrayBuffer
      options.publicKey.challenge = base64UrlToArrayBuffer(options.publicKey.challenge);
      
      // Convert user ID to ArrayBuffer
      if (options.publicKey.user && options.publicKey.user.id) {
        options.publicKey.user.id = base64UrlToArrayBuffer(options.publicKey.user.id);
      }

      // 3. Create credential using platform authenticator
      const credential = await navigator.credentials.create({
        publicKey: options.publicKey
      }) as PublicKeyCredential;

      // 4. Process response from authenticator
      const attestationResponse = credential.response as AuthenticatorAttestationResponse;
      
      // 5. Prepare response to send to server
      const registrationResponse = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: arrayBufferToBase64Url(attestationResponse.attestationObject),
          clientDataJSON: arrayBufferToBase64Url(attestationResponse.clientDataJSON),
        },
        biometricType,
        deviceType: detectDeviceType(),
        userId: user.id
      };

      // 6. Send registration response to server for verification
      const result = await apiRequest("/api/biometrics/register/complete", {
        method: "POST",
        body: registrationResponse
      });

      setSuccess("Biometric registration successful");
      await queryClient.invalidateQueries({ queryKey: ["/api/biometrics/status"] });
      refetch();
      return result;
    } catch (err: any) {
      console.error("Biometric registration failed:", err);
      setError(err.message || "Biometric registration failed");
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, [user, queryClient, refetch]);

  // Verify identity using previously registered biometric
  const verifyIdentity = useCallback(async (credentialId?: string) => {
    if (!user) {
      setError("You must be logged in to verify identity");
      return false;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsVerifying(true);

      // 1. Get authentication options from server
      const options = await apiRequest("/api/biometrics/verify/options", {
        method: "POST",
        body: { 
          userId: user.id,
          credentialId // Optional - will use preferred credential if not specified
        }
      });

      // 2. Convert base64 challenge to ArrayBuffer
      options.publicKey.challenge = base64UrlToArrayBuffer(options.publicKey.challenge);
      
      // 3. Convert any credential IDs to ArrayBuffer
      if (options.publicKey.allowCredentials) {
        options.publicKey.allowCredentials = options.publicKey.allowCredentials.map((cred: any) => {
          return {
            ...cred,
            id: base64UrlToArrayBuffer(cred.id)
          };
        });
      }

      // 4. Get credential using platform authenticator
      const credential = await navigator.credentials.get({
        publicKey: options.publicKey
      }) as PublicKeyCredential;

      // 5. Process response from authenticator
      const assertionResponse = credential.response as AuthenticatorAssertionResponse;
      
      // 6. Prepare verification response to send to server
      const verificationResponse = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: arrayBufferToBase64Url(assertionResponse.authenticatorData),
          clientDataJSON: arrayBufferToBase64Url(assertionResponse.clientDataJSON),
          signature: arrayBufferToBase64Url(assertionResponse.signature),
          userHandle: assertionResponse.userHandle ? arrayBufferToBase64Url(assertionResponse.userHandle) : null
        },
        userId: user.id
      };

      // 7. Send verification response to server
      const result = await apiRequest("/api/biometrics/verify/complete", {
        method: "POST",
        body: verificationResponse
      });

      setSuccess("Identity verification successful");
      return result.verified;
    } catch (err: any) {
      console.error("Biometric verification failed:", err);
      setError(err.message || "Biometric verification failed");
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [user]);

  // Delete a registered biometric credential
  const deleteBiometric = useCallback(async (credentialId: string) => {
    if (!user) {
      setError("You must be logged in to manage biometrics");
      return false;
    }

    try {
      setError(null);
      
      await apiRequest(`/api/biometrics/credentials/${credentialId}`, {
        method: "DELETE"
      });
      
      setSuccess("Biometric credential removed successfully");
      await queryClient.invalidateQueries({ queryKey: ["/api/biometrics/status"] });
      refetch();
      return true;
    } catch (err: any) {
      console.error("Failed to delete biometric credential:", err);
      setError(err.message || "Failed to delete biometric credential");
      return false;
    }
  }, [user, queryClient, refetch]);

  return {
    isSupported: biometricStatus?.supported,
    registeredCredentials: biometricStatus?.registeredCredentials || [],
    isRegistering,
    isVerifying,
    isLoading,
    error,
    success,
    checkSupport,
    registerBiometric,
    verifyIdentity,
    deleteBiometric,
    availableDeviceTypes: biometricStatus?.availableDeviceTypes || [],
    preferredBiometricType: biometricStatus?.preferredBiometricType || "fingerprint"
  };
}

// Utility function to detect device type
function detectDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  } else if (/android/.test(userAgent)) {
    return "android";
  } else {
    return "web";
  }
}

// Utility functions for converting between ArrayBuffer and Base64URL
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
  const base64 = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const padLength = 4 - (base64.length % 4);
  const padded = padLength < 4 ? base64 + '='.repeat(padLength) : base64;
  
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return bytes.buffer;
}