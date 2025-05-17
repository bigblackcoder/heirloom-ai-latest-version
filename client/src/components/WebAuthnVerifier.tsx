import React, { useState, useEffect, useRef } from 'react';
import {
  startRegistration,
  startAuthentication,
  registerHybrid,
  authenticateHybrid,
  getDeviceType
} from '../../shared/webauthn';

interface WebAuthnVerifierProps {
  userId: string;
  onVerified?: (result: any) => void;
  onError?: (error: string) => void;
  mode?: 'register' | 'authenticate' | 'hybrid';
}

/**
 * WebAuthnVerifier component
 * 
 * This component provides a user interface for device-based biometric authentication.
 * It supports both standard WebAuthn registration/authentication and a hybrid approach
 * that combines device biometrics with facial recognition.
 */
export default function WebAuthnVerifier({
  userId,
  onVerified,
  onError,
  mode = 'authenticate'
}: WebAuthnVerifierProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check device capabilities on mount
  useEffect(() => {
    try {
      const deviceType = getDeviceType();
      setDeviceInfo(deviceType);

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        setStatus('WebAuthn is not supported in this browser');
        onError?.('WebAuthn is not supported in this browser');
      }
    } catch (error) {
      console.error('Error checking device capabilities:', error);
      setStatus('Error checking device capabilities');
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [onError]);

  // Handle capture face image for hybrid authentication
  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setFaceImage(imageData);
    return imageData;
  };

  // Start device camera for face capture
  const startCamera = async () => {
    try {
      if (!videoRef.current) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      
      setStatus('Camera started. Position your face in the frame');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setStatus('Error accessing camera');
      onError?.(error instanceof Error ? error.message : 'Camera access denied');
    }
  };

  // Stop device camera
  const stopCamera = () => {
    if (!videoRef.current?.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const tracks = stream.getTracks();
    
    tracks.forEach(track => track.stop());
    videoRef.current.srcObject = null;
  };

  // Handle WebAuthn registration
  const handleRegister = async () => {
    try {
      setIsProcessing(true);
      setStatus('Starting registration...');
      
      const result = await startRegistration(userId);
      
      if (result.success) {
        setStatus('Registration successful!');
        onVerified?.(result);
      } else {
        setStatus(`Registration failed: ${result.error}`);
        onError?.(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setStatus('Registration error');
      onError?.(error instanceof Error ? error.message : 'Unknown registration error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle WebAuthn authentication
  const handleAuthenticate = async () => {
    try {
      setIsProcessing(true);
      setStatus('Starting authentication...');
      
      const result = await startAuthentication(userId);
      
      if (result.success) {
        setStatus('Authentication successful!');
        onVerified?.(result);
      } else {
        setStatus(`Authentication failed: ${result.error}`);
        onError?.(result.error);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setStatus('Authentication error');
      onError?.(error instanceof Error ? error.message : 'Unknown authentication error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle hybrid registration (WebAuthn + face recognition)
  const handleHybridRegister = async () => {
    try {
      // Start camera first
      await startCamera();
      setStatus('Position your face in the frame and click "Capture & Register"');
    } catch (error) {
      console.error('Hybrid registration setup error:', error);
      setStatus('Failed to start camera');
      onError?.(error instanceof Error ? error.message : 'Camera setup failed');
    }
  };

  // Complete hybrid registration with captured face
  const completeHybridRegister = async () => {
    try {
      setIsProcessing(true);
      
      // Capture face image
      const capturedImage = captureFace();
      if (!capturedImage) {
        setStatus('Failed to capture face image');
        onError?.('Failed to capture face image');
        setIsProcessing(false);
        return;
      }
      
      setStatus('Processing registration...');
      
      // Extract base64 data part (remove data:image/jpeg;base64, prefix)
      const base64Image = capturedImage.split(',')[1];
      
      // Register with hybrid approach
      const result = await registerHybrid(userId, undefined, base64Image);
      
      if (result.success) {
        setStatus('Hybrid registration successful!');
        onVerified?.(result);
        // Stop camera after successful registration
        stopCamera();
      } else {
        setStatus(`Hybrid registration failed: ${result.error}`);
        onError?.(result.error);
      }
    } catch (error) {
      console.error('Hybrid registration error:', error);
      setStatus('Hybrid registration error');
      onError?.(error instanceof Error ? error.message : 'Unknown registration error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle hybrid authentication
  const handleHybridAuthenticate = async () => {
    try {
      // Start camera first
      await startCamera();
      setStatus('Position your face in the frame and click "Capture & Verify"');
    } catch (error) {
      console.error('Hybrid authentication setup error:', error);
      setStatus('Failed to start camera');
      onError?.(error instanceof Error ? error.message : 'Camera setup failed');
    }
  };

  // Complete hybrid authentication with captured face
  const completeHybridAuthenticate = async () => {
    try {
      setIsProcessing(true);
      
      // Capture face image
      const capturedImage = captureFace();
      if (!capturedImage) {
        setStatus('Failed to capture face image');
        onError?.('Failed to capture face image');
        setIsProcessing(false);
        return;
      }
      
      setStatus('Processing authentication...');
      
      // Extract base64 data part (remove data:image/jpeg;base64, prefix)
      const base64Image = capturedImage.split(',')[1];
      
      // Authenticate with hybrid approach
      const result = await authenticateHybrid(userId, base64Image);
      
      if (result.success) {
        setStatus('Hybrid authentication successful!');
        onVerified?.(result);
        // Stop camera after successful authentication
        stopCamera();
      } else {
        setStatus(`Hybrid authentication failed: ${result.error}`);
        onError?.(result.error);
      }
    } catch (error) {
      console.error('Hybrid authentication error:', error);
      setStatus('Hybrid authentication error');
      onError?.(error instanceof Error ? error.message : 'Unknown authentication error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Render appropriate UI based on mode
  const renderContent = () => {
    // Display device info
    const deviceInfoText = deviceInfo ? 
      `Device: ${deviceInfo.os || 'Unknown'}, Authenticator: ${deviceInfo.authenticatorType || 'Unknown'}` : 
      'Checking device capabilities...';

    // Standard registration mode
    if (mode === 'register') {
      return (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-500">{deviceInfoText}</p>
          <button
            onClick={handleRegister}
            disabled={isProcessing || !window.PublicKeyCredential}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
          >
            {isProcessing ? 'Registering...' : 'Register Device'}
          </button>
        </div>
      );
    }
    
    // Standard authentication mode
    if (mode === 'authenticate') {
      return (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-500">{deviceInfoText}</p>
          <button
            onClick={handleAuthenticate}
            disabled={isProcessing || !window.PublicKeyCredential}
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 hover:bg-green-700 transition-colors"
          >
            {isProcessing ? 'Verifying...' : 'Verify with Device'}
          </button>
        </div>
      );
    }
    
    // Hybrid mode (both device and face)
    if (mode === 'hybrid') {
      return (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-500">{deviceInfoText}</p>
          
          {/* Video display for face capture */}
          <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
            <video 
              ref={videoRef} 
              className="w-full max-w-sm h-auto"
              autoPlay 
              playsInline 
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-2">
            {!videoRef.current?.srcObject ? (
              <>
                <button
                  onClick={handleHybridRegister}
                  disabled={isProcessing || !window.PublicKeyCredential}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                >
                  Register with Face + Device
                </button>
                <button
                  onClick={handleHybridAuthenticate}
                  disabled={isProcessing || !window.PublicKeyCredential}
                  className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 hover:bg-green-700 transition-colors"
                >
                  Verify with Face + Device
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={completeHybridRegister}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                >
                  Capture & Register
                </button>
                <button
                  onClick={completeHybridAuthenticate}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 hover:bg-green-700 transition-colors"
                >
                  Capture & Verify
                </button>
                <button
                  onClick={stopCamera}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-gray-400 hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Biometric Verification</h2>
      
      {/* Status message */}
      {status && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-center">
          {status}
        </div>
      )}
      
      {/* Main content */}
      {renderContent()}
    </div>
  );
}