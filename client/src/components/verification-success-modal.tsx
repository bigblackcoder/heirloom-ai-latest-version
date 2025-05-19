import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Check, Shield } from "lucide-react";
import { SlidingModal } from "@/components/ui/sliding-modal";
// Define the interface for face verification result data display
export interface FaceVerificationResult {
  success?: boolean;
  confidence?: number;
  message?: string;
  matched?: boolean;
  face_id?: string;
  timestamp?: string;
  method?: string;
  status?: string;
  confidenceScore?: string;
  results?: {
    age?: number;
    gender?: string | Record<string, number>;
    dominant_race?: string;
    dominant_emotion?: string;
  };
  details?: string;
}

interface VerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationData?: FaceVerificationResult;
}

export default function VerificationSuccessModal({
  isOpen,
  onClose,
  verificationData
}: VerificationSuccessModalProps) {
  const [_, navigate] = useLocation();
  // Handle both direct confidence number or string format
  let confidencePercent = 98; // Default fallback
  
  if (verificationData) {
    if (verificationData.confidence !== undefined) {
      // Handle numeric confidence (0-1)
      confidencePercent = Math.round(verificationData.confidence * 100);
    } else if (verificationData.confidenceScore) {
      // Handle string format like "98%"
      confidencePercent = parseInt(verificationData.confidenceScore.replace('%', ''));
    }
  }
  
  return (
    <SlidingModal
      isOpen={isOpen}
      onClose={onClose}
      direction="bottom"
      showCloseButton={false}
      duration={500}
      containerClassName="max-w-md mx-auto"
    >
      <div className="p-6 pt-2">
        <h2 className="text-xl font-bold mb-4 text-center">Identity Verified</h2>
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <p className="text-center text-gray-600 mb-6">
          Your identity has been successfully verified and securely stored in your identity capsule.
        </p>
        
        {verificationData && (
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium">Verification Confidence</span>
              </div>
              <span className="text-sm font-bold text-green-600">{confidencePercent}%</span>
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
                    <span className="text-sm font-medium">
                      {typeof verificationData.results.gender === 'string' 
                        ? verificationData.results.gender 
                        : Object.keys(verificationData.results.gender)[0]}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <button 
          className="w-full bg-[#273414] hover:bg-[#324319] text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm"
          onClick={() => {
            onClose();
            navigate("/dashboard");
          }}
        >
          Continue to Dashboard
        </button>
        
        {/* Bottom indicator - Note: SlidingModal already has this */}
      </div>
    </SlidingModal>
  );
}