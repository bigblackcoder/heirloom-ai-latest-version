import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// WebAuthn response type
export interface WebAuthnAuthenticationResponse {
  verified: boolean;
  userId?: number;
  message: string;
  credentialId?: string;
}

// Props for the WebAuthn component
interface WebAuthnVerifierProps {
  userId: number;
  username: string;
  displayName: string;
  onSuccess?: (response: WebAuthnAuthenticationResponse) => void;
  onError?: (error: Error) => void;
  mode?: 'register' | 'authenticate';
  autoRegister?: boolean;
}

/**
 * WebAuthnVerifier Component
 * 
 * This component handles WebAuthn (FIDO2) registration and authentication flows.
 * It leverages the device's biometric capabilities (like Face ID) for secure authentication.
 */
export const WebAuthnVerifier: React.FC<WebAuthnVerifierProps> = ({
  userId,
  username,
  displayName,
  onSuccess,
  onError,
  mode = 'authenticate',
  autoRegister = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  // Convert buffer array to base64 string
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const uint8Array = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  // Convert a base64 string to an ArrayBuffer
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Process WebAuthn registration
  const handleRegister = useCallback(async () => {
    if (!userId || !username || !displayName) {
      setStatus('error');
      setMessage('Missing user information');
      if (onError) onError(new Error('Missing user information'));
      return;
    }

    try {
      setIsProcessing(true);
      setStatus('processing');
      setMessage('Requesting registration options...');
      setProgress(10);

      // Request registration options from the server
      const optionsResponse = await fetch('/api/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, displayName })
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.message || 'Failed to get registration options');
      }

      setProgress(30);
      setMessage('Prompting for biometric verification...');

      // Parse the options
      const options = await optionsResponse.json();
      
      // Convert ArrayBuffers back from our custom format
      const publicKeyOptions = {
        ...options,
        challenge: new Uint8Array(options.challenge.data).buffer,
        user: {
          ...options.user,
          id: new Uint8Array(options.user.id.data).buffer,
        },
        excludeCredentials: options.excludeCredentials ? 
          options.excludeCredentials.map((cred: any) => ({
            ...cred,
            id: new Uint8Array(cred.id.data).buffer
          })) : undefined
      };

      // Request the credential from the browser
      setProgress(50);
      // @ts-ignore - TypeScript doesn't recognize navigator.credentials.create
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      });

      setProgress(70);
      setMessage('Verifying registration with server...');

      // Prepare the credential for the server
      const credentialForServer = {
        id: credential.id,
        type: credential.type,
        rawId: arrayBufferToBase64(credential.rawId),
        response: {
          clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
          attestationObject: arrayBufferToBase64(credential.response.attestationObject)
        },
        clientExtensionResults: credential.getClientExtensionResults ? 
                                credential.getClientExtensionResults() : {},
      };

      // Send the credential to the server for verification
      const verificationResponse = await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentialForServer)
      });

      if (!verificationResponse.ok) {
        const errorData = await verificationResponse.json();
        throw new Error(errorData.message || 'Registration verification failed');
      }

      setProgress(100);
      const responseData = await verificationResponse.json();
      setStatus('success');
      setMessage(responseData.message || 'Registration successful');
      
      if (onSuccess) {
        onSuccess({
          verified: true,
          userId,
          message: responseData.message,
          credentialId: responseData.credentialId
        });
      }

      toast({
        title: "Registration Successful",
        description: "Your device is now registered for biometric login."
      });

    } catch (error) {
      console.error('WebAuthn registration error:', error);
      setStatus('error');
      setMessage(error.message || 'Registration failed');
      if (onError) onError(error);
      
      toast({
        title: "Registration Failed",
        description: error.message || 'Could not complete registration',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [userId, username, displayName, onSuccess, onError, toast]);

  // Process WebAuthn authentication
  const handleAuthenticate = useCallback(async () => {
    if (!userId) {
      setStatus('error');
      setMessage('User ID is required');
      if (onError) onError(new Error('User ID is required'));
      return;
    }

    try {
      setIsProcessing(true);
      setStatus('processing');
      setMessage('Requesting authentication options...');
      setProgress(10);

      // Request authentication options from the server
      const optionsResponse = await fetch('/api/webauthn/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        
        // If no credentials found and autoRegister is true, switch to registration
        if (errorData.message?.includes('No credentials found') && autoRegister) {
          setMessage('No credentials found. Switching to registration...');
          setTimeout(() => handleRegister(), 1000);
          return;
        }
        
        throw new Error(errorData.message || 'Failed to get authentication options');
      }

      setProgress(30);
      setMessage('Prompting for biometric verification...');

      // Parse the options
      const options = await optionsResponse.json();
      
      // Convert ArrayBuffers back from our custom format
      const publicKeyOptions = {
        ...options,
        challenge: new Uint8Array(options.challenge.data).buffer,
        allowCredentials: options.allowCredentials ? 
          options.allowCredentials.map((cred: any) => ({
            ...cred,
            id: new Uint8Array(cred.id.data).buffer
          })) : undefined
      };

      // Request the assertion from the browser
      setProgress(50);
      // @ts-ignore - TypeScript doesn't recognize navigator.credentials.get
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions
      });

      setProgress(70);
      setMessage('Verifying authentication with server...');

      // Prepare the assertion for the server
      const assertionForServer = {
        id: assertion.id,
        type: assertion.type,
        rawId: arrayBufferToBase64(assertion.rawId),
        response: {
          clientDataJSON: arrayBufferToBase64(assertion.response.clientDataJSON),
          authenticatorData: arrayBufferToBase64(assertion.response.authenticatorData),
          signature: arrayBufferToBase64(assertion.response.signature),
          userHandle: assertion.response.userHandle ? 
                      arrayBufferToBase64(assertion.response.userHandle) : null
        }
      };

      // Send the assertion to the server for verification
      const verificationResponse = await fetch('/api/webauthn/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertionForServer)
      });

      if (!verificationResponse.ok) {
        const errorData = await verificationResponse.json();
        throw new Error(errorData.message || 'Authentication verification failed');
      }

      setProgress(100);
      const responseData = await verificationResponse.json();
      setStatus('success');
      setMessage(responseData.message || 'Authentication successful');
      
      if (onSuccess) {
        onSuccess({
          verified: responseData.verified,
          userId: responseData.userId,
          message: responseData.message,
          credentialId: responseData.credentialId
        });
      }

      toast({
        title: "Authentication Successful",
        description: "Your identity has been verified."
      });

    } catch (error) {
      console.error('WebAuthn authentication error:', error);
      setStatus('error');
      setMessage(error.message || 'Authentication failed');
      if (onError) onError(error);
      
      toast({
        title: "Authentication Failed",
        description: error.message || 'Could not verify your identity',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [userId, onSuccess, onError, autoRegister, handleRegister, toast]);

  // Auto-initiate the process based on mode
  useEffect(() => {
    if (mode === 'register') {
      handleRegister();
    } else if (mode === 'authenticate') {
      handleAuthenticate();
    }
  }, [mode, handleRegister, handleAuthenticate]);

  // Check if WebAuthn is supported by the browser
  const isWebAuthnSupported = typeof window !== 'undefined' && 
                            !!navigator.credentials && 
                            !!navigator.credentials.create;

  if (!isWebAuthnSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Biometric Authentication</CardTitle>
          <CardDescription>
            Your browser doesn't support WebAuthn for biometric authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Incompatible Browser</AlertTitle>
            <AlertDescription>
              Please use a modern browser like Chrome, Firefox, Safari, or Edge to use biometric authentication.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Biometric Authentication</CardTitle>
        <CardDescription>
          {mode === 'register' 
            ? 'Register your device for biometric authentication' 
            : 'Verify your identity using biometrics'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'processing' && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-gray-500">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === 'success' && (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === 'idle' && (
          <div className="space-y-2">
            {mode === 'register' ? (
              <Button 
                onClick={handleRegister} 
                disabled={isProcessing}
                className="w-full"
              >
                Register Device
              </Button>
            ) : (
              <Button 
                onClick={handleAuthenticate} 
                disabled={isProcessing}
                className="w-full"
              >
                Verify Identity
              </Button>
            )}
          </div>
        )}

        {/* Allow switching between registration and authentication */}
        {status !== 'processing' && (
          <div className="pt-2 text-center">
            {mode === 'register' ? (
              <Button 
                variant="link" 
                onClick={() => {
                  setStatus('idle');
                  setMessage('');
                  if (onSuccess) onSuccess({ verified: false, message: 'Switched to authentication' });
                }}
              >
                Already registered? Authenticate instead
              </Button>
            ) : (
              <Button 
                variant="link" 
                onClick={() => {
                  setStatus('idle');
                  setMessage('');
                  handleRegister();
                }}
              >
                Need to register? Register this device
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebAuthnVerifier;