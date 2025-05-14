import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface FaceVerificationResult {
  success: boolean;
  confidence: number;
  message?: string;
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<FaceVerificationResult | null>(null);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Animation frame reference
  const animationRef = useRef<number | null>(null);
  // Detection interval reference
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Video element reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Progress simulation timer
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Verify face with the API
  const verifyFace = useCallback(async (base64Image: string, userId?: string) => {
    try {
      // Make API request to verify face
      const response = await fetch('/api/verification/face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          userId: userId,
          saveToDb: true,
          useBasicDetection: true, // Use the lightweight detection since DeepFace might not be available
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const result: FaceVerificationResult = await response.json();
      
      // Update verification result
      setVerificationResult(result);
      
      // If successful with high confidence, increase progress
      if (result.success && result.confidence > 85) {
        setProgress(prev => Math.max(prev, 95));
      }
      
      // If there's debug session information, log it
      if (result.debugSession) {
        console.log(`[Face Verification] Debug session ID: ${result.debugSession}`);
        console.log('[Face Verification] Server verification details:', result);
      }
      
      return result;
    } catch (error) {
      console.error('Error during verification:', error);
      return null;
    }
  }, []);

  // Simulate verification process for demo purposes
  const simulateVerification = useCallback(() => {
    setIsVerifying(true);
    setProgress(0);
    setVerificationResult(null);
    
    // Show toast to indicate verification has started
    toast({
      title: "Verification Started",
      description: "Scanning face for verification...",
    });
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Create a mock successful result
          setTimeout(() => {
            const mockResult: FaceVerificationResult = {
              success: true,
              confidence: 95,
              matched: true,
              face_id: 'face_' + Math.random().toString(36).substring(2, 10),
              results: {
                age: 32,
                gender: 'Male',
                dominant_race: 'white',
                dominant_emotion: 'neutral'
              },
              message: 'Identity verified with high confidence'
            };
            
            setVerificationResult(mockResult);
            setIsVerifying(false);
            
            // Show success toast
            toast({
              title: "Verification Complete",
              description: "Your identity has been successfully verified.",
              variant: "default",
            });
            
            // Navigate to dashboard after success
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          }, 500);
          
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, [toast, navigate]);
  
  // Start face detection
  const startDetection = useCallback((videoElement: HTMLVideoElement) => {
    // Store the video element reference
    videoRef.current = videoElement;
    
    // Reset verification state
    setIsVerifying(true);
    setVerificationResult(null);
    
    // Reset progress
    setProgress(0);
    
    // Start simulating progress
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        // Increase progress gradually up to 95% (the last 5% will be when face is verified)
        const newProgress = prev + (Math.random() * 2);
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 200);

    // Set up detection interval - captures frames periodically for server verification
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = setInterval(() => {
      // Create a canvas to capture the current video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx && videoElement.videoWidth > 0) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 for transmission to server
        try {
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          
          // Process the captured frame
          const processFrame = async () => {
            try {
              // Only verify if progress is under 95%
              if (progress < 95) {
                const result = await verifyFace(imgData);
                
                // If successful with high confidence, complete the process
                if (result?.success && result?.confidence > 85) {
                  setProgress(99); // Almost complete
                  
                  // Show success toast
                  toast({
                    title: "Face Verified",
                    description: "Your face has been successfully verified.",
                    variant: "default",
                  });
                }
              }
            } catch (err) {
              console.error("Error verifying frame:", err);
            }
          };
          
          // Execute the frame processing
          processFrame();
          
          console.log('Frame captured for detection');
        } catch (err) {
          console.error('Error capturing frame:', err);
        }
      }
    }, 1500); // Capture frame every 1.5 seconds

    console.log('Face detection started');
  }, [verifyFace, progress, toast]);
  
  // Stop face detection
  const stopDetection = useCallback(() => {
    // Cancel animation frame if active
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Clear detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    // Clear progress timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    
    setIsVerifying(false);
    console.log('Face detection stopped');
  }, []);
  
  // Return the hook's interface
  return {
    isVerifying,
    progress: progress,
    verificationProgress: progress,
    verificationResult,
    startDetection,
    stopDetection,
    verifyFace,
    simulateVerification
  };
}