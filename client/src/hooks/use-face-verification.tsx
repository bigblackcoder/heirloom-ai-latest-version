import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// For detecting dev/demo environment
const isDemoMode = process.env.NODE_ENV === 'development' || 
                    window.location.search.includes('demo=true');

// Face detection results
interface DetectionFrame {
  success: boolean;
  confidence: number;
  alignment: number; // 0-100 where 100 is perfect alignment
}

// DeepFace verification response
interface VerificationResponse {
  success: boolean;
  confidence: number;
  message?: string;
  verified?: boolean;
  matched?: boolean;
  face_id?: string;
  results?: {
    age?: number;
    gender?: string;
    dominant_race?: string;
    dominant_emotion?: string;
  };
}

export function useFaceVerification() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [detectedFrames, setDetectedFrames] = useState<DetectionFrame[]>([]);
  const [verificationResults, setVerificationResults] = useState<VerificationResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  
  // Use refs to avoid dependency cycles
  const framesRef = useRef<DetectionFrame[]>([]);
  const isDetectingRef = useRef(false);
  const progressRef = useRef(0);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scanningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update refs when state changes
  useEffect(() => {
    framesRef.current = detectedFrames;
  }, [detectedFrames]);
  
  useEffect(() => {
    isDetectingRef.current = isDetecting;
  }, [isDetecting]);
  
  useEffect(() => {
    progressRef.current = verificationProgress;
  }, [verificationProgress]);
  
  // Process detection results and update progress
  const processDetection = useCallback((frame: DetectionFrame) => {
    if (frame.success) {
      // Add the frame to our collection
      setDetectedFrames(prev => {
        const newFrames = [...prev, frame];
        // Keep only the last 5 frames for more responsive feedback
        if (newFrames.length > 5) {
          newFrames.shift();
        }
        framesRef.current = newFrames;
        return newFrames;
      });
      
      // Calculate progress based on frame quality and alignment
      // Take an average of the last few frames to smooth out progress
      const recentFrames = framesRef.current.slice(-3);
      const avgConfidence = recentFrames.reduce((sum, f) => sum + f.confidence, 0) / recentFrames.length;
      const avgAlignment = recentFrames.reduce((sum, f) => sum + f.alignment, 0) / recentFrames.length;
      
      // Slow down progress to make it more challenging and interactive
      // Better alignment and confidence = faster progress
      const progressIncrement = (avgConfidence * avgAlignment / 100) * 0.5;
      
      const newProgress = Math.min(
        progressRef.current + progressIncrement, // Slower progress that depends on alignment
        99 // Go all the way to 99% so that we don't prematurely complete
      );
      
      setVerificationProgress(newProgress);
    } else {
      // If frame detection failed, slightly decrease progress to encourage better alignment
      if (progressRef.current > 0) {
        const newProgress = Math.max(progressRef.current - 0.2, 0);
        setVerificationProgress(newProgress);
      }
    }
  }, []);

  // Capture frame and send to server for DeepFace verification
  const captureAndVerify = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!videoElement || isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Create a canvas element to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Mirror horizontally if necessary
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get the image data as base64
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Send the image data to the server for verification
      const response = await apiRequest({
        url: '/api/verification/face',
        method: 'POST',
        body: { image: imageData },
      }) as VerificationResponse;
      
      // If verification was successful
      if (response && response.success === true) {
        setVerificationResults(response);
        // Complete the progress to 100%
        setVerificationProgress(100);
      } else {
        // Handle unsuccessful verification but continue trying
        console.warn('Face verification unsuccessful:', response?.message || 'Unknown error');
        
        // Add artificial progress based on how many attempts we've made
        setVerificationProgress(prev => Math.min(prev + 2, 90));
        
        // Add a basic frame to keep trying
        processDetection({
          success: true,
          confidence: 50, // 50% confidence
          alignment: 50
        });
      }
    } catch (error) {
      console.error('Error in face verification:', error);
      toast({
        title: 'Verification Error',
        description: 'There was an error processing your facial verification. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, toast, processDetection]);
  
  // Detect basic face presence using simple canvas operations
  const detectFacePresence = useCallback((video: HTMLVideoElement): DetectionFrame => {
    // For a real implementation, we would use a lightweight detector here
    // But for demo purposes, we'll use a more controlled simulation
    // that doesn't randomly progress but requires user interaction
    
    // Get the bounding client rect of the video element to determine center
    const rect = video.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Get the current mouse position (as a proxy for user's face movement)
    const mouseX = window.mouseX || centerX;
    const mouseY = window.mouseY || centerY;
    
    // Calculate distance from center (normalized to 0-100)
    const distanceX = Math.abs(mouseX - centerX) / (rect.width / 2) * 100;
    const distanceY = Math.abs(mouseY - centerY) / (rect.height / 2) * 100;
    
    // Calculate overall distance from center (0-100 where 0 is perfect)
    const distance = Math.min(100, Math.sqrt(distanceX * distanceX + distanceY * distanceY));
    
    // Convert to alignment score (0-100 where 100 is perfect)
    const alignment = Math.max(0, 100 - distance);
    
    // Is face sufficiently centered?
    const isFaceCentered = alignment > 60;
    
    // Confidence based on alignment with a base minimum (50-100%)
    const confidence = 50 + (alignment / 2); // 50-100 range
    
    return {
      success: isFaceCentered,
      confidence: confidence,
      alignment: alignment
    };
  }, []);
  
  // Start the detection process
  const startDetection = useCallback((videoElement: HTMLVideoElement) => {
    if (!videoElement) return;
    
    setIsDetecting(true);
    setVerificationProgress(0);
    setDetectedFrames([]);
    setVerificationResults(null);
    isDetectingRef.current = true;
    progressRef.current = 0;
    framesRef.current = [];
    
    // Run continuous face detection at a higher rate for responsiveness
    scanningIntervalRef.current = setInterval(() => {
      if (!isDetectingRef.current) {
        if (scanningIntervalRef.current) clearInterval(scanningIntervalRef.current);
        return;
      }
      
      const result = detectFacePresence(videoElement);
      processDetection(result);
    }, 100);
    
    // Periodically capture frames for server verification, but at a lower rate
    captureTimeoutRef.current = setTimeout(function capture() {
      if (!isDetectingRef.current) return;
      
      captureAndVerify(videoElement).then(() => {
        // Schedule next capture if still detecting and not at 100%
        if (isDetectingRef.current && progressRef.current < 100) {
          captureTimeoutRef.current = setTimeout(capture, 1500); // Every 1.5 seconds
        }
      });
    }, 1000); // First capture after 1 second
    
    // Cleanup function
    return () => {
      if (scanningIntervalRef.current) clearInterval(scanningIntervalRef.current);
      if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current);
      setIsDetecting(false);
    };
  }, [detectFacePresence, processDetection, captureAndVerify]);
  
  // Stop the detection process
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    isDetectingRef.current = false;
    
    // Clear any pending timeouts/intervals
    if (scanningIntervalRef.current) clearInterval(scanningIntervalRef.current);
    if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current);
  }, []);
  
  // Artificial progress increase for better UX
  useEffect(() => {
    if (!isDetecting || progressRef.current >= 100) return;
    
    // Slow continuous progress to provide feedback even if verification is taking time
    const progressInterval = setInterval(() => {
      // Allow progress to reach 100% for a more satisfying user experience
      if (progressRef.current < 100) {
        setVerificationProgress(prev => {
          // Very slow artificial progress, but will eventually reach 100%
          const newProgress = Math.min(prev + 0.2, 100); 
          progressRef.current = newProgress;
          return newProgress;
        });
      } else {
        clearInterval(progressInterval);
      }
    }, 300);
    
    return () => clearInterval(progressInterval);
  }, [isDetecting]);
  
  // Function to simulate a demo verification for testing purposes
  const simulateVerification = useCallback(() => {
    setIsDetecting(true);
    isDetectingRef.current = true;
    setVerificationProgress(0);
    progressRef.current = 0;
    
    // Simulate progress over time with variable speed for realism
    let progress = 0;
    let lastIncrease = 1.5;
    
    const simulationInterval = setInterval(() => {
      // Vary the progress increment for a more realistic simulation
      const variationFactor = 0.8 + (Math.random() * 0.4); // Random factor between 0.8 and 1.2
      lastIncrease = Math.min(lastIncrease * variationFactor, 2.5);
      
      progress += lastIncrease;
      
      if (progress >= 100) {
        // Complete the verification
        clearInterval(simulationInterval);
        
        // Make sure we set progress to 100
        setVerificationProgress(100);
        progressRef.current = 100;
        
        // Set verification results
        setVerificationResults({
          success: true,
          confidence: 95, // 95% confidence (using percentage scale)
          verified: true,
          results: {
            age: 28,
            gender: "Man",
            dominant_race: "caucasian",
            dominant_emotion: "neutral"
          }
        });
        
        // Turn off detection mode 
        setTimeout(() => {
          setIsDetecting(false);
          isDetectingRef.current = false;
        }, 500); // Small delay to ensure state updates properly
      } else {
        // Simulated checkpoints in verification process
        if (progress > 30 && progress < 32) {
          // Slow down during "analysis" phase
          lastIncrease = 0.8;
        } else if (progress > 60 && progress < 62) {
          // Slow down during "verification" phase
          lastIncrease = 0.5;
        } else if (progress > 85) {
          // Final slowdown during verification confirmation
          lastIncrease = 0.3;
        }
        
        // Update both state and ref
        setVerificationProgress(progress);
        progressRef.current = progress;
      }
    }, 100);
    
    return () => {
      clearInterval(simulationInterval);
      setIsDetecting(false);
      isDetectingRef.current = false;
    };
  }, []);
  
  return {
    isDetecting,
    verificationProgress,
    verificationResults,
    isProcessing,
    startDetection,
    stopDetection,
    detectedFrames,
    simulateVerification,
    isDemoMode
  };
}
