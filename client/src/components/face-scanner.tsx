import { useState, useEffect, useRef } from "react";
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
  
  // Request camera permission and start face verification when component mounts
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
      startDetection(webcamRef.current.video);
    }
  }, [hasPermission, startDetection]);
  
  // Report progress to parent component
  useEffect(() => {
    onProgress(verificationProgress);
    
    if (verificationProgress >= 100 && !isComplete) {
      stopDetection();
      onComplete();
    }
  }, [verificationProgress, isComplete, onComplete, onProgress, stopDetection]);
  
  return (
    <div className="relative">
      <div className="w-64 h-64 rounded-full border-4 border-white overflow-hidden relative flex items-center justify-center">
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
        
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 280 280">
          <circle
            className="text-white/20"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r="130"
            cx="140"
            cy="140"
          />
          <motion.circle
            className="text-white"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r="130"
            cx="140"
            cy="140"
            strokeDasharray="816.8"
            initial={{ strokeDashoffset: 816.8 }}
            animate={{ 
              strokeDashoffset: isComplete ? 0 : 816.8 * (1 - verificationProgress / 100) 
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
          />
        </svg>
        
        {/* Alignment guides */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#f0b73e] z-20"></div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#f0b73e] z-20"></div>
      </div>
    </div>
  );
}
