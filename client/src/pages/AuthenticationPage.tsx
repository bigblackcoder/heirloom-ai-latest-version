import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';

// Import UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Authentication steps
enum AuthStep {
  INITIAL = 'initial',
  DEVICE_BIOMETRIC = 'device_biometric',
  FACE_VERIFICATION = 'face_verification',
  COMPLETE = 'complete',
  DASHBOARD = 'dashboard',
}

const AuthenticationPage: React.FC = () => {
  // State
  const [authStep, setAuthStep] = useState<AuthStep>(AuthStep.INITIAL);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [username, setUsername] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Video elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Navigation
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Handle WebAuthn registration
  const handleWebAuthnRegister = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Generate random user ID and username for testing
      const testUserId = Math.floor(Math.random() * 10000);
      const testUsername = `user_${testUserId}`;
      setUserId(testUserId);
      setUsername(testUsername);

      // Create challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create credential creation options
      const publicKeyCredentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: 'Heirloom Identity Platform',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(testUserId.toString()),
            name: testUsername,
            displayName: `Test User ${testUserId}`,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256
            { type: 'public-key', alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred'
          },
          timeout: 60000,
          attestation: 'none'
        }
      };

      // Create WebAuthn credential
      const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions);
      
      if (credential) {
        setSuccess('Device registration successful! Your biometric data is securely stored on your device.');
        
        // In a real app, we'd send the credential to the server
        console.log('Registration credential:', credential);
        
        // Move to next step
        setAuthStep(AuthStep.FACE_VERIFICATION);
      }
    } catch (err) {
      console.error('WebAuthn registration error:', err);
      setError(`Device registration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle WebAuthn authentication
  const handleWebAuthnAuthenticate = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Create challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create credential request options
      const publicKeyCredentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: 'required',
          timeout: 60000
        }
      };

      // Get credentials
      const assertion = await navigator.credentials.get(publicKeyCredentialRequestOptions);
      
      if (assertion) {
        setSuccess('Device authentication successful! Your identity has been verified by your device.');
        console.log('Authentication assertion:', assertion);
        
        // Set random user ID for testing
        const testUserId = Math.floor(Math.random() * 10000);
        setUserId(testUserId);
        
        // Move to next step
        setAuthStep(AuthStep.FACE_VERIFICATION);
      }
    } catch (err) {
      console.error('WebAuthn authentication error:', err);
      setError(`Device authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start camera for face verification
  const startCamera = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Request access to user's camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Store stream reference for cleanup
      mediaStreamRef.current = stream;

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.display = 'block';
      }

      setSuccess('Camera started. Please position your face in the center and click "Capture Photo".');
    } catch (err) {
      console.error('Camera access error:', err);
      setError(`Failed to access camera: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Capture photo for face verification
  const capturePhoto = () => {
    try {
      setIsProcessing(true);
      setError(null);

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        throw new Error('Video or canvas element not found');
      }

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas context not available');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64 data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64Data = imageDataUrl.split(',')[1]; // Remove data URL prefix

      // In a real app, we would send this to the server for face verification
      console.log('Captured face image (first 100 chars):', base64Data.substring(0, 100) + '...');

      // Simulate face verification (in a real app, this would call the server)
      simulateFaceVerification(base64Data);

    } catch (err) {
      console.error('Photo capture error:', err);
      setError(`Failed to capture photo: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  // Simulate face verification with server
  const simulateFaceVerification = (faceData: string) => {
    // Simulate network request to server
    setTimeout(() => {
      // Generate random verification result
      const confidence = Math.floor(Math.random() * 30) + 70;
      const isMatched = confidence > 85;

      if (isMatched) {
        setSuccess('Face verification successful! Your identity has been verified.');
        
        // Proceed to complete state
        stopCamera();
        setAuthStep(AuthStep.COMPLETE);
        
        // In a real app, we would navigate to the dashboard or home page
        toast({
          title: "Authentication Successful",
          description: "You've been successfully authenticated.",
        });
        
        // Simulate redirect after successful authentication
        setTimeout(() => {
          setLocation('/dashboard');
        }, 2000);
      } else {
        setError(`Face verification failed. Confidence score: ${confidence}%. Please try again.`);
        stopCamera(); // Stop camera on failure
        startCamera(); // Restart camera for another attempt
      }
      
      setIsProcessing(false);
    }, 1500); // Simulate 1.5s server processing time
  };

  // Stop camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.style.display = 'none';
    }
  };

  // Reset authentication state
  const resetAuthentication = () => {
    stopCamera();
    setAuthStep(AuthStep.INITIAL);
    setError(null);
    setSuccess(null);
    setUserId(null);
    setUsername('');
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Render Authentication Step UI
  const renderAuthStep = () => {
    switch (authStep) {
      case AuthStep.INITIAL:
        return (
          <div className="identity-verification-container">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#273414] mb-2">Verified Identity</h3>
              <p className="text-[#273414]/70 text-sm">
                Complete identity verification in two simple steps to access the platform securely.
              </p>
            </div>
            
            <div className="bg-[#e9f0e6] p-4 rounded-lg border border-[#273414]/10 mb-4">
              <div className="flex items-center mb-2">
                <div className="w-7 h-7 rounded-full bg-[#273414] text-white flex items-center justify-center mr-3">
                  <span className="text-sm font-bold">1</span>
                </div>
                <h4 className="font-medium text-[#273414]">Device Authentication</h4>
              </div>
              <p className="text-sm text-[#273414]/70 mb-3 pl-10">
                Use your device biometrics to verify your identity
              </p>
              <div className="pl-10">
                <Button 
                  className="w-full bg-[#273414] text-white hover:bg-[#1d2810]" 
                  onClick={activeTab === 'login' ? handleWebAuthnAuthenticate : handleWebAuthnRegister}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : activeTab === 'login' ? 'Authenticate With Biometrics' : 'Register Device Biometrics'}
                </Button>
              </div>
            </div>
            
            <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-6 opacity-70">
              <div className="flex items-center mb-2">
                <div className="w-7 h-7 rounded-full bg-[#273414]/70 text-white flex items-center justify-center mr-3">
                  <span className="text-sm font-bold">2</span>
                </div>
                <h4 className="font-medium text-[#273414]">Face Verification</h4>
              </div>
              <p className="text-sm text-[#273414]/70 mb-3 pl-10">
                Verify your face to complete the authentication process
              </p>
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                className="border-[#273414] text-[#273414]"
                onClick={() => window.history.back()}
              >
                Back
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'login' ? 'outline' : 'default'}
                  className={activeTab === 'login' ? 'border-[#273414] text-[#273414]' : 'bg-[#273414] text-white'}
                  onClick={() => setActiveTab('register')}
                >
                  Register
                </Button>
                <Button
                  variant={activeTab === 'register' ? 'outline' : 'default'}
                  className={activeTab === 'register' ? 'border-[#273414] text-[#273414]' : 'bg-[#273414] text-white'}
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        );
        
      case AuthStep.FACE_VERIFICATION:
        return (
          <div className="face-verification-container">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#273414] mb-2">Verified Identity</h3>
              <p className="text-[#273414]/70 text-sm">
                Complete identity verification in two simple steps to access the platform securely.
              </p>
            </div>
            
            <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-4 opacity-70">
              <div className="flex items-center mb-2">
                <div className="w-7 h-7 rounded-full bg-[#273414]/70 text-white flex items-center justify-center mr-3">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <h4 className="font-medium text-[#273414]">Device Authentication</h4>
              </div>
              <p className="text-sm text-[#273414]/70 pl-10">
                Authentication completed successfully
              </p>
            </div>
            
            <div className="bg-[#e9f0e6] p-4 rounded-lg border border-[#273414]/10 mb-4">
              <div className="flex items-center mb-2">
                <div className="w-7 h-7 rounded-full bg-[#273414] text-white flex items-center justify-center mr-3">
                  <span className="text-sm font-bold">2</span>
                </div>
                <h4 className="font-medium text-[#273414]">Face Verification</h4>
              </div>
              <p className="text-sm text-[#273414]/70 mb-3 pl-10">
                Use your camera to verify your face
              </p>
              
              <div className="video-container relative w-full mx-auto mb-4 pl-10">
                <video 
                  ref={videoRef} 
                  className="w-full rounded-md border border-[#273414]/20" 
                  autoPlay 
                  playsInline
                />
                <canvas 
                  ref={canvasRef} 
                  className="hidden" 
                />
              </div>
              
              <div className="pl-10">
                {!mediaStreamRef.current ? (
                  <Button 
                    onClick={startCamera}
                    disabled={isProcessing}
                    className="w-full bg-[#273414] text-white hover:bg-[#1d2810]"
                  >
                    {isProcessing ? 'Starting Camera...' : 'Start Camera'}
                  </Button>
                ) : (
                  <Button 
                    onClick={capturePhoto}
                    disabled={isProcessing}
                    className="w-full bg-[#273414] text-white hover:bg-[#1d2810]"
                  >
                    {isProcessing ? 'Verifying...' : 'Capture & Verify Face'}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={resetAuthentication}
                disabled={isProcessing}
                className="border-[#273414] text-[#273414] w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        );
        
      case AuthStep.COMPLETE:
        return (
          <div className="complete-screen">
            <div className="mb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e9f0e6] flex items-center justify-center mx-auto mb-4">
                <span className="text-[#273414] text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-[#273414] mb-2">Verification Complete</h3>
              <p className="text-[#273414]/70 text-sm">
                Your identity has been successfully verified
              </p>
            </div>
            
            <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-3">
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-full bg-[#273414]/70 text-white flex items-center justify-center mr-3">
                  <span className="text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#273414]">Device Authentication</h4>
                  <p className="text-xs text-[#273414]/70">
                    Biometric verification successful
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-6">
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-full bg-[#273414]/70 text-white flex items-center justify-center mr-3">
                  <span className="text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#273414]">Face Verification</h4>
                  <p className="text-xs text-[#273414]/70">
                    Face verification successful
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={() => {
                  // Store auth token
                  localStorage.setItem('userToken', 'mock-auth-token-' + Date.now());
                  // Navigate to dashboard
                  window.location.href = '/dashboard';
                }}
                className="w-full bg-[#273414] text-white hover:bg-[#1d2810]"
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Main UI
  return (
    <div className="authentication-page min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#273414] text-white px-6 py-5">
        <div className="flex items-center">
          <img 
            src="/logo-heirloom.png" 
            alt="Heirloom Logo" 
            className="h-8 w-auto"
            onError={(e) => {
              // Fallback if image isn't found
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="ml-3 text-xl font-bold">Heirloom</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-[#e9f0e6] border-[#273414]/20">
            <AlertTitle className="text-[#273414]">Success</AlertTitle>
            <AlertDescription className="text-[#273414]/80">{success}</AlertDescription>
          </Alert>
        )}
        
        {renderAuthStep()}
      </div>
    </div>
  );
};

export default AuthenticationPage;