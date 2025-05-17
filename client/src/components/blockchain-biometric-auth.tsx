import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Fingerprint, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';
import { useBlockchainBiometrics, BiometricType } from '@/hooks/use-blockchain-biometrics';

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
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'register' ? (
            <>
              <Fingerprint className="h-5 w-5" />
              Register Device Biometric
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              Verify Your Identity
            </>
          )}
        </CardTitle>
        <CardDescription>
          {mode === 'register' 
            ? 'Register your device biometric for secure authentication. Your biometric data stays on your device.'
            : 'Verify your identity using your device biometric. Secure and private.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {status === 'detecting' && (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Detecting device capabilities...</p>
          </div>
        )}
        
        {status === 'registering' && (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Registering your {selectedBiometric} biometric...</p>
          </div>
        )}
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Verifying your identity...</p>
          </div>
        )}
        
        {status === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{statusMessage || error || 'An unknown error occurred'}</AlertDescription>
          </Alert>
        )}
        
        {(status === 'idle' || status === 'success' || status === 'error') && deviceInfo && (
          <div className="space-y-4 mt-4">
            {deviceInfo.supportsBiometrics ? (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <p className="text-sm font-semibold mr-2">Available biometrics:</p>
                  {deviceInfo.supportedBiometrics.map((type: BiometricType) => (
                    <Badge 
                      key={type}
                      variant={selectedBiometric === type ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedBiometric(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}
                </div>
                
                <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    Privacy Protection
                  </h4>
                  <p className="text-sm text-slate-700">
                    Your biometric data never leaves your device. We only store verification
                    metadata for authentication purposes.
                  </p>
                </div>
              </>
            ) : (
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Biometrics Not Available</AlertTitle>
                <AlertDescription>
                  Your device ({deviceInfo.platform} {deviceInfo.type}) does not support biometric authentication.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {(status === 'idle' || status === 'error') && (
          mode === 'register' ? (
            <Button onClick={handleRegister} disabled={!deviceInfo?.supportsBiometrics || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register {selectedBiometric.charAt(0).toUpperCase() + selectedBiometric.slice(1)}
            </Button>
          ) : (
            <Button onClick={handleVerify} disabled={!deviceInfo?.supportsBiometrics || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Identity
            </Button>
          )
        )}
        
        {status === 'success' && (
          <Button onClick={handleReset} variant="outline">
            {mode === 'register' ? 'Register Another' : 'Verify Again'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}