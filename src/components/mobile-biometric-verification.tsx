import React, { useState, useEffect, useRef } from 'react';
import { useNativeBiometricsMobile } from '../hooks/use-native-biometrics-mobile';
import { motion } from 'framer-motion';

interface MobileBiometricVerificationProps {
  userId: string;
  onVerificationComplete: (result: {
    success: boolean;
    method: string;
    details?: any;
  }) => void;
  preferredMethod?: 'hybrid' | 'native' | 'deepface';
}

export default function MobileBiometricVerification({
  userId,
  onVerificationComplete,
  preferredMethod = 'hybrid'
}: MobileBiometricVerificationProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<'hybrid' | 'native' | 'deepface'>(preferredMethod);
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    isBiometricSupported,
    authenticateWithBiometrics,
    checkBiometricSupport
  } = useNativeBiometricsMobile();

  // Check biometric support on component mount
  useEffect(() => {
    checkBiometricSupport();

    // Initialize camera when component mounts
    initCamera();

    return () => {
      // Stop camera when component unmounts
      if (cameraRef.current && cameraRef.current.srcObject) {
        const tracks = (cameraRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [checkBiometricSupport]);

  // Initialize camera
  const initCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
      }

      // Start progress animation
      startProgressAnimation();

    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  // Start progress animation
  const startProgressAnimation = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(Math.min(currentProgress, 100));

      // When progress reaches 100%, capture image
      if (currentProgress >= 100) {
        clearInterval(interval);
        captureImage();
      }
    }, 100);
  };

  // Capture image from camera
  const captureImage = () => {
    if (cameraRef.current && canvasRef.current) {
      const video = cameraRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);

        // Verify with selected method
        verifyIdentity(imageData);
      }
    }
  };

  // Verify identity using selected method
  const verifyIdentity = async (imageData: string) => {
    try {
      switch (verificationMethod) {
        case 'hybrid':
          await verifyWithHybridMethod(imageData);
          break;
        case 'native':
          await verifyWithNativeBiometrics();
          break;
        case 'deepface':
          await verifyWithDeepFace(imageData);
          break;
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError(error instanceof Error ? error.message : 'Verification failed');

      onVerificationComplete({
        success: false,
        method: verificationMethod,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  };

  // Verify with hybrid method (try both in parallel)
  const verifyWithHybridMethod = async (imageData: string) => {
    try {
      // Start both verifications in parallel
      const nativeBiometricPromise = isBiometricSupported 
        ? verifyWithNativeBiometrics() 
        : Promise.resolve({ success: false, method: 'native_biometrics', details: { error: 'Native biometrics not supported' } });

      const deepFacePromise = verifyWithDeepFace(imageData);

      // Wait for both to complete, but resolve as soon as one succeeds
      const [nativeResult, deepFaceResult] = await Promise.allSettled([
        nativeBiometricPromise,
        deepFacePromise
      ]);

      // Process results
      const nativeSuccess = nativeResult.status === 'fulfilled' && nativeResult.value.success;
      const deepFaceSuccess = deepFaceResult.status === 'fulfilled' && deepFaceResult.value.success;

      if (nativeSuccess || deepFaceSuccess) {
        // Choose the successful method, preferring native if both succeeded
        const successMethod = nativeSuccess ? 'native_biometrics' : 'deepface';
        const successDetails = nativeSuccess 
          ? (nativeResult as PromiseFulfilledResult<any>).value.details
          : (deepFaceResult as PromiseFulfilledResult<any>).value.details;

        setIsComplete(true);

        // Save verification status to sessionStorage
        sessionStorage.setItem('verification_status', 'verified');
        sessionStorage.setItem('verification_timestamp', new Date().toISOString());

        // Return success
        onVerificationComplete({
          success: true,
          method: `hybrid (${successMethod})`,
          details: {
            ...successDetails,
            hybrid: true,
            nativeAttempted: isBiometricSupported,
            deepfaceAttempted: true,
            nativeSucceeded: nativeSuccess,
            deepfaceSucceeded: deepFaceSuccess
          }
        });
      } else {
        // Both methods failed
        throw new Error('Both verification methods failed');
      }
    } catch (error) {
      console.error('Hybrid verification error:', error);
      throw error;
    }
  };

  // Verify with native biometrics
  const verifyWithNativeBiometrics = async () => {
    try {
      if (!isBiometricSupported) {
        throw new Error('Native biometrics not supported on this device');
      }

      const result = await authenticateWithBiometrics(userId);

      if (result.success && result.verified) {
        setIsComplete(true);

        // Save verification status to sessionStorage
        sessionStorage.setItem('verification_status', 'verified');
        sessionStorage.setItem('verification_timestamp', new Date().toISOString());

        if (verificationMethod === 'native') {
          onVerificationComplete({
            success: true,
            method: 'native_biometrics',
            details: result
          });
        }

        return {
          success: true,
          method: 'native_biometrics',
          details: result
        };
      } else {
        throw new Error('Native biometric verification failed');
      }
    } catch (error) {
      console.error('Native biometric verification error:', error);

      if (verificationMethod === 'native') {
        setError(error instanceof Error ? error.message : 'Native biometric verification failed');
        onVerificationComplete({
          success: false,
          method: 'native_biometrics',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }

      throw error;
    }
  };

  // Verify with DeepFace
  const verifyWithDeepFace = async (imageData: string) => {
    try {
      // Remove data URL prefix if present
      const base64Data = imageData.includes(',') 
        ? imageData.split(',')[1] 
        : imageData;

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('image_data', base64Data);

      const response = await fetch('/verify', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`DeepFace verification failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.verified) {
        setIsComplete(true);

        // Save verification status to sessionStorage
        sessionStorage.setItem('verification_status', 'verified');
        sessionStorage.setItem('verification_timestamp', new Date().toISOString());
        sessionStorage.setItem('face_id', result.face_id || 'unknown');

        if (verificationMethod === 'deepface') {
          onVerificationComplete({
            success: true,
            method: 'DeepFace',
            details: result
          });
        }

        return {
          success: true,
          method: 'DeepFace',
          details: result
        };
      } else {
        throw new Error('DeepFace verification failed: Not verified');
      }
    } catch (error) {
      console.error('DeepFace verification error:', error);

      if (verificationMethod === 'deepface') {
        setError(error instanceof Error ? error.message : 'DeepFace verification failed');
        onVerificationComplete({
          success: false,
          method: 'DeepFace',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }

      throw error;
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Camera view */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black shadow-lg">
        {/* The actual video element */}
        <video 
          ref={cameraRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isComplete ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        />

        {/* Overlay for face detection guides */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-64 h-64 rounded-full border-2 ${isComplete ? 'border-green-500' : 'border-white'} opacity-60 ${isComplete ? 'scale-95' : 'scale-100'} transition-all duration-300`}></div>

          {/* Face outline markers */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M160 100C160 100 180 80 200 80C220 80 240 100 240 100" stroke="white" strokeWidth="2" opacity="0.7" strokeLinecap="round"/>
            <path d="M150 180C150 180 160 200 200 200C240 200 250 180 250 180" stroke="white" strokeWidth="2" opacity="0.7" strokeLinecap="round"/>
            <circle cx="175" cy="140" r="10" stroke="white" strokeWidth="2" opacity="0.7"/>
            <circle cx="225" cy="140" r="10" stroke="white" strokeWidth="2" opacity="0.7"/>
          </svg>
        </div>

        {/* Display success animation when complete */}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-green-500 bg-opacity-20 w-32 h-32 rounded-full flex items-center justify-center"
            >
              <svg className="w-16 h-16 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>
          </div>
        )}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>

      {/* Canvas for capturing images (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Method selection tabs */}
      <div className="mt-6">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => !isComplete && setVerificationMethod('hybrid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              verificationMethod === 'hybrid' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            } ${isComplete ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
            disabled={isComplete}
          >
            Hybrid
          </button>

          <button
            onClick={() => !isComplete && setVerificationMethod('deepface')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              verificationMethod === 'deepface' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            } ${isComplete ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
            disabled={isComplete}
          >
            DeepFace
          </button>

          <button
            onClick={() => !isComplete && setVerificationMethod('native')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              verificationMethod === 'native' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            } ${!isBiometricSupported || isComplete ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
            disabled={!isBiometricSupported || isComplete}
          >
            Native
          </button>
        </div>
      </div>

      {/* Status and error message */}
      <div className="mt-4 text-center">
        {error ? (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : isComplete ? (
          <div className="text-green-600 text-sm p-2 bg-green-50 rounded-lg">
            Verification successful
          </div>
        ) : (
          <div className="text-gray-600 text-sm">
            {progress < 100 
              ? "Position your face in the center of the frame" 
              : "Processing verification..."}
          </div>
        )}
      </div>

      {/* Method information */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
        <div className="font-medium text-sm text-gray-800 mb-1">
          {verificationMethod === 'hybrid' && "Hybrid Authentication"}
          {verificationMethod === 'deepface' && "DeepFace Facial Recognition"}
          {verificationMethod === 'native' && "Native Device Biometrics"}
        </div>
        <p>
          {verificationMethod === 'hybrid' && "Combines both device biometrics and facial recognition for maximum security."}
          {verificationMethod === 'deepface' && "Advanced AI-powered facial recognition that analyzes unique facial features."}
          {verificationMethod === 'native' && "Uses your device's built-in biometric authentication system (FaceID/TouchID)."}
        </p>
      </div>
    </div>
  );
}