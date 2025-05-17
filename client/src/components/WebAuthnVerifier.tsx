import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  WebAuthnRegistrationOptions, 
  WebAuthnAuthenticationOptions,
  WebAuthnAttestationResponse,
  WebAuthnAuthenticationResponse
} from '../../shared/webauthn';

/**
 * WebAuthn registration methods available in modern browsers
 */
declare global {
  interface Navigator {
    credentials: {
      create(options: any): Promise<any>;
      get(options: any): Promise<any>;
    };
  }
}

/**
 * Platform detection for better UX messaging
 */
function getPlatformSpecificName() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('mac')) {
    return 'Face ID / Touch ID';
  } else if (userAgent.includes('android')) {
    return 'Android biometrics';
  }
  return 'device biometrics';
}

/**
 * Props for the WebAuthnVerifier component
 */
export interface WebAuthnVerifierProps {
  mode: 'register' | 'authenticate';
  userId?: string;
  username?: string;
  displayName?: string;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  autoInitiate?: boolean;
  serverUrl?: string;
}

/**
 * WebAuthnVerifier Component
 * Provides a UI for WebAuthn (FIDO2) device biometric registration and authentication
 */
export function WebAuthnVerifier({
  mode,
  userId,
  username,
  displayName,
  onSuccess,
  onError,
  autoInitiate = false,
  serverUrl = '/api/webauthn'
}: WebAuthnVerifierProps) {
  // State
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const platformName = getPlatformSpecificName();

  /**
   * Start the WebAuthn registration process
   */
  const startRegistration = useCallback(async () => {
    if (!userId || !username) {
      setError('User ID and username are required for registration');
      setStatus('error');
      toast({
        title: 'Missing Information',
        description: 'User ID and username are required for registration',
        variant: 'destructive'
      });
      return;
    }

    try {
      setStatus('processing');
      setProgress(10);
      
      // Get registration options from server
      const optionsResponse = await fetch(`${serverUrl}/register/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, displayName }),
        credentials: 'include'
      });
      
      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options from server');
      }
      
      const options: WebAuthnRegistrationOptions = await optionsResponse.json();
      setProgress(30);
      
      // Convert base64url strings to ArrayBuffer as required by the WebAuthn API
      options.challenge = Uint8Array.from(
        atob(options.challenge), c => c.charCodeAt(0)
      ).buffer;
      
      options.user.id = Uint8Array.from(
        atob(options.user.id), c => c.charCodeAt(0)
      ).buffer;
      
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map(cred => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)).buffer
        }));
      }

      setProgress(50);
      
      // Create credentials using WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: options as any
      });
      
      setProgress(70);
      
      if (!credential) {
        throw new Error('No credentials returned from authenticator');
      }

      // Prepare the attestation response for the server
      const attestation = credential as any;
      const clientData = attestation.response.clientDataJSON;
      const attestationObject = attestation.response.attestationObject;
      
      // Convert ArrayBuffer to base64url string for sending to server
      const attestationResponse: WebAuthnAttestationResponse = {
        id: attestation.id,
        rawId: arrayBufferToBase64url(attestation.rawId),
        type: attestation.type,
        response: {
          clientDataJSON: arrayBufferToBase64url(clientData),
          attestationObject: arrayBufferToBase64url(attestationObject)
        },
        authenticatorAttachment: attestation.authenticatorAttachment
      };
      
      setProgress(80);
      
      // Send attestation to server for verification
      const verificationResponse = await fetch(`${serverUrl}/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attestationResponse),
        credentials: 'include'
      });
      
      if (!verificationResponse.ok) {
        const errorData = await verificationResponse.json();
        throw new Error(errorData.error || 'Failed to verify registration');
      }
      
      const verificationResult = await verificationResponse.json();
      setProgress(100);
      
      // Success!
      setStatus('success');
      toast({
        title: 'Registration Successful',
        description: `Your ${platformName} has been successfully registered`,
        variant: 'default'
      });
      
      if (onSuccess) {
        onSuccess(verificationResult);
      }
      
    } catch (err: any) {
      console.error('WebAuthn Registration Error:', err);
      setStatus('error');
      setError(err.message || 'Failed to register device');
      
      toast({
        title: 'Registration Failed',
        description: err.message || 'Failed to register device',
        variant: 'destructive'
      });
      
      if (onError) {
        onError(err);
      }
    }
  }, [userId, username, displayName, serverUrl, toast, onSuccess, onError, platformName]);

  /**
   * Start the WebAuthn authentication process
   */
  const startAuthentication = useCallback(async () => {
    try {
      setStatus('processing');
      setProgress(10);
      
      // Get authentication options from server
      const optionsResponse = await fetch(`${serverUrl}/authenticate/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        credentials: 'include'
      });
      
      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options from server');
      }
      
      const options: WebAuthnAuthenticationOptions = await optionsResponse.json();
      setProgress(30);
      
      // Convert base64url strings to ArrayBuffer as required by the WebAuthn API
      options.challenge = Uint8Array.from(
        atob(options.challenge), c => c.charCodeAt(0)
      ).buffer;
      
      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map(cred => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)).buffer
        }));
      }

      setProgress(50);
      
      // Get credentials using WebAuthn API
      const credential = await navigator.credentials.get({
        publicKey: options as any
      });
      
      setProgress(70);
      
      if (!credential) {
        throw new Error('No credentials returned from authenticator');
      }

      // Prepare the assertion response for the server
      const assertion = credential as any;
      const authenticatorData = assertion.response.authenticatorData;
      const clientDataJSON = assertion.response.clientDataJSON;
      const signature = assertion.response.signature;
      const userHandle = assertion.response.userHandle;
      
      // Convert ArrayBuffer to base64url string for sending to server
      const authenticationResponse: WebAuthnAuthenticationResponse = {
        id: assertion.id,
        rawId: arrayBufferToBase64url(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: arrayBufferToBase64url(authenticatorData),
          clientDataJSON: arrayBufferToBase64url(clientDataJSON),
          signature: arrayBufferToBase64url(signature),
          userHandle: userHandle ? arrayBufferToBase64url(userHandle) : undefined
        }
      };
      
      setProgress(80);
      
      // Send assertion to server for verification
      const verificationResponse = await fetch(`${serverUrl}/authenticate/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authenticationResponse),
        credentials: 'include'
      });
      
      if (!verificationResponse.ok) {
        const errorData = await verificationResponse.json();
        throw new Error(errorData.error || 'Failed to verify authentication');
      }
      
      const verificationResult = await verificationResponse.json();
      setProgress(100);
      
      // Success!
      setStatus('success');
      toast({
        title: 'Authentication Successful',
        description: `You've been successfully authenticated using ${platformName}`,
        variant: 'default'
      });
      
      if (onSuccess) {
        onSuccess(verificationResult);
      }
      
    } catch (err: any) {
      console.error('WebAuthn Authentication Error:', err);
      setStatus('error');
      setError(err.message || 'Failed to authenticate');
      
      toast({
        title: 'Authentication Failed',
        description: err.message || 'Failed to authenticate using device biometrics',
        variant: 'destructive'
      });
      
      if (onError) {
        onError(err);
      }
    }
  }, [userId, serverUrl, toast, onSuccess, onError, platformName]);

  // Auto-initiate the WebAuthn flow if requested
  useEffect(() => {
    if (autoInitiate && status === 'idle') {
      if (mode === 'register') {
        startRegistration();
      } else {
        startAuthentication();
      }
    }
  }, [autoInitiate, mode, status, startRegistration, startAuthentication]);

  // Reset component if key props change
  useEffect(() => {
    setStatus('idle');
    setError(null);
    setProgress(0);
  }, [mode, userId, username]);

  // Determine button text based on mode and status
  const getButtonText = () => {
    if (status === 'processing') {
      return mode === 'register' 
        ? `Registering with ${platformName}...` 
        : `Authenticating with ${platformName}...`;
    }
    
    if (status === 'error') {
      return 'Try Again';
    }
    
    return mode === 'register' 
      ? `Register with ${platformName}` 
      : `Authenticate with ${platformName}`;
  };

  // Determine card title based on mode
  const getCardTitle = () => {
    return mode === 'register' 
      ? `Register ${platformName}` 
      : `Authenticate with ${platformName}`;
  };

  // Determine card description based on mode
  const getCardDescription = () => {
    return mode === 'register'
      ? `Add your ${platformName} to your account for secure biometric authentication.`
      : `Use your ${platformName} to securely authenticate to your account.`;
  };

  // Handle button click based on status
  const handleButtonClick = () => {
    if (status === 'processing') return;
    
    setError(null);
    
    if (mode === 'register') {
      startRegistration();
    } else {
      startAuthentication();
    }
  };

  // Helper function to convert ArrayBuffer to base64url string
  function arrayBufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{getCardTitle()}</CardTitle>
        <CardDescription>{getCardDescription()}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status === 'processing' && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              {progress < 30 && 'Preparing verification options...'}
              {progress >= 30 && progress < 60 && `Waiting for ${platformName} response...`}
              {progress >= 60 && progress < 90 && 'Verifying with server...'}
              {progress >= 90 && 'Completing verification...'}
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <Alert variant="success">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              {mode === 'register' 
                ? `Your ${platformName} has been successfully registered.` 
                : `You've been successfully authenticated using ${platformName}.`}
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!navigator.credentials && (
          <Alert variant="destructive">
            <AlertTitle>Browser Not Supported</AlertTitle>
            <AlertDescription>
              Your browser doesn't support WebAuthn. Please use a modern browser like Chrome, Firefox, Safari, or Edge.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleButtonClick}
          disabled={status === 'processing' || !navigator.credentials}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}