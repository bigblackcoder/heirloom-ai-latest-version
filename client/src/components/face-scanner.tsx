import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { useFaceVerification } from "@/hooks/use-face-verification";

interface FaceScannerProps {
  onProgress: (progress: number) => void;
  onComplete: () => void;
  isComplete: boolean;
}

export default function FaceScanner({ onProgress, onComplete, isComplete }: FaceScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { startDetection, stopDetection, verificationProgress } = useFaceVerification();
  
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
  }, []); // Remove dependency on stopDetection
  
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
  
  // Create the rays around the scanner circle
  const renderRays = () => {
    const rays = [];
    const rayCount = 30;
    
    for (let i = 0; i < rayCount; i++) {
      const rotation = (i * 360) / rayCount;
      rays.push(
        <div 
          key={i}
          className="absolute h-6 w-0.5 bg-[#4caf50] origin-bottom"
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
  
  return (
    <div className="relative flex flex-col items-center">
      {/* Scanner rays */}
      <div className="relative w-72 h-72 mb-4">
        {renderRays()}
        
        {/* Webcam container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border-2 border-white/30 overflow-hidden relative flex items-center justify-center">
            {/* Scanner lines effect */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/10 to-transparent bg-repeat-y" 
                style={{ 
                  backgroundSize: "100% 8px",
                  backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)"
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
                  videoConstraints={{
                    facingMode: "user",
                    width: 640,
                    height: 640
                  }}
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
            className="text-[#4caf50]"
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
      </div>
    </div>
  );
}
