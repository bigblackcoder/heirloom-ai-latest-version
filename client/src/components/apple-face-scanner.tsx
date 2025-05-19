import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { useFaceVerification } from '@/hooks/use-face-verification';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { DebugSession } from './debug-session';
import { CheckCircle2, Scan } from 'lucide-react';

// Type for face positioning instructions
type FacePositionType = 'center' | 'moving' | 'unstable' | 'detecting' | 'aligned';

// Global window type extension for mouse tracking
declare global {
  interface Window {
    mouseX?: number;
    mouseY?: number;
  }
}

interface FaceScannerProps {
  onProgress: (progress: number) => void;
  onComplete: (imageData?: string) => void;
  isComplete: boolean;
}

/**
 * Apple FaceID-style face scanner component that integrates with DeepFace
 * backend technology for secure identity verification
 */
export default function AppleFaceScanner({ onProgress, onComplete, isComplete }: FaceScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [debugSessionId, setDebugSessionId] = useState<string | undefined>(undefined);
  const [debugData, setDebugData] = useState<any>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceInPosition, setFaceInPosition] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  
  // Updated face position with specific type
  const [facePosition, setFacePosition] = useState<FacePositionType>('detecting');
  const [isStable, setIsStable] = useState(false);
  
  // Improved motion tracking state
  const [motionTracking, setMotionTracking] = useState({
    movement: 0,
    stabilityCounter: 0,
    movingTextTimer: 0,
    lastMotionUpdate: Date.now()
  });
  
  // Canvas reference for motion detection
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastImageDataRef = useRef<ImageData | null>(null);
  
  const { startDetection, stopDetection, verificationProgress, verificationResult, simulateVerification, verifyFace } = useFaceVerification();
  const isMobile = useIsMobile();
  const demoSimulationRef = useRef<(() => void) | null>(null);
  
  // Use a ref to track previous progress
  const prevProgressRef = useRef(0);
  
  // Progress thresholds for different animation states
  const FACE_DETECTED_THRESHOLD = 10;
  const FACE_POSITIONED_THRESHOLD = 40;
  const SCAN_COMPLETE_THRESHOLD = 85;
  
  // Motion detection constants
  const MOTION_THRESHOLD = 15;
  const HIGH_MOTION_THRESHOLD = 30;
  const STABILITY_MAX = 30;
  const STABILITY_THRESHOLD = 15;

  // Check camera permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // First make sure the API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('MediaDevices API not supported in this browser');
          setHasPermission(false);
          return;
        }

        // Request camera permission with specific constraints for better compatibility
        const constraints = { 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Permission granted
        setHasPermission(true);
        console.log('Camera permission granted successfully');
        
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        // Permission denied or other error
        console.error('Camera permission denied or error:', err);
        setHasPermission(false);
        
        // Show more user-friendly error in development
        if (process.env.NODE_ENV === 'development') {
          alert('Camera access is required for face verification. Please allow camera access and try again.');
        }
      }
    };
    
    checkPermission();
  }, []);

  // Initialize the motion detection canvas once
  useEffect(() => {
    // Create the canvas element for motion detection
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 80; // Small size for performance
      canvas.height = 60;
      canvasRef.current = canvas;
    }
  }, []);

  // Dedicated function for motion detection
  const detectMotion = (video: HTMLVideoElement) => {
    if (!canvasRef.current || video.readyState !== 4) return 0;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return 0;
    
    // Draw the current video frame to canvas
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Skip first frame
      if (!lastImageDataRef.current) {
        lastImageDataRef.current = currentImageData;
        return 0;
      }
      
      // Calculate difference between frames to detect motion
      let diff = 0;
      const current = currentImageData.data;
      const last = lastImageDataRef.current.data;
      
      // Sample pixels (for performance)
      const step = 16; // Skip pixels for better performance
      for (let i = 0; i < current.length; i += step) {
        diff += Math.abs(current[i] - last[i]);
      }
      
      diff = diff / (current.length / step); // Normalize
      
      // Store current frame as last frame
      lastImageDataRef.current = currentImageData;
      
      return diff;
    } catch (e) {
      console.error("Error detecting motion:", e);
      return 0;
    }
  };

  // Track face movement using the camera video and update facial captions
  useEffect(() => {
    if (!isComplete && hasPermission && !isSimulating && webcamRef.current?.video) {
      // Set up motion detection and face tracking
      const video = webcamRef.current.video;
      
      // Processing function for each frame
      const processFrame = () => {
        if (!video || isComplete) return;
        
        // Detect motion in the video frame
        const motionValue = detectMotion(video);
        
        // Update motion tracking state with timestamps for UI feedback
        const now = Date.now();
        setMotionTracking(prev => {
          const newState = {...prev};
          newState.movement = motionValue;
          newState.lastMotionUpdate = now;
          
          // Check if stable (low movement)
          if (motionValue < MOTION_THRESHOLD) {
            newState.stabilityCounter = Math.min(prev.stabilityCounter + 1, STABILITY_MAX);
            // Reset moving text timer when motion is low
            newState.movingTextTimer = 0;
          } else {
            // Higher penalty for more movement
            const penalty = motionValue > HIGH_MOTION_THRESHOLD ? 3 : 1;
            newState.stabilityCounter = Math.max(prev.stabilityCounter - penalty, 0);
            
            // Increment moving text timer when motion is high
            newState.movingTextTimer = prev.movingTextTimer + 1;
          }
          
          return newState;
        });
        
        // Update face stability state for UI feedback
        if (motionTracking.stabilityCounter > STABILITY_THRESHOLD && !isStable) {
          setIsStable(true);
        } else if (motionTracking.stabilityCounter < 5 && isStable) {
          setIsStable(false);
        }
        
        // Set face position feedback (used for UI captions)
        if (motionTracking.movingTextTimer > 3 || motionValue > HIGH_MOTION_THRESHOLD) {
          setFacePosition('moving');
        } else if (!faceDetected && verificationProgress < FACE_DETECTED_THRESHOLD) {
          setFacePosition('detecting');
        } else if (verificationProgress > FACE_POSITIONED_THRESHOLD && isStable) {
          setFacePosition('aligned');
        } else if (!isStable) {
          setFacePosition('unstable');
        } else {
          setFacePosition('center');
        }
        
        // Update face detection states based on progress
        if (verificationProgress >= FACE_DETECTED_THRESHOLD && !faceDetected) {
          setFaceDetected(true);
        }
        
        if (verificationProgress >= FACE_POSITIONED_THRESHOLD && !faceInPosition) {
          setFaceInPosition(true);
        }
        
        if (verificationProgress >= SCAN_COMPLETE_THRESHOLD && !scanComplete) {
          setScanComplete(true);
        }
      };
      
      // Run the frame processing with animation frames for smoother performance
      let frameId: number | null = null;
      
      const animateFrame = () => {
        processFrame();
        frameId = requestAnimationFrame(animateFrame);
      };
      
      frameId = requestAnimationFrame(animateFrame);
      
      // Separate interval for face detection (less frequent to reduce API load)
      console.log("Face detection started");
      const detectionInterval = setInterval(() => {
        if (webcamRef.current?.video?.readyState === 4) {
          const screenshot = webcamRef.current.getScreenshot();
          if (screenshot) {
            // Make sure we're passing a proper base64 image
            if (screenshot.startsWith('data:image')) {
              startDetection(screenshot);
            } else {
              console.error("Invalid screenshot format", screenshot.substring(0, 20));
            }
          }
        }
      }, 1000); // Less frequent checks to reduce server load
      
      return () => {
        if (frameId !== null) cancelAnimationFrame(frameId);
        clearInterval(detectionInterval);
      };
    }
  }, [
    hasPermission, 
    isComplete, 
    isSimulating, 
    startDetection, 
    isStable, 
    faceDetected,
    faceInPosition,
    scanComplete,
    motionTracking.movingTextTimer,
    motionTracking.stabilityCounter,
    FACE_DETECTED_THRESHOLD,
    FACE_POSITIONED_THRESHOLD, 
    SCAN_COMPLETE_THRESHOLD,
    MOTION_THRESHOLD,
    HIGH_MOTION_THRESHOLD,
    STABILITY_THRESHOLD
  ]);

  // Listen for verification progress and update UI states
  useEffect(() => {
    // Update parent's progress tracker
    if (verificationProgress !== prevProgressRef.current) {
      onProgress(verificationProgress);
      prevProgressRef.current = verificationProgress;
    }
    
    // Update UI states based on progress thresholds
    if (verificationProgress >= FACE_DETECTED_THRESHOLD && !faceDetected) {
      setFaceDetected(true);
    }
    
    if (verificationProgress >= FACE_POSITIONED_THRESHOLD && !faceInPosition) {
      setFaceInPosition(true);
    }
    
    if (verificationProgress >= SCAN_COMPLETE_THRESHOLD && !scanComplete) {
      setScanComplete(true);
    }
    
    // When verification is complete, pass the image data to the parent
    if (verificationProgress === 100 && !isComplete) {
      // Take final screenshot with good posture
      const screenshot = webcamRef.current?.getScreenshot();
      if (screenshot) {
        onComplete(screenshot);
      }
      // Stop the detection process
      stopDetection();
    }
  }, [verificationProgress, faceDetected, faceInPosition, scanComplete, isComplete, onProgress, onComplete, stopDetection]);

  // Update debug data when verification result changes
  useEffect(() => {
    if (verificationResult && verificationResult.debugSession) {
      setDebugSessionId(verificationResult.debugSession);
      
      // Compile debug info
      const debugInfo = {
        confidence: verificationResult.confidence,
        matched: verificationResult.matched,
        success: verificationResult.success,
        message: verificationResult.message,
        error: verificationResult.error,
        details: verificationResult.details,
        results: verificationResult.results,
      };
      
      setDebugData(debugInfo);
    }
  }, [verificationResult]);
  
  // Mock image data for simulation
  const mockImageData = "data:image/jpeg;base64,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";
  
  // Effect to handle simulation state changes
  useEffect(() => {
    if (isSimulating && verificationProgress >= 99) {
      // Simulation completed - send mock image data and force completion
      onComplete(mockImageData);
    }
  }, [isSimulating, verificationProgress, onComplete, mockImageData]);

  // Helper functions
  const getInstructionText = () => {
    if (verificationProgress === 100 || isComplete) {
      return "Verification Complete";
    } else if (verificationProgress > SCAN_COMPLETE_THRESHOLD) {
      return "Almost There!";
    } else if (verificationProgress > FACE_POSITIONED_THRESHOLD) {
      return "Hold Still";
    } else if (verificationProgress > FACE_DETECTED_THRESHOLD) {
      return "Center Your Face";
    } else {
      return "Look Into the Camera";
    }
  };

  // Render the component
  return (
    <div className="relative flex flex-col items-center">
      {/* Debug information component - only visible in development */}
      <DebugSession debugId={debugSessionId} data={debugData} />
      
      {/* Apple-style instruction text */}
      <div className="mb-4 text-center">
        <p className="text-xl font-medium text-gray-800 dark:text-white">{getInstructionText()}</p>
        
        {verificationProgress < 100 && (
          <div className="mt-2 flex flex-col items-center">
            {/* Status Message - Improved with motion feedback */}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {facePosition === 'detecting' ? "Position your face in the frame" :
               facePosition === 'moving' ? "Please hold still..." :
               facePosition === 'unstable' ? "Try to remain still" :
               facePosition === 'aligned' ? "Perfect! Hold position" :
               "Keep your face centered"}
            </p>
            
            {/* iOS-style Status Pill - Updated with more motion states */}
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
              <div className={`mr-2 h-2.5 w-2.5 rounded-full 
                ${facePosition === 'moving' ? "bg-yellow-300 animate-pulse" : 
                  facePosition === 'unstable' ? "bg-blue-300 animate-pulse" :
                  facePosition === 'aligned' ? "bg-green-300 animate-pulse" :
                  verificationProgress > 50 ? "bg-green-300 animate-pulse" : 
                  "bg-gray-200"}`}>
              </div>
              <span className="text-xs font-medium text-white">
                {facePosition === 'detecting' ? "Finding face..." :
                 facePosition === 'moving' ? "Too much movement" :
                 facePosition === 'unstable' ? "Stabilizing..." :
                 facePosition === 'aligned' ? "Face aligned" :
                 verificationProgress > 80 ? "Almost done" : 
                 verificationProgress > 40 ? "Scanning..." : 
                 "Detecting face..."}
              </span>
            </div>
            
            {/* Clean Progress Bar */}
            <div className="w-48 h-1.5 mt-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(verificationProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Camera Frame (Apple Style) */}
      <div className="relative w-72 h-72 mb-4">
        {/* Outer Ring Animation - Updated with improved status indicators */}
        <div className={`absolute inset-0 rounded-full border-4 
                        ${facePosition === 'moving' ? "border-yellow-400" : 
                          facePosition === 'unstable' ? "border-blue-400" :
                          facePosition === 'aligned' ? "border-green-400" : 
                          facePosition === 'detecting' ? "border-gray-300" :
                          "border-blue-300"} 
                        ${(facePosition === 'moving') ? "animate-pulse" : 
                          (facePosition === 'unstable') ? "animate-pulse" : 
                          (facePosition === 'aligned') && "animate-pulse"} 
                        transition-colors duration-300`}>
        </div>
        
        {/* Face outline guide - appears when face is detected but needs positioning */}
        {faceDetected && (facePosition === 'unstable' || facePosition === 'moving') && (
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/30 z-20"></div>
        )}
        
        {/* Camera container */}
        <div className="absolute inset-2 flex items-center justify-center rounded-full overflow-hidden bg-black">
          {/* iOS-style scan overlay - different animations by state */}
          <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${faceDetected ? "opacity-100" : "opacity-0"}`}>
            <div 
              className={`absolute inset-0 bg-gradient-to-b from-transparent 
                          ${facePosition === 'moving' ? "via-yellow-500/10" : 
                            facePosition === 'unstable' ? "via-blue-500/10" : 
                            facePosition === 'aligned' ? "via-green-500/10" :
                            "via-blue-500/10"} to-transparent`}
              style={{ 
                backgroundSize: "100% 8px",
                animation: `scanAnimation ${facePosition === 'moving' ? "1s" : "2s"} linear infinite`
              }}
            />
          </div>
          
          {/* Camera feed */}
          <div className="absolute inset-0 flex items-center justify-center">
            {hasPermission === false && (
              <div className="text-white/80 text-center p-4 bg-black/70 w-full h-full flex items-center justify-center">
                <div>
                  <svg className="w-12 h-12 mx-auto mb-3 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  
                  <p className="text-white font-medium mb-1">Camera access required</p>
                  <p className="text-sm text-white/80 mb-3">Please allow camera access to verify your identity</p>
                  
                  <button 
                    onClick={() => {
                      if (!isSimulating) {
                        demoSimulationRef.current = simulateVerification();
                        setIsSimulating(true);
                      }
                    }}
                    className="mx-auto bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium w-max hover:bg-blue-600 transition-colors"
                  >
                    {isSimulating ? "Simulating..." : "Continue with Demo Mode"}
                  </button>
                </div>
              </div>
            )}
            
            {hasPermission === true && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: { ideal: 720 },
                  height: { ideal: 720 },
                  facingMode: "user",
                  aspectRatio: 1
                }}
                className="min-w-full min-h-full object-cover"
                onUserMediaError={(error) => {
                  console.error("Webcam error:", error);
                  setHasPermission(false);
                }}
                onUserMedia={() => {
                  console.log("Camera connected successfully");
                  setHasPermission(true);
                }}
              />
            )}
          </div>
        </div>
        
        {/* Face Position Guide */}
        {faceDetected && !isComplete && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className={`w-44 h-44 text-white/30 transition-opacity duration-300 ${faceInPosition ? "opacity-0" : "opacity-100"}`} 
                viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="50" cy="50" r="45" strokeDasharray="4 4" />
              <circle cx="50" cy="50" r="40" />
              <path d="M30,40 Q40,30 50,40 Q60,30 70,40" />
              <circle cx="35" cy="35" r="5" />
              <circle cx="65" cy="35" r="5" />
              <ellipse cx="50" cy="70" rx="10" ry="5" />
            </svg>
          </div>
        )}
        
        {/* Success Animation - Apple-style success checkmark */}
        {(verificationProgress === 100 || isComplete) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full animate-fadeIn z-30">
            <div className="relative">
              {/* Outer success circle with glow */}
              <div className="absolute inset-0 rounded-full bg-green-500 opacity-40 animate-ping"></div>
              
              {/* Main success circle */}
              <div className="rounded-full bg-gradient-to-br from-green-400 to-green-600 p-5 shadow-lg animate-scaleIn relative z-10">
                <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Inner white success flash */}
              <div className="absolute inset-0 bg-white rounded-full opacity-0 animate-successFlash z-20"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Instruction Area */}
      <div className="mt-2 max-w-sm text-center">
        {verificationProgress < FACE_DETECTED_THRESHOLD && (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Make sure your face is clearly visible</p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Hold your device at eye level</p>
            </div>
          </div>
        )}
      </div>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes scanAnimation {
            from { transform: translateY(-100%); }
            to { transform: translateY(100%); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
          
          @keyframes successFlash {
            0% { opacity: 0; }
            50% { opacity: 0.8; }
            100% { opacity: 0; }
          }
          
          @keyframes ping {
            0% { transform: scale(0.8); opacity: 0.8; }
            70%, 100% { transform: scale(1.8); opacity: 0; }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          .animate-scaleIn {
            animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          
          .animate-successFlash {
            animation: successFlash 0.8s ease-out forwards;
          }
          
          .animate-ping {
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}
      </style>
    </div>
  );
}