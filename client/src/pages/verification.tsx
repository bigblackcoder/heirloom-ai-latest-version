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
      {/* Back Button */}
      <div className="w-full px-6 pt-12">
        <button 
          onClick={handleBackClick}
          className="w-10 h-10 rounded-full bg-[#2a5414] flex items-center justify-center"
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
        
        <div className="text-[#4caf50] text-3xl font-bold mt-8">
          {verificationProgress}%
        </div>
        <p className="text-white/80 text-center mt-2">
          Move your head slowly to complete the circle.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-12">
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
