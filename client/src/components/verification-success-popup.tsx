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
        {/* Check icon */}
        <div className="mx-auto w-16 h-16 bg-[#f8f2e9] rounded-full flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[#d4a166]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Nice! Your account is Verified!</h2>
        
        <p className="text-gray-600 text-center mb-1">Welcome to <span className="font-semibold">Heirloom</span>!</p>
        <p className="text-gray-600 text-center mb-6">You've successfully verified your humanness, and we're excited to have you!</p>
        
        <button 
          className="w-full bg-[#a4cb76] hover:bg-[#7c9861] text-[#273414] font-medium py-3 rounded-full transition-colors"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              onClose();
              navigate("/dashboard");
            }, 300);
          }}
        >
          Get started!
        </button>
        
        {/* Bottom indicator */}
        <div className="w-full flex justify-center mt-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}