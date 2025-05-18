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
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
              <Button 
                className="w-full" 
                onClick={handleWebAuthnAuthenticate}
                disabled={isProcessing}
              >
                {isProcessing ? 'Authenticating...' : 'Authenticate with Device Biometrics'}
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="mt-4">
              <Button 
                className="w-full" 
                onClick={handleWebAuthnRegister}
                disabled={isProcessing}
              >
                {isProcessing ? 'Registering...' : 'Register Device Biometrics'}
              </Button>
            </TabsContent>
          </Tabs>
        );
        
      case AuthStep.FACE_VERIFICATION:
        return (
          <div className="face-verification-container">
            <div className="video-container relative w-full max-w-md mx-auto my-4">
              <video 
                ref={videoRef} 
                className="w-full rounded-md" 
                autoPlay 
                playsInline
              />
              <canvas 
                ref={canvasRef} 
                className="hidden" 
              />
            </div>
            
            <div className="flex flex-col gap-4">
              {!mediaStreamRef.current ? (
                <Button 
                  onClick={startCamera}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Starting Camera...' : 'Start Camera'}
                </Button>
              ) : (
                <Button 
                  onClick={capturePhoto}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Verifying...' : 'Capture & Verify Face'}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={resetAuthentication}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        );
        
      case AuthStep.COMPLETE:
        return (
          <div className="complete-screen text-center">
            <div className="p-4 mb-4 bg-green-50 rounded-md">
              <h3 className="text-xl font-semibold text-green-800">Authentication Complete</h3>
              <p className="text-green-700">
                Your identity has been successfully verified using multiple factors.
              </p>
            </div>
            
            <Button 
              onClick={resetAuthentication}
              className="mt-4"
            >
              Start Over
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Main UI
  return (
    <div className="authentication-page min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-[#273414] to-[#1d2810]">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b border-muted pb-4">
          <CardTitle className="text-center text-2xl font-bold text-[#273414]">Secure Authentication</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {authStep === AuthStep.INITIAL && "Verify your identity with multi-factor authentication"}
            {authStep === AuthStep.FACE_VERIFICATION && "Please complete face verification"}
            {authStep === AuthStep.COMPLETE && "Authentication successful"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
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
        </CardContent>
        
        <CardFooter className="flex flex-col text-sm text-muted-foreground border-t border-muted pt-4">
          <div className="text-center w-full">
            Protected by Heirloom Identity Platform
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthenticationPage;