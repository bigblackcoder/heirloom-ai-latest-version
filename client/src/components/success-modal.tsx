import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface SuccessModalProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  verificationData?: {
    confidence: number;
    matched?: boolean;
    face_id?: string;
    results?: {
      age?: number;
      gender?: string;
      dominant_race?: string;
      dominant_emotion?: string;
    };
    blockchain_data?: {
      verified: boolean;
      hitToken?: string;
      metadata?: {
        verificationMethod: string;
        verificationTimestamp: string;
        confidence: number;
        blockchainInfo?: {
          chainId: number;
          contractAddress: string;
          tokenId: string;
        };
      };
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
    // Show the modal with animation after a short delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      // Start exit animation
      setIsExiting(true);
      
      // Navigate to dashboard after animation completes
      const exitTimer = setTimeout(() => {
        onButtonClick();
      }, 700); // This matches our transition duration
      
      return () => clearTimeout(exitTimer);
    }, 5000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [onButtonClick]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      <div 
        className={`bg-white w-full max-w-md mx-auto rounded-t-3xl shadow-lg overflow-hidden transform transition-all duration-700 ease-out relative z-10 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        } ${isExiting ? 'translate-y-full' : ''}`}
        style={{marginBottom: 0, paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0rem))"}}
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
                <span className="text-white text-sm">
                  {verificationData?.matched ? 'Known Identity' : 'Verified'}
                </span>
              </div>
              
              <div className="text-white text-sm">
                {verificationData ? `${Math.round(verificationData.confidence * 100)}% match` : '1% match'}
              </div>
            </div>
            
            {/* Face match notification */}
            {verificationData?.matched && (
              <div className="flex items-center bg-[#4caf50]/20 rounded-lg p-2 text-sm text-white">
                <svg className="w-5 h-5 text-[#4caf50] mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>
                  Your face matched with an existing record in our secure database
                  {verificationData.face_id && 
                    <span className="block text-xs opacity-70">ID: {verificationData.face_id.substring(0, 8)}...</span>
                  }
                </span>
              </div>
            )}
            
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
            
            {/* Blockchain Verification Data */}
            {verificationData?.blockchain_data && verificationData.blockchain_data.verified && (
              <div className="mt-2 bg-[#4caf50]/10 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-[#4caf50] mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span className="text-white/90 text-sm font-medium">Blockchain Verification</span>
                </div>
                
                <div className="text-white/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-medium capitalize">{verificationData.blockchain_data.metadata?.verificationMethod || 'Biometric'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Timestamp:</span>
                    <span className="font-medium">
                      {verificationData.blockchain_data.metadata?.verificationTimestamp ? 
                        new Date(verificationData.blockchain_data.metadata.verificationTimestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Just now'}
                    </span>
                  </div>
                  
                  {verificationData.blockchain_data.metadata?.blockchainInfo && (
                    <>
                      <div className="flex justify-between">
                        <span>Chain ID:</span>
                        <span className="font-medium">{verificationData.blockchain_data.metadata.blockchainInfo.chainId}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Token ID:</span>
                        <span className="font-medium">
                          {verificationData.blockchain_data.metadata.blockchainInfo.tokenId.substring(0, 8)}...
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-3">
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
            {verificationData?.matched ? 
              <>Welcome back to <span className="font-medium">Heirloom</span>!</> : 
              <>Welcome to <span className="font-medium">Heirloom</span>!</>
            }<br />
            {verificationData?.matched ? 
              'Your identity has been verified with an existing record.' : 
              message
            }
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
