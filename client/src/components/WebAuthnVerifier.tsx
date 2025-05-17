import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Fingerprint, Shield } from 'lucide-react';

const WebAuthnVerifier: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'registering' | 'authenticating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [isHybrid, setIsHybrid] = useState<boolean>(true);
  const [faceImage, setFaceImage] = useState<string | null>(null);

  // Function to start WebAuthn registration
  const startRegistration = async () => {
    try {
      setStatus('registering');
      setMessage('Starting registration...');
      
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

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
        throw new Error(`Failed to get registration options: ${error}`);
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
      
      // Create credentials
      const credential = await navigator.credentials.create({
        publicKey: options.publicKey
      }) as PublicKeyCredential;
      
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
      
      if (!verifyResponse.ok) {
        const error = await verifyResponse.text();
        throw new Error(`Failed to verify registration: ${error}`);
      }
      
      const verifyResult = await verifyResponse.json();
      setStatus('success');
      setMessage(`Registration successful! ${verifyResult.message || ''}`);
    } catch (error) {
      console.error('Registration error:', error);
      setStatus('error');
      setMessage(`Registration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Function to start hybrid registration (WebAuthn + Face)
  const startHybridRegistration = async () => {
    try {
      setStatus('registering');
      setMessage('Starting hybrid registration with Face ID...');
      
      // Check if webcam is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
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
      
      // Send the face image and register with WebAuthn
      const response = await fetch('/api/webauthn/hybrid/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          faceImage: base64Image
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to register with hybrid auth: ${error}`);
      }
      
      const result = await response.json();
      setStatus('success');
      setMessage(`Hybrid registration successful! ${result.message || ''}`);
    } catch (error) {
      console.error('Hybrid registration error:', error);
      setStatus('error');
      setMessage(`Hybrid registration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Function to authenticate with WebAuthn
  const startAuthentication = async () => {
    try {
      setStatus('authenticating');
      setMessage('Starting authentication...');
      
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

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
        throw new Error(`Failed to get authentication options: ${error}`);
      }
      
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
      
      // Get credentials
      const credential = await navigator.credentials.get({
        publicKey: options.publicKey
      }) as PublicKeyCredential;
      
      // Prepare the assertion for sending to the server
      const assertionResponse = credential.response as AuthenticatorAssertionResponse;
      const clientDataJSON = arrayBufferToBase64(assertionResponse.clientDataJSON);
      const authenticatorData = arrayBufferToBase64(assertionResponse.authenticatorData);
      const signature = arrayBufferToBase64(assertionResponse.signature);
      const userHandle = assertionResponse.userHandle 
        ? arrayBufferToBase64(assertionResponse.userHandle) 
        : null;
      
      // Verify the assertion with the server
      const endpoint = isHybrid ? '/api/webauthn/hybrid/verify' : '/api/webauthn/authenticate/verify';
      
      // If using hybrid auth and we have a face image, include it
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
      
      // For hybrid auth, we would also send a face image, but we'll capture it when needed
      if (isHybrid) {
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
        } catch (error) {
          console.error('Failed to capture face image:', error);
          throw new Error('Failed to capture face image for hybrid verification');
        }
      }
      
      const verifyResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!verifyResponse.ok) {
        const error = await verifyResponse.text();
        throw new Error(`Failed to verify authentication: ${error}`);
      }
      
      const verifyResult = await verifyResponse.json();
      setStatus('success');
      setMessage(`Authentication successful! ${verifyResult.message || ''}`);
    } catch (error) {
      console.error('Authentication error:', error);
      setStatus('error');
      setMessage(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          WebAuthn Face ID Tester
        </CardTitle>
        <CardDescription>
          Test Face ID integration with WebAuthn on your MacBook
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hybrid-toggle"
            checked={isHybrid}
            onChange={(e) => setIsHybrid(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="hybrid-toggle">
            Use hybrid authentication (Face ID + WebAuthn)
          </label>
        </div>
        
        {status !== 'idle' && (
          <Alert variant={status === 'error' ? 'destructive' : status === 'success' ? 'default' : 'outline'}>
            <div className="flex items-center gap-2">
              {status === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : status === 'error' ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <Fingerprint className="h-4 w-4 animate-pulse" />
              )}
              <AlertTitle>
                {status === 'registering' ? 'Registering...' : 
                 status === 'authenticating' ? 'Authenticating...' :
                 status === 'success' ? 'Success!' : 'Error'}
              </AlertTitle>
            </div>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {faceImage && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Captured Face Image:</h3>
            <img 
              src={faceImage} 
              alt="Captured face" 
              className="w-full max-w-xs mx-auto rounded-md border border-gray-300"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={isHybrid ? startHybridRegistration : startRegistration}
          disabled={status === 'registering' || status === 'authenticating'}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Register {isHybrid ? 'with Face ID' : 'Device'}
        </Button>
        
        <Button 
          onClick={startAuthentication}
          disabled={status === 'registering' || status === 'authenticating'}
          variant="default"
          className="w-full sm:w-auto"
        >
          Authenticate {isHybrid ? 'with Face ID' : ''}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebAuthnVerifier;