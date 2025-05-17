import React, { useState, useEffect } from "react";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Fingerprint, 
  Scan, 
  Shield, 
  Check, 
  AlertTriangle, 
  X, 
  Trash2, 
  UserCircle2, 
  Smartphone
} from "lucide-react";

// BlockchainBiometricAuth component
export function BlockchainBiometricAuth() {
  const { user, isAuthenticated } = useAuth();
  const {
    isSupported,
    registeredCredentials,
    isRegistering,
    isVerifying,
    isLoading,
    error,
    success,
    checkSupport,
    registerBiometric,
    verifyIdentity,
    deleteBiometric,
    preferredBiometricType
  } = useBiometricAuth();

  const [supportChecked, setSupportChecked] = useState(false);
  const [isSupported_, setIsSupported] = useState(false);

  // Check if biometric authentication is supported on this device
  useEffect(() => {
    async function checkBiometricSupport() {
      if (!supportChecked) {
        const supported = await checkSupport();
        setIsSupported(!!supported);
        setSupportChecked(true);
      }
    }

    if (isAuthenticated) {
      checkBiometricSupport();
    }
  }, [isAuthenticated, supportChecked, checkSupport]);

  // Handle biometric registration
  const handleRegister = async () => {
    // Auto-detect best biometric type based on device
    const bestBiometricType = preferredBiometricType || 
      (navigator.userAgent.toLowerCase().includes("mobile") ? "fingerprint" : "face");
    
    await registerBiometric(bestBiometricType);
  };

  // Handle verification
  const handleVerify = async () => {
    await verifyIdentity();
  };

  // Handle credential deletion
  const handleDelete = async (credentialId: string) => {
    if (window.confirm("Are you sure you want to remove this biometric credential?")) {
      await deleteBiometric(credentialId);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center mb-4 text-orange-600">
          <Shield className="mr-2 h-6 w-6" />
          <h2 className="text-xl font-semibold">Secure Identity Verification</h2>
        </div>
        <p className="mb-4 text-gray-600">
          You need to be logged in to use biometric authentication.
        </p>
        <Button className="w-full">
          Login to Continue
        </Button>
      </div>
    );
  }

  // If biometric support is still being checked
  if (!supportChecked) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center space-x-2 animate-pulse">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">
          Checking device compatibility...
        </p>
      </div>
    );
  }

  // If biometrics are not supported on this device
  if (!isSupported_) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center mb-4 text-red-600">
          <AlertTriangle className="mr-2 h-6 w-6" />
          <h2 className="text-xl font-semibold">Biometrics Not Available</h2>
        </div>
        <p className="mb-4 text-gray-600">
          Your device or browser doesn't support biometric authentication.
          Please use a device with Touch ID, Face ID, or Windows Hello.
        </p>
        <Button variant="outline" className="w-full" onClick={() => setSupportChecked(false)}>
          Check Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6 text-blue-600">
        <Fingerprint className="mr-2 h-6 w-6" />
        <h2 className="text-xl font-semibold">Blockchain-Secured Biometrics</h2>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center">
          <Check className="mr-2 h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center">
          <X className="mr-2 h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Registered credentials list */}
      {registeredCredentials.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2 text-gray-700">Your Registered Biometrics</h3>
          <div className="space-y-3">
            {registeredCredentials.map((credential) => (
              <div key={credential.id} className="border rounded-md p-3 flex justify-between items-center">
                <div className="flex items-center">
                  {credential.biometricType === "face" ? (
                    <Scan className="mr-2 h-5 w-5 text-blue-500" />
                  ) : (
                    <Fingerprint className="mr-2 h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium capitalize">{credential.biometricType} Credential</p>
                    <p className="text-xs text-gray-500">
                      <span className="capitalize">{credential.deviceType}</span> •{" "}
                      {new Date(credential.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(credential.credentialId)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md text-center">
          <UserCircle2 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">No biometric credentials registered yet.</p>
          <p className="text-sm text-gray-500">Add your fingerprint or face for secure authentication.</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={handleRegister}
          disabled={isRegistering || isVerifying}
          className="flex items-center justify-center"
        >
          <Fingerprint className="mr-2 h-5 w-5" />
          {isRegistering ? "Registering..." : "Register Biometric"}
        </Button>
        
        <Button
          onClick={handleVerify}
          disabled={isVerifying || isRegistering || registeredCredentials.length === 0}
          variant={registeredCredentials.length === 0 ? "outline" : "default"}
          className="flex items-center justify-center"
        >
          <Shield className="mr-2 h-5 w-5" />
          {isVerifying ? "Verifying..." : "Verify Identity"}
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p className="flex items-center">
          <Smartphone className="inline-block mr-1 h-3 w-3" />
          Your biometric data stays securely on your device. Only verification metadata is stored on blockchain.
        </p>
      </div>
    </div>
  );
}