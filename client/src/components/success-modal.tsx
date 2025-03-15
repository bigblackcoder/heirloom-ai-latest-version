import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface SuccessModalProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
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

export default function SuccessModal({
  title,
  message,
  buttonText,
  onButtonClick,
  verificationData
}: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    // Show the modal with animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      
      // Allow time for exit animation before calling onButtonClick
      const exitTimer = setTimeout(() => {
        onButtonClick();
      }, 500);
      
      return () => clearTimeout(exitTimer);
    }, 5000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [onButtonClick]);
  
  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-end px-4 z-50 pb-8">
      <div 
        className={`bg-white w-full max-w-md mx-auto rounded-3xl shadow-lg overflow-hidden transform transition-all duration-500 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        } ${isExiting ? 'translate-y-full' : ''}`}
      >
        {/* Identity capsule mock at the top */}
        <div className="bg-[#1e3c0d] p-5">
          {/* Security indicator */}
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 rounded-full bg-[#4caf50] mr-2"></div>
            <span className="text-xs text-white/70">Secure | 2FA Enabled</span>
            <div className="flex-1"></div>
            <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          
          <div className="text-white/70 text-xs mb-2">Identity Capsule Snapshot</div>
          
          {/* User info */}
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden mr-3">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-white font-medium">Leslie Alexander</h3>
              <p className="text-white/60 text-xs">Member Since 2024</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-col gap-1 mb-2">
            <div className="text-white">Verified Data:</div>
            <div className="text-[#4caf50] font-medium">5 Assets</div>
            
            <div className="text-white">AI Connections:</div>
            <div className="text-[#4caf50] font-medium">3 LLMs | 7 Agents</div>
          </div>
          
          {/* Verification status & attributes */}
          <div className="flex flex-col mt-3 space-y-2">
            {/* Verification confidence badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-[#2a5414] rounded-full px-4 py-1">
                <svg className="w-4 h-4 text-[#4caf50] mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-white text-sm">Verified</span>
              </div>
              
              <div className="text-white text-sm">
                {verificationData ? `${Math.round(verificationData.confidence * 100)}% match` : '1% match'}
              </div>
            </div>
            
            {/* Detected attributes */}
            {verificationData?.results && (
              <div className="grid grid-cols-2 gap-2 bg-[#2a5414]/30 p-2 rounded-lg">
                {verificationData.results.age && (
                  <div className="flex flex-col">
                    <span className="text-white/70 text-xs">Age</span>
                    <span className="text-white text-sm">{verificationData.results.age}</span>
                  </div>
                )}
                
                {verificationData.results.gender && (
                  <div className="flex flex-col">
                    <span className="text-white/70 text-xs">Gender</span>
                    <span className="text-white text-sm">{verificationData.results.gender}</span>
                  </div>
                )}
                
                {verificationData.results.dominant_race && (
                  <div className="flex flex-col">
                    <span className="text-white/70 text-xs">Ethnicity</span>
                    <span className="text-white text-sm capitalize">{verificationData.results.dominant_race}</span>
                  </div>
                )}
                
                {verificationData.results.dominant_emotion && (
                  <div className="flex flex-col">
                    <span className="text-white/70 text-xs">Expression</span>
                    <span className="text-white text-sm capitalize">{verificationData.results.dominant_emotion}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-1">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white p-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <div className="w-9 h-9 bg-[#d4a16680] rounded-full flex items-center justify-center p-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="6" cy="12" r="1" fill="currentColor" />
                  <circle cx="18" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Success message */}
        <div className="p-6">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-[#d4a166] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">{title}</h2>
          <p className="text-center text-gray-600 mb-6">
            Welcome to <span className="font-medium">Heirloom</span>!<br />
            {message}
          </p>
          
          <Button 
            className="w-full py-6 bg-[#4caf50] hover:bg-[#2a5414] text-white rounded-full font-medium"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
        
        {/* Bottom indicator */}
        <div className="flex justify-center pb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
