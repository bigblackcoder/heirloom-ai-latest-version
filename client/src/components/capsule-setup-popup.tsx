import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface CapsuleSetupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CapsuleSetupPopup({ isOpen, onClose }: CapsuleSetupPopupProps) {
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
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-black/50 absolute inset-0" onClick={onClose}></div>
      
      <div 
        className={`bg-white rounded-3xl w-full max-w-xs p-6 relative z-10 shadow-xl transform transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-20"
        }`}
      >
        {/* Check icon */}
        <div className="mx-auto w-16 h-16 bg-[#d4a166]/20 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#d4a166]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-4">Complete Your Capsule Setup to Start Connecting with AI Safely.</h2>
        
        <p className="text-gray-600 text-sm mb-6">
          Your Identity Capsule is your secure digital vault, designed to keep your verified data safe and under your control. With Heirloom, you can confidently manage your data, connect it to trusted AI systems, and shape your digital legacy—all on your terms. Ready to take the next step?
        </p>
        
        <button 
          className="w-full bg-[#8ccc5c] hover:bg-[#7cb34e] text-[#1e3c0d] font-medium py-3 rounded-full transition-colors"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              onClose();
              navigate("/capsule");
            }, 300);
          }}
        >
          Let's Do It!
        </button>
        
        {/* Bottom indicator */}
        <div className="w-full flex justify-center mt-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}