import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FaceDetector from 'expo-face-detector';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

export default function FaceVerificationScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faces, setFaces] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const cameraRef = useRef<Camera>(null);
  const navigation = useNavigation();
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Ask for camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    // Start simulated progress for demo purposes
    progressTimer.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (progressTimer.current) {
            clearInterval(progressTimer.current);
          }
          return 100;
        }
        return prev + 1;
      });
    }, 100);
    
    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, []);
  
  // Monitor progress for completion
  useEffect(() => {
    if (progress >= 100 && !isComplete) {
      handleVerificationComplete();
    }
  }, [progress, isComplete]);
  
  // When face detected, update progress
  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    if (faces.length > 0) {
      setFaces(faces);
      
      // This would be where real logic for face alignment/quality would go
      const face = faces[0];
      
      // Use roll, yaw, and probability to determine quality
      const rollValue = Math.abs(face.rollAngle);
      const yawValue = Math.abs(face.yawAngle);
      
      // If face is well positioned, increase progress
      if (rollValue < 10 && yawValue < 15 && face.faceDetectionProbability > 0.95) {
        setProgress(prev => Math.min(prev + 2, 100));
        
        // Give haptic feedback to show progress
        if (progress % 10 === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }
  };
  
  const handleVerificationComplete = async () => {
    if (isComplete) return;
    
    setIsComplete(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Capture the final image
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          exif: false,
        });
        
        // Process the image - compress and convert to base64
        const manipResult = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 600 } }],
          { compress: 0.8, format: SaveFormat.JPEG }
        );
        
        // Send to server for verification (simulated)
        // In real app would be: await verifyFaceOnServer(manipResult.uri);
        
        // Navigate to success screen after short delay
        setTimeout(() => {
          navigation.navigate('VerificationSuccess', {
            confidence: 0.95,
            age: 28,
            gender: 'Man',
          });
        }, 500);
        
      } catch (error) {
        console.log('Error capturing image:', error);
        Alert.alert('Verification Error', 'There was a problem completing your verification. Please try again.');
      }
    }
  };
  
  // Handle camera permissions
  if (hasPermission === null) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#4caf50" /></View>;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Face Verification</Text>
        <View style={styles.spacer} />
      </View>
      
      {/* Camera */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          onFacesDetected={handleFacesDetected}
          faceDetectorSettings={{
            mode: FaceDetector.FaceDetectorMode.fast,
            detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
            runClassifications: FaceDetector.FaceDetectorClassifications.none,
            minDetectionInterval: 100,
            tracking: true,
          }}
        >
          {/* Face outline overlay */}
          <View style={styles.faceGuide}>
            <Svg height="100%" width="100%" viewBox="0 0 100 100">
              <Circle
                cx="50"
                cy="50"
                r="35"
                stroke="#4caf50"
                strokeWidth="2"
                fill="none"
              />
            </Svg>
          </View>
          
          {/* Face indicators */}
          {faces.map((face, index) => {
            // Calculate position for the face indicator
            const eyePositionNormalized = {
              x: (face.leftEyePosition.x + face.rightEyePosition.x) / 2,
              y: (face.leftEyePosition.y + face.rightEyePosition.y) / 2,
            };
            
            return (
              <View
                key={index}
                style={[
                  styles.faceIndicator,
                  {
                    left: eyePositionNormalized.x - 5,
                    top: eyePositionNormalized.y - 5,
                    opacity: face.faceDetectionProbability,
                  },
                ]}
              />
            );
          })}
        </Camera>
      </View>
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{progress}%</Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { width: `${progress}%` }
            ]} 
          />
        </View>
      </View>
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          Position your face in the center and follow the on-screen guidance
        </Text>
        <Text style={styles.securityNote}>
          All biometric data is processed securely on your device
        </Text>
      </View>
    </View>
  );
}

// Back arrow icon component
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M15 18l-6-6 6-6" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#143404',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  spacer: {
    width: 40,
  },
  cameraContainer: {
    height: 400,
    overflow: 'hidden',
    borderRadius: 20,
    margin: 20,
  },
  camera: {
    flex: 1,
  },
  faceGuide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceIndicator: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4caf50',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4a166',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#d4a166',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  securityNote: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});