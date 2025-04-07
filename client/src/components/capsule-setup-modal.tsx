import { useState } from "react";
import { useLocation } from "wouter";
import { Box, LockKeyhole } from "lucide-react";
import { SlidingModal } from "@/components/ui/sliding-modal";

interface CapsuleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CapsuleSetupModal({
  isOpen,
  onClose
}: CapsuleSetupModalProps) {
  const [_, navigate] = useLocation();
  
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
        <h2 className="text-xl font-bold mb-4 text-center">Identity Capsule</h2>
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
            <Box className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        
        <p className="text-center text-gray-600 mb-3">
          Your identity has been verified! Now you can set up your Identity Capsule.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-xl mb-6">
          <h3 className="font-medium mb-2 flex items-center">
            <LockKeyhole className="w-4 h-4 mr-2 text-gray-700" />
            Your Secure Identity Vault
          </h3>
          <p className="text-sm text-gray-600">
            Your Identity Capsule stores your verified credentials and allows you to choose what to share with AI services.
          </p>
        </div>
        
        <ul className="space-y-3 mb-6">
          <li className="flex items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
              <span className="text-green-600 text-xs font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">Store Verified Data</h4>
              <p className="text-xs text-gray-500">Add verified identity information to your capsule</p>
            </div>
          </li>
          
          <li className="flex items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
              <span className="text-green-600 text-xs font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">Control Access</h4>
              <p className="text-xs text-gray-500">Choose which AI services can access your identity</p>
            </div>
          </li>
          
          <li className="flex items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
              <span className="text-green-600 text-xs font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">Monitor Usage</h4>
              <p className="text-xs text-gray-500">View when your identity is used with connected services</p>
            </div>
          </li>
        </ul>
        
        <button 
          className="w-full bg-[#273414] hover:bg-[#324319] text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm"
          onClick={() => {
            onClose();
            navigate("/capsule");
          }}
        >
          Set Up My Identity Capsule
        </button>
      </div>
    </SlidingModal>
  );
}