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
  const { startDetection, stopDetection, verificationProgress } = useFaceVerification();
  const isMobile = useIsMobile();
  
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
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
      } catch (error) {
        setHasPermission(false);
        console.error("Camera permission denied:", error);
      }
    };
    
    requestPermission();
    
    return () => {
      // Clean up
      stopDetection();
    };
  }, [stopDetection]);
  
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
        <p className="text-lg font-medium">{getInstructionText()}</p>
        <p className="text-sm text-gray-400">
          {verificationProgress < 100 ? "Move your cursor to align with the yellow crosshair" : ""}
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
                <div className="text-white/80 text-center p-4">
                  <p>Camera access is required for face verification.</p>
                  <p className="text-sm mt-2">Please allow camera access and refresh the page.</p>
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
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#ffeb3b] z-20"></div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#ffeb3b] z-20"></div>
        
        {/* Complete overlay */}
        {isComplete && (
          <div className="absolute inset-0 bg-[#1e3c0d]/50 flex items-center justify-center z-30">
            <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
