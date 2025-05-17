import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Fingerprint, Shield, AlertCircle, Loader2, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const WebAuthnVerifier: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'registering' | 'authenticating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [isHybrid, setIsHybrid] = useState<boolean>(true);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState<boolean>(true);
  const [isPlatformAuthenticatorAvailable, setIsPlatformAuthenticatorAvailable] = useState<boolean>(true);
  const [authProgress, setAuthProgress] = useState<number>(0);
  const [deviceType, setDeviceType] = useState<'ios' | 'mac' | 'android' | 'windows' | 'other'>('other');
  
  // Detect device type for better UX messaging
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf('iphone') !== -1 || userAgent.indexOf('ipad') !== -1) {
      setDeviceType('ios');
    } else if (userAgent.indexOf('mac') !== -1) {
      setDeviceType('mac');
    } else if (userAgent.indexOf('android') !== -1) {
      setDeviceType('android');
    } else if (userAgent.indexOf('windows') !== -1) {
      setDeviceType('windows');
    }
  }, []);
  
  // Get friendly biometric system name based on detected device
  const getBiometricName = () => {
    switch (deviceType) {
      case 'ios':
        return 'Face ID/Touch ID';
      case 'mac':
        return 'Touch ID';
      case 'android':
        return 'Fingerprint/Face Unlock';
      case 'windows':
        return 'Windows Hello';
      default:
        return 'Biometric Authentication';
    }
  };
  
  // Check if WebAuthn and platform authenticator (Touch ID/Face ID) are available
  useEffect(() => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      setIsWebAuthnSupported(false);
      return;
    }
    
    // Check if platform authenticator is available
    if ("PublicKeyCredential" in window) {
      try {
        // Check if the browser supports publicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        if (typeof (window.PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
          (window.PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable().then((available: boolean) => {
            setIsPlatformAuthenticatorAvailable(available);
          }).catch((error: Error) => {
            console.error('Error checking platform authenticator availability:', error);
            setIsPlatformAuthenticatorAvailable(false);
          });
        } else {
          // Fallback for browsers that don't support the availability check API
          (navigator.credentials as any).create({
            publicKey: {
              challenge: new Uint8Array(32),
              rp: { name: "Heirloom Identity" },
              user: {
                id: new Uint8Array(16),
                name: "test",
                displayName: "Test User",
              },
              pubKeyCredParams: [{ type: "public-key", alg: -7 }],
              authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "preferred",
              },
              timeout: 60000,
            },
          }).catch((err: Error) => {
            if (err.name === "NotSupportedError") {
              setIsPlatformAuthenticatorAvailable(false);
            }
          });
        }
      } catch (e) {
        console.error("Error checking platform authenticator:", e);
        setIsPlatformAuthenticatorAvailable(false);
      }
    } else {
      setIsWebAuthnSupported(false);
    }
  }, []);

  // Function to start WebAuthn registration
  const startRegistration = async () => {
    try {
      setStatus('registering');
      setMessage(`Activating ${getBiometricName()}...`);
      setAuthProgress(10);
      
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error(`Your browser doesn't support biometric authentication`);
      }

      setAuthProgress(20);
      // Get registration options from the server
      const optionsResponse = await fetch('/api/webauthn/register/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'testuser' }),
      });
      
      if (!optionsResponse.ok) {
        const error = await optionsResponse.text();
        throw new Error(`Server error: ${error}`);
      }
      
      const options = await optionsResponse.json();
      setAuthProgress(30);
      
      // Convert base64 challenge to ArrayBuffer
      options.publicKey.challenge = Uint8Array.from(
        atob(options.publicKey.challenge), c => c.charCodeAt(0)
      );
      
      // Convert user ID to ArrayBuffer
      options.publicKey.user.id = Uint8Array.from(
        atob(options.publicKey.user.id), c => c.charCodeAt(0)
      );
      
      // Ensure we request platform authenticator
      if (!options.publicKey.authenticatorSelection) {
        options.publicKey.authenticatorSelection = {};
      }
      options.publicKey.authenticatorSelection.authenticatorAttachment = "platform";
      options.publicKey.authenticatorSelection.userVerification = "preferred";
      
      setMessage(`Please use ${getBiometricName()} when prompted`);
      setAuthProgress(40);
      
      // Create credentials
      const credential = await navigator.credentials.create({
        publicKey: options.publicKey
      }) as PublicKeyCredential;
      
      setMessage(`${getBiometricName()} verification successful`);
      setAuthProgress(70);
      
      // Prepare the attestation for sending to the server
      const attestationObj = credential.response as AuthenticatorAttestationResponse;
      const clientDataJSON = arrayBufferToBase64(attestationObj.clientDataJSON);
      const attestationObject = arrayBufferToBase64(attestationObj.attestationObject);
      
      // Verify the attestation with the server
      const verifyResponse = await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: credential.id,
          rawId: arrayBufferToBase64(credential.rawId),
          response: {
            clientDataJSON,
            attestationObject,
          },
          type: credential.type,
        }),
      });
      
      setAuthProgress(90);
      
      if (!verifyResponse.ok) {
        const error = await verifyResponse.text();
        throw new Error(`Server verification failed: ${error}`);
      }
      
      const verifyResult = await verifyResponse.json();
      setAuthProgress(100);
      setStatus('success');
      setMessage(`${getBiometricName()} successfully registered!`);
      
      // Reset progress after a moment
      setTimeout(() => {
        setAuthProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setStatus('error');
      
      // Provide more user-friendly error messages
      let errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('already registered')) {
        errorMessage = `This ${getBiometricName()} has already been registered`;
      } else if (errorMessage.includes('aborted')) {
        errorMessage = `${getBiometricName()} registration was cancelled`;
      } else if (errorMessage.includes('timeout')) {
        errorMessage = `${getBiometricName()} didn't respond in time`;
      }
      
      setMessage(errorMessage);
      setAuthProgress(0);
    }
  };

  // Function to start hybrid registration (Device biometrics + Face)
  const startHybridRegistration = async () => {
    try {
      setStatus('registering');
      setMessage(`Preparing two-factor registration...`);
      setAuthProgress(10);
      
      // First step: WebAuthn/Biometric registration
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error(`Your browser doesn't support ${getBiometricName()}`);
      }
      
      setMessage(`Step 1: Activating ${getBiometricName()}...`);
      setAuthProgress(20);
      
      // Get registration options from the server
      const optionsResponse = await fetch('/api/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser' }),
      });
      
      if (!optionsResponse.ok) {
        const error = await optionsResponse.text();
        throw new Error(`Server error: ${error}`);
      }
      
      const options = await optionsResponse.json();
      
      // Convert base64 challenge to ArrayBuffer
      options.publicKey.challenge = Uint8Array.from(
        atob(options.publicKey.challenge), c => c.charCodeAt(0)
      );
      
      // Convert user ID to ArrayBuffer
      options.publicKey.user.id = Uint8Array.from(
        atob(options.publicKey.user.id), c => c.charCodeAt(0)
      );
      
      // Ensure we request platform authenticator
      if (!options.publicKey.authenticatorSelection) {
        options.publicKey.authenticatorSelection = {};
      }
      options.publicKey.authenticatorSelection.authenticatorAttachment = "platform";
      options.publicKey.authenticatorSelection.userVerification = "preferred";
      
      setMessage(`Please use ${getBiometricName()} when prompted`);
      setAuthProgress(30);
      
      // Create credentials - this triggers the native biometric prompt
      const credential = await navigator.credentials.create({
        publicKey: options.publicKey
      }) as PublicKeyCredential;
      
      setMessage(`${getBiometricName()} verified! Now capturing face for server-side recognition...`);
      setAuthProgress(50);
      
      // Second step: Capture face for server-side verification
      // Check if webcam is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is required for the second step');
      }
      
      // Capture face image from webcam
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      
      // Create a canvas to capture the image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }
      
      // Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Stop the video stream
      stream.getTracks().forEach(track => track.stop());
      
      // Convert the canvas to a data URL (base64 image)
      const faceImageData = canvas.toDataURL('image/jpeg');
      setFaceImage(faceImageData);
      
      // Remove the data:image/jpeg;base64, prefix
      const base64Image = faceImageData.split(',')[1];
      
      setMessage(`Face captured, verifying with server...`);
      setAuthProgress(70);
      
      // Prepare the attestation data from WebAuthn
      const attestationObj = credential.response as AuthenticatorAttestationResponse;
      const clientDataJSON = arrayBufferToBase64(attestationObj.clientDataJSON);
      const attestationObject = arrayBufferToBase64(attestationObj.attestationObject);
      
      // Send both WebAuthn credentials and face image for hybrid verification
      const response = await fetch('/api/webauthn/hybrid/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          faceImage: base64Image,
          credential: {
            id: credential.id,
            rawId: arrayBufferToBase64(credential.rawId),
            response: {
              clientDataJSON,
              attestationObject,
            },
            type: credential.type,
          }
        }),
      });
      
      setAuthProgress(90);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Server verification failed: ${error}`);
      }
      
      const result = await response.json();
      setAuthProgress(100);
      setStatus('success');
      setMessage(`Two-factor registration complete! Your device biometrics and facial features are now registered.`);
      
      // Reset progress after a moment
      setTimeout(() => {
        setAuthProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Hybrid registration error:', error);
      setStatus('error');
      
      // Provide more user-friendly error messages
      let errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Permission denied')) {
        errorMessage = 'Camera access was denied. Please allow camera access for facial verification.';
      } else if (errorMessage.includes('aborted')) {
        errorMessage = `Registration was cancelled`;
      } else if (errorMessage.includes('NotAllowedError')) {
        errorMessage = 'Permission to use camera or biometric sensor was denied';
      }
      
      setMessage(errorMessage);
      setAuthProgress(0);
    }
  };

  // Function to authenticate with WebAuthn
  const startAuthentication = async () => {
    try {
      setStatus('authenticating');
      setMessage(`Initiating ${getBiometricName()} verification...`);
      setAuthProgress(10);
      
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error(`Your browser doesn't support biometric authentication`);
      }

      setAuthProgress(20);
      // Get authentication options from the server
      const optionsResponse = await fetch('/api/webauthn/authenticate/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'testuser' }),
      });
      
      if (!optionsResponse.ok) {
        const error = await optionsResponse.text();
        throw new Error(`Server error: ${error}`);
      }
      
      setAuthProgress(30);
      const options = await optionsResponse.json();
      
      // Convert base64 challenge to ArrayBuffer
      options.publicKey.challenge = Uint8Array.from(
        atob(options.publicKey.challenge), c => c.charCodeAt(0)
      );
      
      // Convert allowed credentials to proper format
      if (options.publicKey.allowCredentials) {
        options.publicKey.allowCredentials = options.publicKey.allowCredentials.map((cred: any) => {
          return {
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          };
        });
      }
      
      // Set user verification preference
      options.publicKey.userVerification = "preferred";
      
      setMessage(`Please use ${getBiometricName()} when prompted`);
      setAuthProgress(40);
      
      // Get credentials - this triggers the native biometric prompt
      const credential = await navigator.credentials.get({
        publicKey: options.publicKey
      }) as PublicKeyCredential;
      
      setMessage(`${getBiometricName()} verified`);
      setAuthProgress(60);
      
      // Prepare the assertion for sending to the server
      const assertionResponse = credential.response as AuthenticatorAssertionResponse;
      const clientDataJSON = arrayBufferToBase64(assertionResponse.clientDataJSON);
      const authenticatorData = arrayBufferToBase64(assertionResponse.authenticatorData);
      const signature = arrayBufferToBase64(assertionResponse.signature);
      const userHandle = assertionResponse.userHandle 
        ? arrayBufferToBase64(assertionResponse.userHandle) 
        : null;
      
      // Create base request body with device verification
      const requestBody: any = {
        id: credential.id,
        rawId: arrayBufferToBase64(credential.rawId),
        response: {
          clientDataJSON,
          authenticatorData,
          signature,
          userHandle,
        },
        type: credential.type,
      };
      
      // Determine if we need to add server-side facial verification
      let endpoint = '/api/webauthn/authenticate/verify';
      
      // If hybrid mode is enabled, add facial recognition as a second factor
      if (isHybrid) {
        endpoint = '/api/webauthn/hybrid/verify';
        setMessage(`${getBiometricName()} verified! Now capturing face for additional security...`);
        
        try {
          // Capture face image from webcam
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const video = document.createElement('video');
          video.srcObject = stream;
          await video.play();
          
          // Create a canvas to capture the image
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Failed to create canvas context');
          }
          
          // Draw the current video frame to the canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Stop the video stream
          stream.getTracks().forEach(track => track.stop());
          
          // Convert the canvas to a data URL (base64 image)
          const faceImageData = canvas.toDataURL('image/jpeg');
          setFaceImage(faceImageData);
          
          // Remove the data:image/jpeg;base64, prefix
          const base64Image = faceImageData.split(',')[1];
          requestBody.faceImage = base64Image;
          
          setMessage(`Face image captured, verifying with server...`);
        } catch (error) {
          console.error('Failed to capture face image:', error);
          throw new Error('Camera access is required for two-factor authentication');
        }
      }
      
      setAuthProgress(80);
      
      // Send verification data to server
      const verifyResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!verifyResponse.ok) {
        const error = await verifyResponse.text();
        throw new Error(`Verification failed: ${error}`);
      }
      
      const verifyResult = await verifyResponse.json();
      setAuthProgress(100);
      setStatus('success');
      
      // Set appropriate success message based on authentication type
      if (isHybrid) {
        setMessage(`Two-factor authentication successful! Both your device biometrics and facial features were verified.`);
      } else {
        setMessage(`${getBiometricName()} authentication successful!`);
      }
      
      // Reset progress after a moment
      setTimeout(() => {
        setAuthProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Authentication error:', error);
      setStatus('error');
      
      // Provide more user-friendly error messages
      let errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Permission denied')) {
        errorMessage = 'Camera access was denied. Please allow camera access for facial verification.';
      } else if (errorMessage.includes('aborted')) {
        errorMessage = `Authentication was cancelled`;
      } else if (errorMessage.includes('NotAllowedError')) {
        errorMessage = 'Permission to use camera or biometric sensor was denied';
      } else if (errorMessage.includes('no matching credential')) {
        errorMessage = `No registered ${getBiometricName()} found. Please register first.`;
      }
      
      setMessage(errorMessage);
      setAuthProgress(0);
    }
  };

  // Helper function to convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-6 w-6 text-primary" />
          {getBiometricName()} Authentication
        </CardTitle>
        <CardDescription>
          Secure identity verification using your device's biometric system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-6">
        {/* Device compatibility warnings */}
        {!isWebAuthnSupported && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <AlertTitle>Biometric Authentication Not Supported</AlertTitle>
              <AlertDescription>
                Your browser doesn't support biometric authentication. Please use a modern browser like Chrome, Firefox, or Safari.
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        {isWebAuthnSupported && !isPlatformAuthenticatorAvailable && (
          <Alert>
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <AlertTitle>{getBiometricName()} Not Available</AlertTitle>
              <AlertDescription>
                Your device doesn't appear to have {getBiometricName()} configured. You can still use a security key if available.
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        {/* Authentication progress */}
        {authProgress > 0 && (
          <div className="my-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Verification in progress...</span>
              <span>{authProgress}%</span>
            </div>
            <Progress value={authProgress} className="h-2" />
          </div>
        )}
        
        {/* Authentication mode selection */}
        <div className="p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2 text-sm">Authentication Mode</h4>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="hybrid-toggle"
              checked={isHybrid}
              onChange={(e) => setIsHybrid(e.target.checked)}
              className="rounded border-gray-300 mt-0.5"
            />
            <div>
              <label htmlFor="hybrid-toggle" className="font-medium text-sm flex items-center gap-1 cursor-pointer">
                Two-factor biometric verification
                <div className="relative group">
                  <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 w-64 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Combines device biometrics ({getBiometricName()}) with server-side facial recognition for enhanced security.
                  </div>
                </div>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                {isHybrid 
                  ? `Using both ${getBiometricName()} and facial recognition for enhanced security` 
                  : `Using only ${getBiometricName()} for faster authentication`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Status message */}
        {status !== 'idle' && (
          <Alert variant={status === 'error' ? 'destructive' : status === 'success' ? 'default' : 'default'}>
            <div className="flex gap-2">
              {status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : status === 'error' ? (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
              )}
              <div>
                <AlertTitle>
                  {status === 'registering' ? 'Registration in Progress' : 
                  status === 'authenticating' ? 'Authentication in Progress' :
                  status === 'success' ? 'Success!' : 'Error'}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </div>
            </div>
          </Alert>
        )}
        
        {/* Face image preview (if captured in hybrid mode) */}
        {faceImage && isHybrid && (
          <div className="mt-2 p-3 border rounded-md bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Captured Face Image:</h4>
            <div className="relative">
              <img 
                src={faceImage} 
                alt="Captured face" 
                className="w-full max-w-xs mx-auto object-cover border rounded-md" 
              />
              {status === 'success' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
        <Button 
          onClick={isHybrid ? startHybridRegistration : startRegistration}
          disabled={status === 'registering' || status === 'authenticating' || !isWebAuthnSupported}
          variant="outline"
          className="w-full sm:flex-1 gap-2"
        >
          <Fingerprint className="h-4 w-4" />
          Register {getBiometricName()}
        </Button>
        
        <Button 
          onClick={startAuthentication}
          disabled={status === 'registering' || status === 'authenticating' || !isWebAuthnSupported}
          variant="default"
          className="w-full sm:flex-1 gap-2"
        >
          <Shield className="h-4 w-4" />
          Verify with {getBiometricName()}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebAuthnVerifier;