import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Scan, FingerprintIcon, ShieldCheckIcon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
// Using Scan icon as a replacement for FaceIcon
const FaceIcon = Scan;

// Import shared types
import { 
  WebAuthnRegistrationOptions, 
  WebAuthnAttestationResponse,
  WebAuthnAuthenticationOptions,
  WebAuthnAssertionResponse,
  WebAuthnRegistrationResponse,
  WebAuthnAuthenticationResponse
} from '../../../shared/webauthn';
import axios from 'axios';

// Detect device/platform to provide appropriate biometric terminology
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isMac = /Mac/.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const isWindows = /Windows/.test(navigator.userAgent);

// Get platform-specific biometric terminology
const getBiometricTerm = () => {
  if (isIOS) return "Face ID / Touch ID";
  if (isMac) return "Touch ID";
  if (isWindows) return "Windows Hello";
  if (isMobile) return "Fingerprint / Face recognition";
  return "Biometric authentication";
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
  mode = 'hybrid',
  showFaceCapture = true,
  customTitle,
  customDescription,
}) => {
  // Component state
  const [status, setStatus] = useState<'idle' | 'registering' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [faceCaptured, setFaceCaptured] = useState<boolean>(false);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);
  
  // Video stream for face capture
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Handle biometric authentication flow based on mode
  const startAuthentication = async () => {
    try {
      setStatus(mode === 'register' ? 'registering' : 'verifying');
      setProgress(25);
      setMessage(`Initializing ${getBiometricTerm()}...`);
      
      if (mode === 'register') {
        await startRegistration();
      } else {
        await startVerification();
      }
    } catch (err) {
      const error = err as Error;
      handleError(error);
    }
  };
  
  // Register a new credential
  const startRegistration = async () => {
    try {
      // 1. Get registration options from server
      setMessage("Requesting registration options...");
      const response = await axios.post('/api/webauthn/register-options', {
        userId,
        username,
      });
      
      setProgress(50);
      setMessage(`Please verify with ${getBiometricTerm()}...`);
      
      // 2. Parse the options from the server
      const options: WebAuthnRegistrationOptions = response.data;
      
      // 3. Create credential with device biometrics
      // @ts-ignore: TypeScript doesn't recognize the WebAuthn API properly
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: base64UrlToBuffer(options.challenge),
          user: {
            ...options.user,
            id: typeof options.user.id === 'string' 
              ? base64UrlToBuffer(options.user.id) 
              : new TextEncoder().encode(options.user.id.toString()),
          },
          excludeCredentials: [],
        },
      });
      
      if (!credential) {
        throw new Error("Failed to create credential");
      }
      
      // 4. Format the credential for the server
      const attestationResponse: WebAuthnAttestationResponse = {
        id: credential.id,
        rawId: bufferToBase64Url(new Uint8Array(credential.rawId)),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64Url(new Uint8Array(credential.response.attestationObject)),
          clientDataJSON: bufferToBase64Url(new Uint8Array(credential.response.clientDataJSON)),
        },
      };
      
      setProgress(75);
      setMessage("Verifying with server...");
      
      // 5. Send the credential to the server for verification
      let verifyResponse;
      
      if (mode === 'hybrid' && faceImageBase64) {
        // For hybrid mode, send both credential and face image
        verifyResponse = await axios.post('/api/webauthn/register-hybrid', {
          attestationResponse,
          faceImage: faceImageBase64
        });
      } else {
        // For regular registration, just send credential
        verifyResponse = await axios.post('/api/webauthn/register-verify', {
          attestationResponse
        });
      }
      
      const registrationResult: WebAuthnRegistrationResponse = verifyResponse.data;
      
      if (registrationResult.success) {
        setStatus('success');
        setProgress(100);
        setMessage(registrationResult.message || "Registration successful!");
        
        if (onSuccess) {
          onSuccess({
            success: true,
            message: registrationResult.message,
            user: {
              id: userId,
              username,
              isVerified: true
            }
          });
        }
      } else {
        throw new Error(registrationResult.error || "Registration failed");
      }
    } catch (error) {
      handleError(error as Error);
    }
  };
  
  // Verify with existing credential
  const startVerification = async () => {
    try {
      // 1. Get authentication options from server
      setMessage("Requesting authentication options...");
      const response = await axios.post('/api/webauthn/auth-options', {
        userId,
      });
      
      setProgress(50);
      setMessage(`Please verify with ${getBiometricTerm()}...`);
      
      // 2. Parse the options from the server
      const options: WebAuthnAuthenticationOptions = response.data;
      
      // 3. Verify with device biometrics
      // @ts-ignore: TypeScript doesn't recognize the WebAuthn API properly
      const assertion = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: base64UrlToBuffer(options.challenge),
          allowCredentials: options.allowCredentials.map(cred => ({
            id: base64UrlToBuffer(cred.id),
            type: cred.type,
          })),
        },
      });
      
      if (!assertion) {
        throw new Error("Failed to verify credential");
      }
      
      // 4. Format the assertion for the server
      const assertionResponse: WebAuthnAssertionResponse = {
        id: assertion.id,
        rawId: bufferToBase64Url(new Uint8Array(assertion.rawId)),
        type: assertion.type,
        response: {
          authenticatorData: bufferToBase64Url(new Uint8Array(assertion.response.authenticatorData)),
          clientDataJSON: bufferToBase64Url(new Uint8Array(assertion.response.clientDataJSON)),
          signature: bufferToBase64Url(new Uint8Array(assertion.response.signature)),
          userHandle: assertion.response.userHandle ? bufferToBase64Url(new Uint8Array(assertion.response.userHandle)) : undefined,
        },
      };
      
      setProgress(75);
      setMessage("Verifying with server...");
      
      // 5. Send the assertion to the server for verification
      let verifyResponse;
      
      if (mode === 'hybrid' && faceImageBase64) {
        // For hybrid mode, send both assertion and face image
        verifyResponse = await axios.post('/api/webauthn/verify-hybrid', {
          assertionResponse,
          faceImage: faceImageBase64
        });
      } else {
        // For regular verification, just send assertion
        verifyResponse = await axios.post('/api/webauthn/verify', {
          assertionResponse
        });
      }
      
      const authResult: WebAuthnAuthenticationResponse = verifyResponse.data;
      
      if (authResult.success) {
        setStatus('success');
        setProgress(100);
        setMessage(authResult.message || "Authentication successful!");
        
        if (onSuccess) {
          onSuccess(authResult);
        }
      } else {
        throw new Error(authResult.error || "Authentication failed");
      }
    } catch (error) {
      handleError(error as Error);
    }
  };
  
  // Handle errors
  const handleError = (error: Error) => {
    console.error('WebAuthn error:', error);
    setStatus('error');
    setProgress(0);
    
    // User-friendly error message based on error type
    const errorMessage = getUserFriendlyErrorMessage(error);
    setMessage(errorMessage);
    setErrorDetails(error.message);
    
    if (onError) {
      onError(error);
    }
  };
  
  // Get a user-friendly error message
  const getUserFriendlyErrorMessage = (error: Error): string => {
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('operation either timed out or was not allowed')) {
      return `${getBiometricTerm()} verification was canceled or timed out`;
    }
    
    if (errorMsg.includes('user verification')) {
      return `${getBiometricTerm()} verification failed`;
    }
    
    if (errorMsg.includes('already registered')) {
      return 'This device is already registered for this account';
    }
    
    if (errorMsg.includes('not found')) {
      return 'No registered credentials found for this account';
    }
    
    // Default message
    return 'Authentication failed';
  };
  
  // Start/stop face capture
  useEffect(() => {
    if (mode === 'hybrid' && showFaceCapture && status !== 'success' && status !== 'error') {
      startFaceCapture();
      
      return () => {
        stopFaceCapture();
      };
    }
  }, [mode, showFaceCapture, status]);
  
  // Start face capture
  const startFaceCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      // Continue without face capture
    }
  };
  
  // Stop face capture
  const stopFaceCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };
  
  // Capture face from video
  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get base64 image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setFaceImageBase64(imageData.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        setFaceCaptured(true);
      }
    }
  };
  
  // Convert base64url to buffer
  const base64UrlToBuffer = (base64Url: string): ArrayBuffer => {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(base64 + padding);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return buffer;
  };
  
  // Convert buffer to base64url
  const bufferToBase64Url = (buffer: Uint8Array): string => {
    const binary = Array.from(buffer)
      .map(byte => String.fromCharCode(byte))
      .join('');
    
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };
  
  return (
    <div className="w-full">
      {/* Main authentication card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {customTitle || (mode === 'register' 
              ? "Register Device Biometrics" 
              : "Verify Your Identity")}
          </CardTitle>
          <CardDescription>
            {customDescription || (mode === 'register'
              ? `Register your ${getBiometricTerm()} for secure authentication`
              : `Verify your identity using ${getBiometricTerm()}`)}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Status display */}
          {status !== 'idle' && (
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm">
                  {status === 'registering' ? 'Registration' : 
                   status === 'verifying' ? 'Verification' : 
                   status === 'success' ? 'Complete' : 'Failed'}
                </span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
          
          {/* Status message */}
          {message && (
            <Alert 
              variant={status === 'error' ? 'destructive' : status === 'success' ? 'default' : 'outline'} 
              className="mb-4"
            >
              <div className="flex items-center gap-2">
                {status === 'error' ? (
                  <AlertCircleIcon className="h-4 w-4" />
                ) : status === 'success' ? (
                  <CheckCircle2Icon className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                <AlertTitle>{message}</AlertTitle>
              </div>
              {errorDetails && status === 'error' && (
                <AlertDescription className="mt-2 text-xs opacity-80">
                  Technical details: {errorDetails}
                </AlertDescription>
              )}
            </Alert>
          )}
          
          {/* Face capture (for hybrid mode) */}
          {mode === 'hybrid' && showFaceCapture && status === 'idle' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                This enhanced security option combines your device biometrics with facial recognition
              </div>
              
              <div className="relative mx-auto w-full max-w-[300px] h-[225px] bg-muted rounded-lg overflow-hidden">
                {!faceCaptured ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg pointer-events-none" />
                  </>
                ) : (
                  <canvas 
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                
                {!stream && !faceCaptured && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-4 text-center">
                    <FaceIcon className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Camera access required for enhanced security
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={startFaceCapture}
                    >
                      Enable Camera
                    </Button>
                  </div>
                )}
              </div>
              
              {!faceCaptured && stream ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={captureFace}
                >
                  <FaceIcon className="h-4 w-4 mr-2" />
                  Capture Image
                </Button>
              ) : faceCaptured && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setFaceCaptured(false);
                    setFaceImageBase64(null);
                    startFaceCapture();
                  }}
                >
                  <FaceIcon className="h-4 w-4 mr-2" />
                  Retake Image
                </Button>
              )}
            </div>
          )}
          
          {/* Hidden canvas for face capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </CardContent>
        
        <CardFooter>
          {status === 'idle' && (
            <Button 
              className="w-full" 
              onClick={startAuthentication}
              disabled={mode === 'hybrid' && showFaceCapture && !faceCaptured}
            >
              {mode === 'register' ? (
                <>
                  <FingerprintIcon className="mr-2 h-4 w-4" />
                  Register with {getBiometricTerm()}
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="mr-2 h-4 w-4" />
                  Verify with {getBiometricTerm()}
                </>
              )}
            </Button>
          )}
          
          {(status === 'error') && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setStatus('idle');
                setMessage('');
                setErrorDetails('');
                setProgress(0);
              }}
            >
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default WebAuthnVerifier;