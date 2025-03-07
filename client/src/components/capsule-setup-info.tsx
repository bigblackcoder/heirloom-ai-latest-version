import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface CapsuleSetupInfoProps {
  variant?: "simple" | "detailed";
}

export default function CapsuleSetupInfo({ variant = "detailed" }: CapsuleSetupInfoProps) {
  const [showMore, setShowMore] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  
  // Simple variant with just bullet points
  if (variant === "simple") {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Identity Capsule Setup</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8ccc5c]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-[#8ccc5c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Identity Storage</h3>
              <p className="text-sm text-gray-600">Your capsule securely stores verified identity attributes that you control.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4a166]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-[#d4a166]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Selective Disclosure</h3>
              <p className="text-sm text-gray-600">Share only what you want with AI services, without revealing your entire identity.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8ccc5c]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-[#8ccc5c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
                <path d="M9 18a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9.5L20 9.5V16a2 2 0 0 1-2 2h-2a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Permission Management</h3>
              <p className="text-sm text-gray-600">Easily grant and revoke AI access permissions to your verified data.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4a166]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-[#d4a166]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Activity Monitoring</h3>
              <p className="text-sm text-gray-600">Keep track of how your data is being used by connected services.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="w-full bg-[#8ccc5c] hover:bg-[#7cb34e] text-[#1e3c0d] font-medium py-3 rounded-full transition-colors">
            Set Up Your Identity Capsule
          </button>
        </div>
      </div>
    );
  }
  
  // Detailed variant with progress bars
  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-[#e6efe6] rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>Identity Capsule</h2>
              <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Secure and private identity storage</p>
            </div>
          </div>
          
          <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 mb-4`}>
            <p>Your Identity Capsule securely stores your verified identity data while keeping you in control.</p>
          </div>
          
          {showMore && (
            <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 mb-4 space-y-2`}>
              <p>Key features:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>End-to-end encryption</li>
                <li>Selective disclosure</li>
                <li>Biometric protection</li>
                <li>Cross-device availability</li>
              </ul>
            </div>
          )}
          
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={toggleShowMore}
            className="w-full text-[#1e3c0d] border-[#1e3c0d]"
          >
            {showMore ? "Show Less" : "Learn More"}
          </Button>
        </div>
        
        <div className="bg-[#f8faf8] border-t border-gray-100 p-4 sm:p-6">
          <h3 className={`font-medium mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>Setup Progress</h3>
          
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Biometric Verification</span>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-[#1e3c0d] font-medium`}>Complete</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full">
                <div className="h-full bg-[#1e3c0d] rounded-full w-full"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Identity Creation</span>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-[#1e3c0d] font-medium`}>Complete</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full">
                <div className="h-full bg-[#1e3c0d] rounded-full w-full"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Data Protection Setup</span>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-yellow-600 font-medium`}>In Progress</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full">
                <div className="h-full bg-yellow-500 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
          
          <Button
            size={isMobile ? "sm" : "default"}
            className="w-full bg-[#1e3c0d] hover:bg-[#2a5414]"
          >
            Continue Setup
          </Button>
        </div>
      </div>
    </div>
  );
}
