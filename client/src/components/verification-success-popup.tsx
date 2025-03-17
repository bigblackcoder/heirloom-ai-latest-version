import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface VerificationSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  verificationData?: {
    confidence: number;
    results?: {
      age?: number;
      gender?: string;
      dominant_race?: string;
      dominant_emotion?: string;
    };
  } | null;
}

export default function VerificationSuccessPopup({ isOpen, onClose, verificationData }: VerificationSuccessPopupProps) {
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
        }, 300); // Wait for exit animation to complete
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  
  // Return null when completely closed to remove from DOM
  if (!isOpen && !isVisible) return null;
  
  return (
    <div 
      className={`fixed inset-0 flex items-end justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-black/30 absolute inset-0" onClick={onClose}></div>
      
      <div 
        className={`bg-white rounded-t-3xl p-6 relative z-50 shadow-xl transform transition-transform duration-300 w-full max-w-md ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{marginBottom: 0, paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0rem))"}}
      >
        {/* Background decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-[#273414]/5 rounded-full"></div>
        <div className="absolute bottom-16 left-4 w-12 h-12 bg-[#273414]/5 rounded-full"></div>
        {/* Check icon */}
        <div className="mx-auto w-20 h-20 bg-[#273414]/10 rounded-full flex items-center justify-center mb-5 relative">
          <div className="absolute inset-0 bg-[#273414]/5 rounded-full animate-pulse"></div>
          <svg className="w-10 h-10 text-[#273414]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 text-[#273414]">Identity Verified!</h2>
        
        <p className="text-gray-700 text-center mb-1">Welcome to <span className="font-semibold text-[#273414]">Heirloom</span>!</p>
        <p className="text-gray-600 text-center mb-4">You've successfully verified your identity with biometric authentication. Your Identity Capsule is now active.</p>
        
        {/* Verification details */}
        {verificationData && (
          <div className="bg-gray-50 rounded-xl p-3 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Verification confidence</span>
              <span className="text-sm font-medium text-[#273414]">
                {Math.round(verificationData.confidence * 100)}%
              </span>
            </div>
            
            {verificationData.results && (
              <div className="grid grid-cols-2 gap-2">
                {verificationData.results.age && (
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <span className="text-xs text-gray-500 block">Age</span>
                    <span className="text-sm font-medium">{verificationData.results.age}</span>
                  </div>
                )}
                {verificationData.results.gender && (
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <span className="text-xs text-gray-500 block">Gender</span>
                    <span className="text-sm font-medium">{verificationData.results.gender}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <button 
          className="w-full bg-[#273414] hover:bg-[#324319] text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              onClose();
              navigate("/dashboard");
            }, 300);
          }}
        >
          Continue to Dashboard
        </button>
        
        {/* Bottom indicator */}
        <div className="w-full flex justify-center mt-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}