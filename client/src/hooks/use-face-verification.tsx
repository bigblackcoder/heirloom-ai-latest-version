import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
        framesRef.current = newFrames;
        return newFrames;
      });
      
      // Calculate progress based on frame quality
      const newProgress = Math.min(
        progressRef.current + (frame.confidence * 10), // Faster progress with better quality frames
        90 // Only go to 90% until verification completes
      );
      
      setVerificationProgress(newProgress);
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
      });
      
      // If verification was successful
      if (response && response.success === true) {
        setVerificationResults(response as VerificationResponse);
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
          confidence: 0.5,
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
    // But for demo purposes, we'll simulate basic detection
    const isGoodLighting = true; // Would detect actual lighting conditions
    const isFaceCentered = true; // Would detect face position
    
    // Simulate varying detection results
    const randomConfidence = 0.7 + (Math.random() * 0.3); // 0.7-1.0
    const randomAlignment = 70 + (Math.random() * 30); // 70-100
    
    return {
      success: isGoodLighting && isFaceCentered,
      confidence: randomConfidence,
      alignment: randomAlignment
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
      if (progressRef.current < 90) { // Only go to 90% until verification completes
        setVerificationProgress(prev => {
          const newProgress = Math.min(prev + 0.2, 90); // Very slow artificial progress
          progressRef.current = newProgress;
          return newProgress;
        });
      } else {
        clearInterval(progressInterval);
      }
    }, 300);
    
    return () => clearInterval(progressInterval);
  }, [isDetecting]);
  
  return {
    isDetecting,
    verificationProgress,
    verificationResults,
    isProcessing,
    startDetection,
    stopDetection,
    detectedFrames
  };
}
