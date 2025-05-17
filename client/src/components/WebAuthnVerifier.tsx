import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FaceIcon, FingerprintIcon, ShieldCheckIcon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { 
  WebAuthnRegistrationOptions, 
  WebAuthnAttestationResponse,
  WebAuthnAuthenticationOptions,
  WebAuthnAssertionResponse,
  WebAuthnRegistrationResponse,
  WebAuthnAuthenticationResponse
} from '../../shared/webauthn';
import axios from 'axios';

// Detect device/platform to provide appropriate biometric terminology
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isApple = /iPhone|iPad|iPod|Mac/i.test(navigator.userAgent);

// Get biometric method name based on platform
const getBiometricName = () => {
  if (isApple) {
    return isMobile ? 'Face ID' : 'Touch ID';
  }
  return isMobile ? 'Biometric Authentication' : 'Windows Hello';
};

interface WebAuthnVerifierProps {
  userId: string | number;
  username: string;
  onSuccess?: (result: WebAuthnAuthenticationResponse) => void;
  onError?: (error: Error) => void;
  mode?: 'register' | 'verify' | 'hybrid';
  showFaceCapture?: boolean;
  customTitle?: string;
  customDescription?: string;
}

/**
 * Component for WebAuthn biometric verification
 * Supports device-based biometrics (Face ID, Touch ID, Windows Hello) with optional server-side face verification
 */
