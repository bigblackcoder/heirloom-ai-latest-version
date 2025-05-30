import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface FaceVerificationResult {
  success: boolean;
  confidence: number;
  message?: string;
  matched?: boolean;
  face_id?: string;
  debugSession?: string;  // Added for tracking verification sessions
  error?: string;         // For error details
  details?: string;       // For additional error information
  results?: {
    age?: number;
    gender?: string;
    dominant_race?: string;
    dominant_emotion?: string;
  };
}

// Video data to record and send to the server
interface VideoRecordingData {
  blob: Blob;
  url: string;
  duration: number;
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
      // Generate a unique identifier for this verification attempt
      const requestId = `verify_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Make API request to verify face (use direct server connection in development)
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(baseUrl + '/api/verification/face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          image: base64Image,
          userId: userId,
          request_id: requestId,
          debug_session: requestId, // Use requestId as debug session identifier
          saveToDb: true,
          useBasicDetection: true, // Use the lightweight detection since DeepFace might not be available
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const result: FaceVerificationResult = await response.json();
      
      // Add the debug session ID if it's not already present
      if (!result.debugSession) {
        result.debugSession = requestId;
      }
      
      // Update verification result
      setVerificationResult(result);
      
      // Log debug info in development mode
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        console.log(`[Face Verification] Debug session ID: ${result.debugSession}`);
        console.log('[Face Verification] Server verification details:', result);
      }
      
      // If successful with high confidence, increase progress
      if (result.success && result.confidence > 85) {
        setProgress(prev => Math.max(prev, 95));
      }
      
      // Show debug toast in development mode
      if (result.debugSession && (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost')) {
        toast({
          title: "Debug Info Available",
          description: `Session ID: ${result.debugSession}. Check console for details.`,
          variant: "default",
          duration: 5000,
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Error during verification:', error);
      
      // Show error toast with debugging information
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        toast({
          title: "Face Verification Error",
          description: `Error: ${error?.message || String(error)}`,
          variant: "destructive",
          duration: 5000,
        });
      }
      
      return {
        success: false,
        confidence: 0,
        message: 'Error during verification process',
        error: error?.message || String(error),
        debugSession: `face-error-client-${Date.now()}`
      };
    }
  }, [toast]);

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
  const startDetection = useCallback((imageData: string) => {
    // Reset verification state if not already verifying
    if (!isVerifying) {
      setIsVerifying(true);
      setVerificationResult(null);
      setProgress(0);
    }
    
    // Start simulating progress if not already started
    if (!progressTimerRef.current) {
      progressTimerRef.current = setInterval(() => {
        setProgress(prev => {
          // Increase progress gradually up to 95% (the last 5% will be when face is verified)
          const newProgress = prev + (Math.random() * 2);
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);
    }
    
    // Process the captured frame
    const processFrame = async () => {
      try {
        // Verify the face regardless of progress
        const result = await verifyFace(imageData);
        
        // Store the verification result for debugging purposes
        setVerificationResult(result);
        
        // If successful with high confidence, complete the process
        if (result?.success && result?.confidence > 85) {
          // Clear the progress timer first
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
          }
          
          setProgress(100); // Complete!
          
          // Show success toast
          toast({
            title: "Face Verified",
            description: "Your face has been successfully verified.",
            variant: "default",
          });
        } else {
          // If verification failed, show error and reset
          console.log("Verification failed:", result);
          setProgress(0);
          
          toast({
            title: "Verification Failed",
            description: result?.message || "Could not verify your face. Please try again.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        console.error("Error verifying frame:", err);
        
        // Set error in verification result for debugging
        setVerificationResult({
          success: false,
          confidence: 0,
          error: err?.message || String(err),
          debugSession: `error-${Date.now()}`
        });
      }
    };
    
    // Execute the frame processing
    processFrame();

    // The interval is no longer needed since we're now processing frames one by one
    // from the apple-face-scanner.tsx component
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

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
  
  // Record video for more robust verification
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start video recording
  const startVideoRecording = useCallback((videoElement: HTMLVideoElement) => {
    if (!videoElement.srcObject) {
      toast({
        title: "Camera Error",
        description: "Camera stream not available. Please allow camera access.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Set up media recorder
      const mediaRecorder = new MediaRecorder(videoElement.srcObject as MediaStream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Process the recorded video
        processVideoVerification({
          blob,
          url,
          duration: recordingTime
        });
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect chunks every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 0.1;
          // Automatically stop after 3 seconds
          if (newTime >= 3 && mediaRecorderRef.current?.state === 'recording') {
            stopVideoRecording();
          }
          return newTime;
        });
      }, 100);
      
      // Update progress to show recording state
      setProgress(10);
      setIsVerifying(true);
      
      toast({
        title: "Recording Started",
        description: "Recording short video for verification...",
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Error starting video recording:", error);
      toast({
        title: "Recording Error",
        description: "Could not start video recording. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  // Stop video recording
  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    setIsRecording(false);
    setProgress(50); // Update progress to show processing state
    
    toast({
      title: "Recording Complete",
      description: "Processing video for verification...",
      duration: 3000,
    });
  }, [toast]);
  
  // Process recorded video for verification
  const processVideoVerification = useCallback(async (videoData: VideoRecordingData) => {
    try {
      // Create form data for video upload
      const formData = new FormData();
      formData.append('videoFile', videoData.blob, 'verification.webm');
      
      // Add request ID for debugging
      const requestId = `video-verify-${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      formData.append('request_id', requestId);
      
      // Add save to DB flag
      formData.append('saveToDb', 'true');
      
      // Make request to the server
      const response = await fetch('/api/verification/video', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Video verification failed: ${response.status} ${response.statusText}`);
      }
      
      // Parse response
      const result: FaceVerificationResult = await response.json();
      
      // Update verification result
      setVerificationResult(result);
      
      // Update progress based on result
      if (result.success && result.confidence > 70) {
        setProgress(100);
        
        // Show success toast
        toast({
          title: "Verification Complete",
          description: "Your identity has been successfully verified via video.",
          variant: "default",
        });
        
        // Navigate to dashboard after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setProgress(0);
        
        // Show error toast
        toast({
          title: "Verification Failed",
          description: result.message || "Could not verify your identity. Please try again.",
          variant: "destructive",
        });
      }
      
      // Clean up
      URL.revokeObjectURL(videoData.url);
      setIsVerifying(false);
      
    } catch (error: any) {
      console.error("Error processing video verification:", error);
      
      setVerificationResult({
        success: false,
        confidence: 0,
        message: "Error processing video",
        error: error?.message ? error.message : String(error),
        debugSession: `video-error-${Date.now()}`
      });
      
      setProgress(0);
      setIsVerifying(false);
      
      // Show error toast
      toast({
        title: "Verification Error",
        description: `Error: ${error?.message ? error.message : String(error)}`,
        variant: "destructive",
      });
      
      // Clean up
      URL.revokeObjectURL(videoData.url);
    }
  }, [toast, navigate]);

  // Return the hook's interface
  return {
    isVerifying,
    isRecording,
    recordingTime,
    progress: progress,
    verificationProgress: progress,
    verificationResult,
    startDetection,
    stopDetection,
    verifyFace,
    simulateVerification,
    startVideoRecording,
    stopVideoRecording
  };
}