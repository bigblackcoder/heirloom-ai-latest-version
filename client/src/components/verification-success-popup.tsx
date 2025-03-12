import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface VerificationSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerificationSuccessPopup({ isOpen, onClose }: VerificationSuccessPopupProps) {
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
        <p className="text-gray-600 text-center mb-6">You've successfully verified your identity with biometric authentication. Your Identity Capsule is now active.</p>
        
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