import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { WebAuthnAuthenticationResponse, WebAuthnRegistrationResponse } from '@shared/webauthn';

// Icons for different states
const AuthenticateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
    <path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.05a1 1 0 0 1 1.41-1.41l5.66 5.65a1 1 0 0 1 0 1.42l-5.66 5.65a1 1 0 0 1-1.41-1.41L13.69 13H2.05A10 10 0 1 0 12 2z" />
  </svg>
);

const RegisterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export interface WebAuthnVerifierProps {
  userId: number | string;
  onSuccess?: (response: WebAuthnAuthenticationResponse | WebAuthnRegistrationResponse) => void;
  onError?: (error: any) => void;
  includeRegistration?: boolean;
  autoTrigger?: boolean;
  showCard?: boolean;
}

export const WebAuthnVerifier: React.FC<WebAuthnVerifierProps> = ({
  userId,
  onSuccess,
  onError,
  includeRegistration = true,
  autoTrigger = false,
  showCard = true
}) => {
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'registering' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>('Ready for biometric authentication');

  // Convert userId to number if it's a string
  const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

  const simulateProgress = useCallback(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  // Handle WebAuthn authentication
  const handleAuthenticate = useCallback(async () => {
    try {
      setStatus('authenticating');
      setMessage('Preparing authentication challenge...');
      setError(null);
      const cleanup = simulateProgress();

      // Get authentication options from server
      const optionsResponse = await fetch('/api/webauthn/generate-authentication-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: numericUserId })
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.message || 'Failed to get authentication options');
      }

      const options = await optionsResponse.json();
      setMessage('Please complete the biometric verification on your device...');

      // Get credentials from browser
      const credential = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge.data),
          allowCredentials: options.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: new Uint8Array(cred.id.data),
          })) || [],
        }
      }) as PublicKeyCredential;

      // Prepare response for verification
      const authenticatorData = credential.response as AuthenticatorAssertionResponse;
      const clientDataJSON = new TextDecoder().decode(authenticatorData.clientDataJSON);
      
      setMessage('Verifying authentication...');

      // Verify with server
      const verifyResponse = await fetch('/api/webauthn/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            authenticatorData: Array.from(new Uint8Array(authenticatorData.authenticatorData)),
            clientDataJSON,
            signature: Array.from(new Uint8Array(authenticatorData.signature)),
            userHandle: authenticatorData.userHandle ? Array.from(new Uint8Array(authenticatorData.userHandle)) : null
          },
          type: credential.type,
          clientExtensionResults: credential.getClientExtensionResults()
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || 'Authentication verification failed');
      }

      const result = await verifyResponse.json();
      setProgress(100);
      setStatus('success');
      setMessage('Authentication successful');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      cleanup();
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Authentication failed. Try again.');
      if (onError) {
        onError(err);
      }
    }
  }, [numericUserId, onSuccess, onError, simulateProgress]);

  // Handle WebAuthn registration
  const handleRegister = useCallback(async () => {
    try {
      setStatus('registering');
      setMessage('Preparing registration...');
      setError(null);
      const cleanup = simulateProgress();

      // Get registration options from server
      const optionsResponse = await fetch('/api/webauthn/generate-registration-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: numericUserId,
          username: `user-${numericUserId}`,
          displayName: `User ${numericUserId}`
        })
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.message || 'Failed to get registration options');
      }

      const options = await optionsResponse.json();
      setMessage('Please complete the biometric registration on your device...');
      
      // Create credentials with browser WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge.data),
          user: {
            ...options.user,
            id: new Uint8Array(options.user.id.data),
          },
          excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
            ...cred,
            id: new Uint8Array(cred.id.data),
          })) || [],
        }
      }) as PublicKeyCredential;

      // Prepare response for verification
      const attestationResponse = credential.response as AuthenticatorAttestationResponse;
      const clientDataJSON = new TextDecoder().decode(attestationResponse.clientDataJSON);
      
      setMessage('Verifying registration...');
      
      // Verify with server
      const verifyResponse = await fetch('/api/webauthn/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            attestationObject: Array.from(new Uint8Array(attestationResponse.attestationObject)),
            clientDataJSON
          },
          type: credential.type,
          clientExtensionResults: credential.getClientExtensionResults()
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || 'Registration verification failed');
      }

      const result = await verifyResponse.json();
      setProgress(100);
      setStatus('success');
      setMessage('Registration successful');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      cleanup();
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Registration failed. Try again.');
      if (onError) {
        onError(err);
      }
    }
  }, [numericUserId, onSuccess, onError, simulateProgress]);

  // Auto-trigger authentication if enabled
  useEffect(() => {
    if (autoTrigger && status === 'idle') {
      handleAuthenticate();
    }
  }, [autoTrigger, status, handleAuthenticate]);

  // Render the WebAuthn component with or without card wrapper
  const content = (
    <>
      {status !== 'idle' && (
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {status === 'success' && (
        <Alert variant="success" className="mb-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-2 mt-4">
        {status !== 'authenticating' && (
          <Button
            onClick={handleAuthenticate}
            disabled={status === 'registering' || status === 'authenticating'}
          >
            <AuthenticateIcon />
            Authenticate with Biometrics
          </Button>
        )}

        {includeRegistration && status !== 'registering' && (
          <Button
            variant="outline"
            onClick={handleRegister}
            disabled={status === 'registering' || status === 'authenticating'}
          >
            <RegisterIcon />
            Register New Device
          </Button>
        )}
      </div>
    </>
  );

  if (!showCard) {
    return <div>{content}</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Biometric Authentication</CardTitle>
        <CardDescription>
          Verify your identity using your device's biometric authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};