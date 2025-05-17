import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBlockchainBiometrics } from '../hooks/use-blockchain-biometrics';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Shield, Fingerprint, Smartphone, CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface BiometricAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  mode?: 'register' | 'verify';
}

export function BlockchainBiometricAuth({ 
  onSuccess, 
  onError,
  mode = 'verify' 
}: BiometricAuthProps) {
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const {
    isAvailable,
    biometricType,
    isRegistering,
    isVerifying,
    registeredCredential,
    registerBiometric,
    verifyBiometric,
    checkRegistration,
    checkBiometricAvailability
  } = useBlockchainBiometrics();
  
  // Check if biometrics are available on this device
  useEffect(() => {
    checkBiometricAvailability();
  }, [checkBiometricAvailability]);
  
  // Check if user has already registered biometrics
  useEffect(() => {
    const checkIfRegistered = async () => {
      const registered = await checkRegistration();
      setIsRegistered(registered);
    };
    
    if (isAvailable) {
      checkIfRegistered();
    }
  }, [isAvailable, checkRegistration]);
  
  // Handle biometric registration
  const handleRegister = async () => {
    try {
      setIsError(false);
      setIsSuccess(false);
      
      const result = await registerBiometric();
      
      if (result.success) {
        setIsSuccess(true);
        setIsRegistered(true);
        toast({
          title: "Biometric Registration Successful",
          description: "Your biometric identity is now secured on the blockchain.",
          variant: "default",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      setIsError(true);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(message);
      
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
      
      if (onError) {
        onError(message);
      }
    }
  };
  
  // Handle biometric verification
  const handleVerify = async () => {
    try {
      setIsError(false);
      setIsSuccess(false);
      
      const result = await verifyBiometric();
      
      if (result.success) {
        setIsSuccess(true);
        toast({
          title: "Identity Verified",
          description: "Your identity has been verified and recorded on the blockchain.",
          variant: "default",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      setIsError(true);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(message);
      
      toast({
        title: "Verification Failed",
        description: message,
        variant: "destructive",
      });
      
      if (onError) {
        onError(message);
      }
    }
  };
  
  // If biometrics are not available, show alternative
  if (!isAvailable) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Biometric Authentication</CardTitle>
          <CardDescription>
            Biometric authentication is not available on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <XCircle className="w-16 h-16 text-gray-400" />
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'register' ? 'Register Biometrics' : 'Verify Identity'}
        </CardTitle>
        <CardDescription>
          {mode === 'register' 
            ? 'Register your biometric identity securely on the blockchain'
            : 'Verify your identity using device biometrics'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center py-8">
        {/* Status display */}
        {isRegistering || isVerifying ? (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <LoaderCircle className="w-16 h-16 text-primary" />
            </motion.div>
            <p className="mt-4 text-sm text-gray-600">
              {isRegistering ? 'Registering your biometric identity...' : 'Verifying your identity...'}
            </p>
          </div>
        ) : isSuccess ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <p className="mt-4 text-sm text-gray-600">
              {mode === 'register' 
                ? 'Biometric identity registered successfully!'
                : 'Identity verified successfully!'
              }
            </p>
            {mode === 'register' && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600 font-mono">
                Credential ID: {registeredCredential?.substring(0, 16)}...
              </div>
            )}
          </motion.div>
        ) : isError ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          </motion.div>
        ) : (
          <div className="text-center">
            {biometricType === 'faceId' && (
              <Shield className="w-16 h-16 text-primary/70 mb-2" />
            )}
            {(biometricType === 'touchId' || biometricType === 'fingerprint') && (
              <Fingerprint className="w-16 h-16 text-primary/70 mb-2" />
            )}
            {biometricType === 'face' && (
              <Smartphone className="w-16 h-16 text-primary/70 mb-2" />
            )}
            <p className="text-sm text-gray-600 font-medium">
              {biometricType === 'faceId' ? 'Face ID' : 
               biometricType === 'touchId' ? 'Touch ID' : 
               biometricType === 'fingerprint' ? 'Fingerprint' : 
               'Device Authentication'}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {mode === 'register' 
                ? 'Your biometric data will remain secure on your device.'
                : 'Verify your identity using your device biometrics.'
              }
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        {mode === 'register' ? (
          <Button 
            className="w-full" 
            onClick={handleRegister}
            disabled={isRegistering || isSuccess || (isRegistered === true)}
          >
            {isRegistered === true ? 'Already Registered' : 'Register Biometrics'}
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleVerify}
            disabled={isVerifying || isSuccess || (isRegistered === false)}
          >
            {isRegistered === false ? 'Register First' : 'Verify Identity'}
          </Button>
        )}
        
        {isError && (
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            onClick={mode === 'register' ? handleRegister : handleVerify}
          >
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}