const WebAuthnVerifier: React.FC<WebAuthnVerifierProps> = ({
  userId,
  username,
  onSuccess,
  onError,
  mode = 'verify',
  showFaceCapture = false,
  customTitle,
  customDescription
}) => {
  const [status, setStatus] = useState<string>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebAuthnAuthenticationResponse | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const biometricName = getBiometricName();
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Clean up media stream when component unmounts
  useEffect(() => {
    return () => {
      if (webcamActive && videoRef.current && videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamActive]);

  // Start webcam for face capture
  const startWebcam = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Unable to access webcam. Please ensure camera permissions are granted.');
    }
  };

  // Capture image from webcam
  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg');
    setFaceImage(imageData);
    
    // Stop the webcam
    if (videoRef.current.srcObject) {
      const mediaStream = videoRef.current.srcObject as MediaStream;
      mediaStream.getTracks().forEach(track => track.stop());
    }
    
    setWebcamActive(false);
  };

  // Start biometric registration process
  const startRegistration = async () => {
    try {
      setStatus('registering');
      setProgress(10);
      setError(null);

      // 1. Get registration options from server
      const response = await axios.post('/api/webauthn/register/options', { 
        userId, 
        username 
      });
      
      const options: WebAuthnRegistrationOptions = response.data;
      setProgress(30);

      // 2. Convert challenge from base64 to ArrayBuffer
      const publicKeyOptions = {
        ...options,
        challenge: Uint8Array.from(
          atob(options.challenge), c => c.charCodeAt(0)
        ),
        user: {
          ...options.user,
          id: Uint8Array.from(
            String(options.user.id), c => c.charCodeAt(0)
          ),
        }
      };

      // 3. Create credentials with device biometrics
      setProgress(50);
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions as any
      }) as any;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // 4. Prepare attestation response for server
      const attestationResponse: WebAuthnAttestationResponse = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        type: credential.type,
        response: {
          attestationObject: btoa(String.fromCharCode(
            ...new Uint8Array(credential.response.attestationObject)
          )),
          clientDataJSON: btoa(String.fromCharCode(
            ...new Uint8Array(credential.response.clientDataJSON)
          )),
          publicKey: credential.response.getPublicKey ? 
            btoa(String.fromCharCode(
              ...new Uint8Array(credential.response.getPublicKey())
            )) : undefined
        }
      };

      setProgress(70);

      // 5. Send response to server
      let verifyEndpoint = '/api/webauthn/register/verify';
      let verifyData: any = { attestationResponse };

      if (mode === 'hybrid' && faceImage) {
        verifyEndpoint = '/api/webauthn/hybrid/register';
        verifyData.faceImage = faceImage;
      }

      const verifyResponse = await axios.post(verifyEndpoint, verifyData);
      const registrationResult: WebAuthnRegistrationResponse = verifyResponse.data;

      setProgress(100);
      setStatus('success');
      setResult(registrationResult as any);

      if (onSuccess) {
        onSuccess(registrationResult as any);
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Registration failed');
      console.error('WebAuthn registration error:', err);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  };

  // Start biometric verification process
  const startVerification = async () => {
    try {
      setStatus('verifying');
      setProgress(10);
      setError(null);

      // 1. Get authentication options from server
      const response = await axios.post('/api/webauthn/authenticate/options', { 
        userId 
      });
      
      const options: WebAuthnAuthenticationOptions = response.data;
      setProgress(30);

      // 2. Convert challenge and credential IDs from base64 to ArrayBuffer
      const publicKeyOptions = {
        ...options,
        challenge: Uint8Array.from(
          atob(options.challenge), c => c.charCodeAt(0)
        ),
        allowCredentials: options.allowCredentials.map(cred => ({
          ...cred,
          id: Uint8Array.from(
            atob(cred.id), c => c.charCodeAt(0)
          ),
        }))
      };

      // 3. Get credential from device
      setProgress(50);
      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions as any
      }) as any;

      if (!credential) {
        throw new Error('Failed to get credential');
      }

      // 4. Prepare assertion response for server
      const assertionResponse: WebAuthnAssertionResponse = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        type: credential.type,
        response: {
          authenticatorData: btoa(String.fromCharCode(
            ...new Uint8Array(credential.response.authenticatorData)
          )),
          clientDataJSON: btoa(String.fromCharCode(
            ...new Uint8Array(credential.response.clientDataJSON)
          )),
          signature: btoa(String.fromCharCode(
            ...new Uint8Array(credential.response.signature)
          )),
          userHandle: credential.response.userHandle ? 
            btoa(String.fromCharCode(
              ...new Uint8Array(credential.response.userHandle)
            )) : undefined
        }
      };

      setProgress(70);

      // 5. Send response to server
      let verifyEndpoint = '/api/webauthn/authenticate/verify';
      let verifyData: any = { assertionResponse };

      if (mode === 'hybrid' && faceImage) {
        verifyEndpoint = '/api/webauthn/hybrid/verify';
        verifyData.faceImage = faceImage;
      }

      const verifyResponse = await axios.post(verifyEndpoint, verifyData);
      const authResult: WebAuthnAuthenticationResponse = verifyResponse.data;

      setProgress(100);
      setStatus('success');
      setResult(authResult);

      if (onSuccess) {
        onSuccess(authResult);
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Verification failed');
      console.error('WebAuthn verification error:', err);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  };

  const getActionText = () => {
    if (mode === 'register') {
      return `Register with ${biometricName}`;
    }
    return `Verify with ${biometricName}`;
  };

  const resetProcess = () => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    setResult(null);
    setFaceImage(null);
    setWebcamActive(false);
  };

  const renderStatus = () => {
    const inProcess = status === 'registering' || status === 'verifying';

    switch (status) {
      case 'registering':
        return <>Registering biometric credential...</>;
      case 'verifying':
        return <>Verifying your identity...</>;
      case 'success':
        return (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2Icon className="h-5 w-5" />
            <span>
              {mode === 'register' 
                ? 'Biometric registration successful!' 
                : 'Biometric verification successful!'}
            </span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircleIcon className="h-5 w-5" />
            <span>{error || 'Something went wrong'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'register' ? (
            <FingerprintIcon className="h-5 w-5" />
          ) : (
            <ShieldCheckIcon className="h-5 w-5" />
          )}
          {customTitle || (mode === 'register' 
            ? `Register ${biometricName}` 
            : `Verify with ${biometricName}`)}
        </CardTitle>
        <CardDescription>
          {customDescription || (mode === 'register'
            ? `Register your device biometrics for secure authentication`
            : `Verify your identity using your device biometrics`)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status !== 'idle' && status !== 'error' && (
          <Progress value={progress} className="w-full" />
        )}

        {/* Face capture section */}
        {(showFaceCapture || mode === 'hybrid') && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Facial Verification:</div>
            
            {!faceImage && !webcamActive && (
              <Button 
                variant="outline" 
                onClick={startWebcam}
                className="w-full"
              >
                <FaceIcon className="mr-2 h-4 w-4" />
                Capture Face
              </Button>
            )}
            
            {webcamActive && (
              <div className="space-y-2">
                <div className="relative rounded-md overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <Button onClick={captureImage} className="w-full">
                  Capture Image
                </Button>
              </div>
            )}
            
            {faceImage && (
              <div className="space-y-2">
                <div className="relative rounded-md overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={faceImage} 
                    alt="Captured face" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFaceImage(null);
                    startWebcam();
                  }}
                  className="w-full"
                >
                  Retake Photo
                </Button>
              </div>
            )}
          </div>
        )}

        {renderStatus() && (
          <Alert variant={status === 'success' ? 'default' : 'destructive'}>
            <AlertTitle>
              {status === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>
              {renderStatus()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {status === 'idle' && (
          <Button 
            onClick={mode === 'register' ? startRegistration : startVerification}
            className="w-full"
            disabled={mode === 'hybrid' && !faceImage}
          >
            {mode === 'register' 
              ? <FingerprintIcon className="mr-2 h-4 w-4" /> 
              : <ShieldCheckIcon className="mr-2 h-4 w-4" />
            }
            {getActionText()}
          </Button>
        )}

        {(status === 'success' || status === 'error') && (
          <Button 
            variant="outline" 
            onClick={resetProcess}
            className="w-full"
          >
            {status === 'error' ? 'Try Again' : 'Done'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WebAuthnVerifier;