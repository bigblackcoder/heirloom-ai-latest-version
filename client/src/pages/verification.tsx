import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FaceScanner from "@/components/face-scanner";
import SuccessModal from "@/components/success-modal";

export default function Verification() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleBackClick = () => {
    navigate("/");
  };

  const handleVerificationProgress = (progress: number) => {
    setVerificationProgress(progress);
  };

  const handleVerificationComplete = async () => {
    setIsVerificationComplete(true);
    
    try {
      // Call backend verification endpoint
      await apiRequest("POST", "/api/verification/face", {});
      
      // Show success modal
      setShowSuccessModal(true);
      
      // After a delay, navigate to dashboard
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "There was a problem verifying your identity. Please try again.",
        variant: "destructive",
      });
      
      // Reset verification
      setVerificationProgress(0);
      setIsVerificationComplete(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1e3c0d] text-white">
      {/* Status bar area */}
      <div className="w-full px-4 pt-6 pb-2 flex items-center">
        <div className="text-sm opacity-70">9:41</div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
            <path d="M1.5 6.5C1.5 4 3.5 2 6 2 8.5 2 10.5 4 10.5 6.5v11C10.5 20 8.5 22 6 22 3.5 22 1.5 20 1.5 17.5v-11Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 6c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v11c0 2.5-2 4.5-4.5 4.5S10.5 19.5 10.5 17V6Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M19.5 7a2.5 2.5 0 0 1 5 0v10a2.5 2.5 0 0 1-5 0V7Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
            <path d="M3 7c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M21 16h2v-8h-2M1 16h2V8H1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>

      {/* Back Button */}
      <div className="w-full px-6 pt-4">
        <button 
          onClick={handleBackClick}
          className="w-10 h-10 rounded-full bg-[#2a5414]/40 backdrop-blur-sm flex items-center justify-center"
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Face Scanner Component */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <FaceScanner 
          onProgress={handleVerificationProgress} 
          onComplete={handleVerificationComplete}
          isComplete={isVerificationComplete}
        />
        
        <div className="text-[#4caf50] text-3xl font-bold mt-6">
          {verificationProgress}%
        </div>
        <p className="text-white/80 text-center mt-1">
          Move your head slowly to complete the circle.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-8 pb-8">
        <div className="w-full h-1 bg-white/20 rounded-full">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300 ease-out"
            style={{ width: `${verificationProgress}%` }}
          />
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal 
          title="Nice! Your account is Verified!" 
          message="Welcome to Heirloom! You've successfully verified your humanness, and we're excited to have you!"
          buttonText="Get started!"
          onButtonClick={() => navigate("/dashboard")}
        />
      )}
    </div>
  );
}
