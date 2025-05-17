
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useNativeBiometricsMobile } from "../hooks/use-native-biometrics-mobile";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

// Import necessary icons from a React Native compatible icon library
// This is a placeholder - you'll need to replace with actual icons from your library
import { Shield, Fingerprint, Smartphone } from "lucide-react-native";

interface BiometricVerificationProps {
  onProgress: (progress: number) => void;
  onComplete: (method: string) => void;
  isComplete: boolean;
}

export default function MobileBiometricVerification({
  onProgress,
  onComplete,
  isComplete
}: BiometricVerificationProps) {
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const { 
    isAvailable, 
    biometricType, 
    authenticate, 
    isAuthenticating 
  } = useNativeBiometricsMobile({
    onSuccess: () => {
      setVerificationProgress(100);
      onProgress(100);
      onComplete('face');
    },
    onError: () => {
      setVerificationProgress(0);
      onProgress(0);
    }
  });
  
  // Animation for progress circle
  const progressValue = useSharedValue(0);
  
  useEffect(() => {
    progressValue.value = withTiming(verificationProgress / 100, { duration: 500 });
  }, [verificationProgress, progressValue]);
  
  const progressStyle = useAnimatedStyle(() => {
    return {
      strokeDashoffset: 892 * (1 - progressValue.value)
    };
  });
  
  const handleAuthenticate = async () => {
    if (isAuthenticating) return;
    
    setVerificationProgress(20); // Show some initial progress
    onProgress(20);
    
    const success = await authenticate();
    
    if (!success) {
      setVerificationProgress(0);
      onProgress(0);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.biometricContainer}>
        <View style={styles.circleOuter}>
          <View style={styles.circleInner}>
            {isComplete ? (
              <View style={styles.checkmarkContainer}>
                {/* Success checkmark */}
                <Text style={styles.checkmark}>✓</Text>
              </View>
            ) : (
              <View style={styles.iconContainer}>
                {biometricType === 'faceId' && <Shield width={48} height={48} color="#ffffff" />}
                {(biometricType === 'touchId' || biometricType === 'fingerprint') && 
                  <Fingerprint width={48} height={48} color="#ffffff" />}
                {biometricType === 'face' && <Smartphone width={48} height={48} color="#ffffff" />}
                <Text style={styles.biometricLabel}>
                  {biometricType === 'faceId' ? 'Face ID' : 
                   biometricType === 'touchId' ? 'Touch ID' : 
                   biometricType === 'fingerprint' ? 'Fingerprint' : 
                   'Device Authentication'}
                </Text>
              </View>
            )}
          </View>
          
          {/* Progress circle would go here - In real implementation, 
              you'd use a SVG or canvas circle with animated stroke */}
          <Animated.View style={[styles.progressCircleContainer, progressStyle]} />
        </View>
        
        {!isComplete && (
          <TouchableOpacity 
            style={styles.authenticateButton}
            onPress={handleAuthenticate}
            disabled={isAuthenticating}
          >
            <Text style={styles.buttonText}>
              {isAuthenticating ? "Verifying..." : 
                `Authenticate with ${biometricType === 'faceId' ? 'Face ID' : 
                 biometricType === 'touchId' ? 'Touch ID' : 
                 biometricType === 'fingerprint' ? 'Fingerprint' : 'Device Biometrics'}`
              }
            </Text>
          </TouchableOpacity>
        )}
        
        {!isComplete && (
          <TouchableOpacity 
            style={styles.fallbackButton}
            onPress={() => {
              // Implement fallback logic here
            }}
          >
            <Text style={styles.fallbackButtonText}>Use camera instead</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Security info card */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={styles.logoCircle}>
            {/* Your logo here */}
          </View>
          <View>
            <Text style={styles.infoTitle}>Secure Face Scan</Text>
            <Text style={styles.infoSubtitle}>All data stays on your device</Text>
          </View>
        </View>
        
        <Text style={styles.infoText}>
          This scan verifies you're a real person and creates your secure identity record. 
          Data is never stored on our servers.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  biometricContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  circleOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 24,
  },
  circleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(20, 52, 4, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 60,
    color: '#4caf50',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricLabel: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  progressCircleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#4caf50',
    borderStyle: 'solid',
  },
  authenticateButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  fallbackButton: {
    padding: 8,
  },
  fallbackButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  infoCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a5414',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  infoSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 18,
  },
});
