import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import type {
  WebAuthnRegistrationOptions,
  WebAuthnAuthenticationOptions,
  WebAuthnAttestationResponse,
  WebAuthnAssertionResponse,
  WebAuthnRegistrationResponse,
  WebAuthnAuthenticationResponse,
  WebAuthnUser
} from '../../shared/webauthn';

interface WebAuthnVerifierProps {
  userId: string;
  username: string;
  onSuccess?: (result: WebAuthnRegistrationResponse | WebAuthnAuthenticationResponse) => void;
  onError?: (error: Error) => void;
  mode: 'register' | 'authenticate';
  withCamera?: boolean;
  buttonText?: string;
  title?: string;
  description?: string;
}

export function WebAuthnVerifier({
  userId,
  username,
  onSuccess,
  onError,
  mode = 'authenticate',
  withCamera = false,
  buttonText,
  title,
  description
}: WebAuthnVerifierProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [webcamImage, setWebcamImage] = useState<string | null>(null);
  const { toast } = useToast();

  // Determine if the browser supports WebAuthn
  const isWebAuthnSupported = typeof window !== 'undefined' && 
    window.PublicKeyCredential !== undefined;

  // Determine the platform-specific biometric name
  const getBiometricName = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('mac') !== -1) return 'Touch ID or Face ID';
    if (userAgent.indexOf('iphone') !== -1 || userAgent.indexOf('ipad') !== -1) return 'Face ID or Touch ID';
    if (userAgent.indexOf('android') !== -1) return 'Fingerprint or Face Recognition';
    if (userAgent.indexOf('win') !== -1) return 'Windows Hello';
    return 'Biometric Authentication';
  }, []);

  // Generate default text based on the mode
  const defaultTitle = mode === 'register' 
    ? `Register with ${getBiometricName()}` 
    : `Sign in with ${getBiometricName()}`;

  const defaultDescription = mode === 'register'
    ? `Securely register your identity using your device's built-in biometric sensor`
    : `Securely authenticate using your device's built-in biometric sensor`;

  const defaultButtonText = mode === 'register'
    ? `Register with ${getBiometricName()}`
    : `Sign in with ${getBiometricName()}`;

  // Registration process
  const startRegistration = async () => {
    if (!isWebAuthnSupported) {
      setErrorMessage('WebAuthn is not supported in this browser');
      return;
    }

    try {
      setStatus('processing');
      setMessage('Initializing registration process...');
      setProgress(10);

      // 1. Get registration options from the server
      const optionsResponse = await axios.post('/api/webauthn/register-options', {
        userId,
        username
      });
      
      const publicKeyOptions = optionsResponse.data;
      setProgress(30);
      setMessage('Asking for your biometric verification...');

      // 2. Convert base64 options to ArrayBuffer
      const convertedOptions = {
        ...publicKeyOptions,
        challenge: _base64UrlToArrayBuffer(publicKeyOptions.challenge),
        user: {
          ...publicKeyOptions.user,
          id: typeof publicKeyOptions.user.id === 'string' 
            ? _base64UrlToArrayBuffer(publicKeyOptions.user.id)
            : new Uint8Array([publicKeyOptions.user.id]).buffer
        },
        excludeCredentials: publicKeyOptions.excludeCredentials?.map((credential: any) => ({
          ...credential,
          id: _base64UrlToArrayBuffer(credential.id)
        }))
      };

      // 3. Request the browser to create a credential
      setProgress(50);
      const credential = await navigator.credentials.create({
        publicKey: convertedOptions
      }) as PublicKeyCredential;

      setProgress(70);
      setMessage('Processing your verification...');

      // 4. Convert the credential to a format suitable for the server
      const attestationResponse: WebAuthnAttestationResponse = {
        id: credential.id,
        rawId: _arrayBufferToBase64Url(credential.rawId),
        type: 'public-key',
        response: {
          attestationObject: _arrayBufferToBase64Url(
            (credential.response as AuthenticatorAttestationResponse).attestationObject
          ),
          clientDataJSON: _arrayBufferToBase64Url(
            credential.response.clientDataJSON
          )
        }
      };

      // 5. Send the attestation to the server for verification
      const endpoint = withCamera 
        ? '/api/webauthn/register-hybrid' 
        : '/api/webauthn/register-verify';
      
      const verificationData = withCamera && webcamImage
        ? { attestationResponse, faceImage: webcamImage }
        : { attestationResponse };
      
      const verificationResponse = await axios.post(endpoint, verificationData);
      
      const result = verificationResponse.data as WebAuthnRegistrationResponse;
      
      setProgress(100);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Registration successful');
        toast({
          title: 'Registration Successful',
          description: result.message || 'Your biometric credential has been registered'
        });
        if (onSuccess) onSuccess(result);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      if (onError) onError(error instanceof Error ? error : new Error('Registration failed'));
    }
  };

  // Authentication process
  const startAuthentication = async () => {
    if (!isWebAuthnSupported) {
      setErrorMessage('WebAuthn is not supported in this browser');
      return;
    }

    try {
      setStatus('processing');
      setMessage('Initializing authentication process...');
      setProgress(10);

      // 1. Get authentication options from the server
      const optionsResponse = await axios.post('/api/webauthn/auth-options', {
        userId
      });
      
      const publicKeyOptions = optionsResponse.data;
      setProgress(30);
      setMessage('Asking for your biometric verification...');

      // 2. Convert base64 options to ArrayBuffer
      const convertedOptions = {
        ...publicKeyOptions,
        challenge: _base64UrlToArrayBuffer(publicKeyOptions.challenge),
        allowCredentials: publicKeyOptions.allowCredentials.map((credential: any) => ({
          ...credential,
          id: _base64UrlToArrayBuffer(credential.id)
        })),
      };

      // 3. Request the browser to get a credential
      setProgress(50);
      const credential = await navigator.credentials.get({
        publicKey: convertedOptions
      }) as PublicKeyCredential;

      setProgress(70);
      setMessage('Verifying your identity...');

      // 4. Convert the credential to a format suitable for the server
      const assertionResponse: WebAuthnAssertionResponse = {
        id: credential.id,
        rawId: _arrayBufferToBase64Url(credential.rawId),
        type: 'public-key',
        response: {
          authenticatorData: _arrayBufferToBase64Url(
            (credential.response as AuthenticatorAssertionResponse).authenticatorData
          ),
          clientDataJSON: _arrayBufferToBase64Url(
            credential.response.clientDataJSON
          ),
          signature: _arrayBufferToBase64Url(
            (credential.response as AuthenticatorAssertionResponse).signature
          ),
          userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle 
            ? _arrayBufferToBase64Url((credential.response as AuthenticatorAssertionResponse).userHandle!)
            : undefined
        }
      };

      // 5. Send the assertion to the server for verification
      const endpoint = withCamera 
        ? '/api/webauthn/verify-hybrid' 
        : '/api/webauthn/verify';
      
      const verificationData = withCamera && webcamImage
        ? { assertionResponse, faceImage: webcamImage }
        : { assertionResponse };
      
      const verificationResponse = await axios.post(endpoint, verificationData);
      
      const result = verificationResponse.data as WebAuthnAuthenticationResponse;
      
      setProgress(100);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Authentication successful');
        toast({
          title: 'Authentication Successful',
          description: result.message || 'You have been authenticated successfully'
        });
        if (onSuccess) onSuccess(result);
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      if (onError) onError(error instanceof Error ? error : new Error('Authentication failed'));
    }
  };

  // Helper function to convert ArrayBuffer to base64url string
  function _arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let base64 = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      base64 += String.fromCharCode(bytes[i]);
    }
    return btoa(base64)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Helper function to convert base64url string to ArrayBuffer
  function _base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/') + padding;
    const rawData = atob(base64);
    const buffer = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      buffer[i] = rawData.charCodeAt(i);
    }
    return buffer.buffer;
  }

  // Function to handle the verification action
  const handleVerification = () => {
    setErrorMessage(null);
    
    if (withCamera) {
      setCameraActive(true);
    } else {
      mode === 'register' ? startRegistration() : startAuthentication();
    }
  };

  // Function to capture webcam image as base64
  const captureImage = (imageData: string) => {
    setWebcamImage(imageData);
    setCameraActive(false);
    mode === 'register' ? startRegistration() : startAuthentication();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{title || defaultTitle}</CardTitle>
        <CardDescription>{description || defaultDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isWebAuthnSupported && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Your browser does not support WebAuthn, which is required for biometric authentication.
              Please use a modern browser like Chrome, Firefox, Safari, or Edge.
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {status === 'processing' && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">{message}</AlertDescription>
          </Alert>
        )}
        
        {/* WebCam component would go here when camera is active */}
        {cameraActive && (
          <div className="my-4 text-center">
            <p className="mb-2">Camera placeholder - would capture image here</p>
            {/* For actual implementation, replace with a proper webcam component */}
            <Button onClick={() => captureImage('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD')}>
              Capture Image
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {status !== 'processing' && (
          <Button 
            className="w-full"
            onClick={handleVerification}
            disabled={!isWebAuthnSupported || status === 'processing'}
          >
            {buttonText || defaultButtonText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}