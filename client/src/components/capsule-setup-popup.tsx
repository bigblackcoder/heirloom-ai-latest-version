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
        className={`bg-white rounded-t-3xl w-full max-w-md p-6 relative z-50 shadow-xl transform transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{marginBottom: 0, paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0rem))"}}
      >
        {/* Background decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-[#273414]/5 rounded-full"></div>
        <div className="absolute bottom-16 left-4 w-12 h-12 bg-[#273414]/5 rounded-full"></div>
        
        {/* Capsule icon */}
        <div className="mx-auto w-20 h-20 bg-[#273414]/10 rounded-full flex items-center justify-center mb-5 relative">
          <div className="absolute inset-0 bg-[#273414]/5 rounded-full animate-pulse"></div>
          <svg className="w-10 h-10 text-[#273414]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor" />
            <path d="M12 7L12 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 12L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-3 text-[#273414]">Set Up Your Identity Capsule</h2>
        
        <p className="text-gray-700 text-center mb-6">
          Your Identity Capsule is your secure digital vault that keeps your verified data safe and under your control. Ready to take the next step in securing your digital identity?
        </p>
        
        <button 
          className="w-full bg-[#273414] hover:bg-[#324319] text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              onClose();
              navigate("/capsule");
            }, 300);
          }}
        >
          Set Up My Identity Capsule
        </button>
        
        {/* Bottom indicator */}
        <div className="w-full flex justify-center mt-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}