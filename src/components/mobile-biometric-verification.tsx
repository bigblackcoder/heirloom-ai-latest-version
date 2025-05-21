
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNativeBiometricsMobile } from '../hooks/use-native-biometrics-mobile';

interface MobileBiometricVerificationProps {
  userId: string;
  onVerificationComplete: (result: {
    success: boolean;
    method: string;
    confidence: number;
    timestamp: string;
  }) => void;
  onError: (error: string) => void;
}

export const MobileBiometricVerification: React.FC<MobileBiometricVerificationProps> = ({
  userId,
  onVerificationComplete,
  onError
}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [verificationMethod, setVerificationMethod] = useState<'hybrid' | 'deepface' | 'native'>('hybrid');
  
  const cameraRef = useRef<Camera>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    isAvailable: isBiometricAvailable, 
    biometricTypes,
    hybridVerification 
  } = useNativeBiometricsMobile();
  
  const hasFacialBiometrics = biometricTypes.includes('facial');

  // Ask for camera permission on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
      
      // Set verification method based on device capabilities
      if (isBiometricAvailable && hasFacialBiometrics) {
        setVerificationMethod('hybrid');
      } else {
        setVerificationMethod('deepface');
      }
    })();
    
    return () => {
      // Clean up timer on unmount
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isBiometricAvailable, hasFacialBiometrics]);

  // Handle camera ready state
  const handleCameraReady = () => {
    setIsCameraReady(true);
    startProgressTimer();
  };

  // Start progress timer for capturing image
  const startProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    
    setProgress(0);
    const interval = 50;
    const incrementAmount = 2;
    
    progressTimerRef.current = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + incrementAmount;
        
        // Automatically capture when progress reaches 100%
        if (newProgress >= 100 && !isCapturing) {
          captureImage();
        }
        
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, interval);
  };

  // Capture image from camera
  const captureImage = async () => {
    if (cameraRef.current && isCameraReady && !isCapturing) {
      try {
        setIsCapturing(true);
        
        // Stop progress timer
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        
        // Take photo
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: false
        });
        
        // Resize image to improve performance
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 640 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        
        // Set captured image and start verification
        setCapturedImage(manipulatedImage.uri);
        
        // Start verification with captured image
        if (manipulatedImage.base64) {
          verifyWithHybridMethod(manipulatedImage.base64);
        } else {
          onError('Failed to get base64 image data');
        }
      } catch (error) {
        console.error('Error capturing image:', error);
        onError(error instanceof Error ? error.message : 'Failed to capture image');
        resetCamera();
      }
    }
  };

  // Reset camera for another attempt
  const resetCamera = () => {
    setIsCapturing(false);
    setCapturedImage(null);
    setProgress(0);
    startProgressTimer();
  };

  // Verify with hybrid method (DeepFace + native)
  const verifyWithHybridMethod = async (base64Image: string) => {
    try {
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;
      
      // Determine which verification method to use
      if (verificationMethod === 'hybrid') {
        // Use hybrid verification (DeepFace + native biometrics)
        const result = await hybridVerification(dataUrl, userId);
        
        if (result.success) {
          const timestamp = new Date().toISOString();
          const method = result.nativeVerified ? 
            'Hybrid (FaceID + DeepFace)' : 
            'DeepFace';
            
          onVerificationComplete({
            success: true,
            method,
            confidence: result.confidence,
            timestamp
          });
          
          // Store verification data in session storage for dashboard to detect
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('verification_status', 'verified');
            sessionStorage.setItem('verification_timestamp', timestamp);
            sessionStorage.setItem('verification_method', method);
            sessionStorage.setItem('verification_confidence', String(result.confidence));
          }
        } else {
          onError(result.error || 'Verification failed');
          resetCamera();
        }
      } else {
        // Use DeepFace only
        const response = await fetch('/api/verification/face', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: dataUrl,
            userId,
            saveToDb: false
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          const timestamp = new Date().toISOString();
          onVerificationComplete({
            success: true,
            method: 'DeepFace',
            confidence: result.confidence || 0.95,
            timestamp
          });
          
          // Store verification data in session storage
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('verification_status', 'verified');
            sessionStorage.setItem('verification_timestamp', timestamp);
            sessionStorage.setItem('verification_method', 'DeepFace');
            sessionStorage.setItem('verification_confidence', String(result.confidence || 0.95));
          }
        } else {
          onError(result.message || 'Face verification failed');
          resetCamera();
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      onError(error instanceof Error ? error.message : 'Unknown verification error');
      resetCamera();
    }
  };

  // Switch verification method
  const toggleVerificationMethod = () => {
    if (verificationMethod === 'hybrid') {
      setVerificationMethod('deepface');
    } else if (verificationMethod === 'deepface') {
      setVerificationMethod(isBiometricAvailable && hasFacialBiometrics ? 'hybrid' : 'deepface');
    } else {
      setVerificationMethod('hybrid');
    }
  };

  // Render error message if no camera permission
  if (hasCameraPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            Alert.alert(
              'Camera Permission Required',
              'This feature requires camera permission to verify your identity.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.front}
            onCameraReady={handleCameraReady}
            ratio="16:9"
          >
            <View style={styles.overlayContainer}>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${progress}%` }
                  ]} 
                />
              </View>
              
              <View style={styles.scanFrame}>
                <View style={styles.scanLine} />
              </View>
              
              <View style={styles.methodContainer}>
                <TouchableOpacity 
                  style={styles.methodButton}
                  onPress={toggleVerificationMethod}
                >
                  <Text style={styles.methodText}>
                    Method: {verificationMethod === 'hybrid' ? 'Hybrid' : 'DeepFace Only'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={captureImage}
                disabled={!isCameraReady || isCapturing}
              >
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          <Text style={styles.verifyingText}>Verifying your identity...</Text>
          <View style={styles.loadingIndicator}>
            <View style={styles.loadingBar} />
          </View>
        </View>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>
          Hybrid Face Verification
        </Text>
        <Text style={styles.infoText}>
          {verificationMethod === 'hybrid' 
            ? 'This secure method combines DeepFace analysis with your device\'s native facial recognition for enhanced security.'
            : 'Using advanced facial recognition algorithms to verify your identity.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 3/4,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  scanFrame: {
    position: 'absolute',
    top: '20%',
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#4CAF50',
    opacity: 0.8,
    position: 'absolute',
    top: '50%',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  resultContainer: {
    width: '100%',
    aspectRatio: 3/4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 20,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  verifyingText: {
    position: 'absolute',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 40,
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBar: {
    width: '30%',
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    animation: 'loading 1.5s infinite',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E3B1E',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  methodContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  methodButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  methodText: {
    color: '#fff',
    fontSize: 12,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
