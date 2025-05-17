import React, { useState, useEffect } from 'react';
import { useBlockchainBiometrics, BiometricType } from '../hooks/use-blockchain-biometrics';

interface BlockchainBiometricAuthProps {
  userId?: number;
  onSuccess?: (result: { userId: number; verified: boolean }) => void;
  onError?: (error: string) => void;
  mode?: 'register' | 'verify';
  className?: string;
}

/**
 * Component for device-native biometric authentication
 * Actual biometric data stays on the user's device for enhanced security
 * Only verification metadata is stored on our system
 */
export function BlockchainBiometricAuth({
  userId,
  onSuccess,
  onError,
  mode = 'verify',
  className
}: BlockchainBiometricAuthProps) {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [selectedBiometric, setSelectedBiometric] = useState<BiometricType>('face');
  const [registeredCredentialId, setRegisteredCredentialId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'detecting' | 'registering' | 'verifying' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Use our blockchain biometrics hook
  const { 
    detectDevice, 
    registerBiometric, 
    verifyIdentity, 
    isLoading, 
    error 
  } = useBlockchainBiometrics(userId);
  
  // Detect device capabilities on mount
  useEffect(() => {
    const checkDevice = async () => {
      setStatus('detecting');
      const info = await detectDevice();
      setDeviceInfo(info);
      
      // Default to the first supported biometric if available
      if (info.supportedBiometrics.length > 0) {
        setSelectedBiometric(info.supportedBiometrics[0]);
      }
      
      setStatus('idle');
    };
    
    checkDevice();
  }, [detectDevice]);
  
  // Handle registration process
  const handleRegister = async () => {
    if (!deviceInfo?.supportsBiometrics) {
      setStatus('error');
      setStatusMessage('This device does not support biometric authentication');
      onError?.('Device does not support biometrics');
      return;
    }
    
    if (!userId) {
      setStatus('error');
      setStatusMessage('User ID is required for registration');
      onError?.('Missing user ID');
      return;
    }
    
    setStatus('registering');
    
    const result = await registerBiometric(selectedBiometric);
    
    if (result.success) {
      setRegisteredCredentialId(result.credentialId || null);
      setStatus('success');
      setStatusMessage(`Successfully registered ${selectedBiometric} biometric`);
      
      onSuccess?.({ userId, verified: true });
    } else {
      setStatus('error');
      setStatusMessage(result.message);
      onError?.(result.message);
    }
  };
  
  // Handle verification process
  const handleVerify = async () => {
    if (!deviceInfo?.supportsBiometrics) {
      setStatus('error');
      setStatusMessage('This device does not support biometric authentication');
      onError?.('Device does not support biometrics');
      return;
    }
    
    setStatus('verifying');
    
    const result = await verifyIdentity(registeredCredentialId || undefined);
    
    if (result.success) {
      setStatus('success');
      setStatusMessage('Identity verified successfully');
      
      onSuccess?.({ 
        userId: result.userId || (userId as number), 
        verified: true 
      });
    } else {
      setStatus('error');
      setStatusMessage(result.message || 'Failed to verify identity');
      onError?.(result.message || 'Verification failed');
    }
  };
  
  // Reset the component state
  const handleReset = () => {
    setStatus('idle');
    setStatusMessage('');
  };
  
  // Helper to capitalize first letter
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  return (
    <div className={`rounded-lg border bg-card shadow-sm ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
          {mode === 'register' ? (
            <>
              <span className="text-primary">🔐</span>
              Register Device Biometric
            </>
          ) : (
            <>
              <span className="text-primary">🛡️</span>
              Verify Your Identity
            </>
          )}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          {mode === 'register' 
            ? 'Register your device biometric for secure authentication. Your biometric data stays on your device.'
            : 'Verify your identity using your device biometric. Secure and private.'}
        </p>
        
        {status === 'detecting' && (
          <div className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p>Detecting device capabilities...</p>
          </div>
        )}
        
        {status === 'registering' && (
          <div className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p>Registering your {selectedBiometric} biometric...</p>
          </div>
        )}
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p>Verifying your identity...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-600">✓</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <div className="text-sm text-green-700">{statusMessage}</div>
              </div>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-600">⚠</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="text-sm text-red-700">{statusMessage || error || 'An unknown error occurred'}</div>
              </div>
            </div>
          </div>
        )}
        
        {(status === 'idle' || status === 'success' || status === 'error') && deviceInfo && (
          <div className="space-y-4 mt-4">
            {deviceInfo.supportsBiometrics ? (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <p className="text-sm font-medium mr-2">Available biometrics:</p>
                  {deviceInfo.supportedBiometrics.map((type: BiometricType) => (
                    <span 
                      key={type}
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        selectedBiometric === type
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                      onClick={() => setSelectedBiometric(type)}
                    >
                      {capitalizeFirstLetter(type)}
                    </span>
                  ))}
                </div>
                
                <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <span className="text-blue-600">🔒</span>
                    Privacy Protection
                  </h4>
                  <p className="text-sm text-gray-700">
                    Your biometric data never leaves your device. We only store verification
                    metadata for authentication purposes.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-amber-600">⚠</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Biometrics Not Available</h3>
                    <div className="text-sm text-amber-700">
                      Your device ({deviceInfo.platform} {deviceInfo.type}) does not support biometric authentication.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          {(status === 'idle' || status === 'error') && (
            <button 
              className={`py-2 px-4 rounded-md font-medium ${
                !deviceInfo?.supportsBiometrics || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
              onClick={mode === 'register' ? handleRegister : handleVerify}
              disabled={!deviceInfo?.supportsBiometrics || isLoading}
            >
              {isLoading && <span className="mr-2">⟳</span>}
              {mode === 'register'
                ? `Register ${capitalizeFirstLetter(selectedBiometric)}`
                : 'Verify Identity'
              }
            </button>
          )}
          
          {status === 'success' && (
            <button 
              className="py-2 px-4 rounded-md border border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
              onClick={handleReset}
            >
              {mode === 'register' ? 'Register Another' : 'Verify Again'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}