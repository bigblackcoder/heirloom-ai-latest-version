import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { useFaceVerification } from "@/hooks/use-face-verification";
import { useIsMobile } from "@/hooks/use-mobile";

// Declare mouseX and mouseY on window object for cross-component tracking
declare global {
  interface Window {
    mouseX?: number;
    mouseY?: number;
  }
}

interface FaceScannerProps {
  onProgress: (progress: number) => void;
  onComplete: () => void;
  isComplete: boolean;
}

export default function FaceScanner({ onProgress, onComplete, isComplete }: FaceScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const { startDetection, stopDetection, verificationProgress, simulateVerification } = useFaceVerification();
  const isMobile = useIsMobile();
  const demoSimulationRef = useRef<(() => void) | null>(null);
  
  // Use a ref to track previous progress to avoid unnecessary updates
  const lastProgressRef = useRef<number>(0);
  const isCompleteRef = useRef<boolean>(false);
  
  // Update the ref when isComplete changes
  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);
  
  // Memoized callback for updating progress
  const handleProgressUpdate = useCallback((progress: number) => {
    // Only call onProgress if the progress has changed by at least 1%
    if (Math.abs(lastProgressRef.current - progress) >= 1) {
      lastProgressRef.current = progress;
      onProgress(progress);
    }
    
    // Call onComplete once when progress reaches 100% and isComplete is false
    if (progress >= 100 && !isCompleteRef.current) {
      stopDetection();
      onComplete();
    }
  }, [onProgress, onComplete, stopDetection]);
  
  // Request camera permission when component mounts
  useEffect(() => {
    const requestPermission = async () => {
      try {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera access is not supported in your browser");
        }
        
        // Try with explicit device constraints
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          throw new Error("No camera devices found on your system");
        }
        
        // Try to get access with the first available camera
        await navigator.mediaDevices.getUserMedia({ 
          video: {
            deviceId: videoDevices[0].deviceId,
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        setHasPermission(true);
      } catch (error) {
        setHasPermission(false);
        console.error("Camera permission denied:", error);
        
        // Simulate progress for demo purposes if camera isn't available
        // This is just for demo - in a real app we'd require camera access
        let fakeProgress = 0;
        const interval = setInterval(() => {
          fakeProgress += 2;
          if (fakeProgress >= 100) {
            clearInterval(interval);
            onComplete();
          } else {
            onProgress(fakeProgress);
          }
        }, 200);
      }
    };
    
    requestPermission();
    
    return () => {
      // Clean up
      stopDetection();
    };
  }, [stopDetection, onProgress, onComplete]);
  
  // Start detection when webcam is ready and permission is granted
  useEffect(() => {
    if (hasPermission && webcamRef.current && webcamRef.current.video) {
      const videoElement = webcamRef.current.video;
      startDetection(videoElement);
    }
  }, [hasPermission, startDetection]);
  
  // Update progress separately from the render cycle
  useEffect(() => {
    handleProgressUpdate(verificationProgress);
  }, [verificationProgress, handleProgressUpdate]);
  
  // Add mouse tracking for face alignment simulation
  useEffect(() => {
    const trackMouseMovement = (e: MouseEvent) => {
      window.mouseX = e.clientX;
      window.mouseY = e.clientY;
    };
    
    // For touch devices
    const trackTouchMovement = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        window.mouseX = e.touches[0].clientX;
        window.mouseY = e.touches[0].clientY;
      }
    };
    
    // Add event listeners
    window.addEventListener('mousemove', trackMouseMovement);
    window.addEventListener('touchmove', trackTouchMovement);
    
    // Set initial values to center
    if (webcamRef.current && webcamRef.current.video) {
      const rect = webcamRef.current.video.getBoundingClientRect();
      window.mouseX = rect.left + rect.width / 2;
      window.mouseY = rect.top + rect.height / 2;
    }
    
    // Clean up
    return () => {
      window.removeEventListener('mousemove', trackMouseMovement);
      window.removeEventListener('touchmove', trackTouchMovement);
    };
  }, [webcamRef.current]);
  
  // Create the rays around the scanner circle
  const renderRays = () => {
    const rays = [];
    const rayCount = 30;
    
    for (let i = 0; i < rayCount; i++) {
      const rotation = (i * 360) / rayCount;
      rays.push(
        <div 
          key={i}
          className="absolute h-6 w-0.5 bg-[#273414] origin-bottom"
          style={{ 
            left: 'calc(50% - 1px)',
            bottom: '50%',
            transform: `rotate(${rotation}deg) translateY(-140px)`
          }}
        />
      );
    }
    
    return rays;
  };
  
  // Determine the size based on mobile status
  const videoConstraints = {
    width: isMobile ? 280 : 400,
    height: isMobile ? 350 : 400,
    facingMode: "user"
  };
  
  // Generates instructional text based on progress
  const getInstructionText = () => {
    if (verificationProgress < 30) {
      return "Center your face in the frame";
    } else if (verificationProgress < 60) {
      return "Hold still while we scan";
    } else if (verificationProgress < 90) {
      return "Almost there, keep steady";
    } else {
      return "Verification complete!";
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Instruction text */}
      <div className="mb-4 text-center">
        <p className="text-lg font-medium text-[#273414]">{getInstructionText()}</p>
        <p className="text-sm text-gray-500">
          {verificationProgress < 100 ? "Move your cursor to align with the crosshair" : ""}
        </p>
      </div>
      
      {/* Scanner rays */}
      <div className="relative w-72 h-72 mb-4">
        {renderRays()}
        
        {/* Webcam container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border-2 border-[#273414]/30 overflow-hidden relative flex items-center justify-center">
            {/* Scanner lines effect */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/10 to-transparent bg-repeat-y" 
                style={{ 
                  backgroundSize: "100% 8px",
                  backgroundImage: "linear-gradient(to bottom, rgba(39,52,20,0.1), rgba(39,52,20,0.1) 1px, transparent 1px, transparent 4px)",
                  animation: "scanAnimation 1.5s linear infinite"
                }}
            />
            
            {/* Camera feed */}
            <div className="absolute inset-0 flex items-center justify-center">
              {hasPermission === false && (
                <div className="text-white/80 text-center p-4 bg-black/50 w-full h-full flex items-center justify-center">
                  <div>
                    <svg className="w-12 h-12 mx-auto mb-3 text-[#91c35c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15.5 9a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                      <path d="M11.5 14.2c-.8.5-1.7.8-2.5.8-2.2 0-4-2.2-4-5s1.8-5 4-5c.8 0 1.7.3 2.5.8" />
                      <path d="m21 8-3.3 1.7M16 12l4-.1M16.7 16.2 20 18" />
                      <path d="M2 12h5" />
                      <path d="M13 21c-1.2-1-2-2.4-2-4s.8-3 2-4" />
                    </svg>
                    
                    <p className="text-white font-medium mb-1">Camera access required</p>
                    <p className="text-sm text-white/80 mb-3">For security purposes, we need to verify your identity</p>
                    
                    <button 
                      onClick={() => {
                        if (!isSimulating) {
                          demoSimulationRef.current = simulateVerification();
                          setIsSimulating(true);
                        }
                      }}
                      className="mx-auto bg-[#91c35c] text-white py-2 px-3 rounded-lg text-sm font-medium w-max hover:bg-[#7dac4c] transition-colors"
                    >
                      {isSimulating ? "Demo mode: Auto-completing..." : "Continue with Demo Mode"}
                    </button>
                  </div>
                </div>
              )}
              
              {hasPermission === true && (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scale(-1, 1)" // Mirror the webcam
                  }}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Verification progress ring */}
        <svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 290 290">
          <motion.circle
            className="text-[#273414]"
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
            r="142"
            cx="145"
            cy="145"
            strokeDasharray="892"
            initial={{ strokeDashoffset: 892 }}
            animate={{ 
              strokeDashoffset: isComplete ? 0 : 892 * (1 - verificationProgress / 100) 
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
          />
        </svg>
        
        {/* Alignment guides */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#91c35c] z-20"></div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#91c35c] z-20"></div>
        
        {/* Complete overlay */}
        {isComplete && (
          <div className="absolute inset-0 bg-[#273414]/60 flex items-center justify-center z-30">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full animate-pulse bg-white/10"></div>
              <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
