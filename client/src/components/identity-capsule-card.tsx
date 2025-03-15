import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Using a direct path to the white version of the logo
const logoHeirloom = "/heirloom_white.png";

interface IdentityCapsuleCardProps {
  userName: string;
  memberSince: number;
  aiConnections: string;
  verifiedData: string;
  isVerified: boolean;
  avatar?: string;
}

export default function IdentityCapsuleCard({
  userName,
  memberSince,
  aiConnections,
  verifiedData,
  isVerified,
  avatar
}: IdentityCapsuleCardProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const handleAddData = () => {
    navigate("/capsule");
  };

  const handleMoreOptions = () => {
    toast({
      title: "More Options",
      description: "Additional options for your identity capsule.",
    });
  };

  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=user";

  return (
    <div className="mx-4 mb-4 p-5 rounded-3xl bg-[#1e3c0d] text-white shadow-lg">
      {/* Security status indicator */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-[#4caf50] rounded-full mr-2"></div>
          <span className="text-xs text-white/70">Secure | 2FA Enabled</span>
        </div>
        <svg
          className="w-5 h-5 text-white/70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      
      {/* Logo and header */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-white/70 text-xs">Identity Capsule Snapshot</p>
        <img 
          src={logoHeirloom} 
          alt="Heirloom Logo" 
          className="h-10 w-auto opacity-90"
        />
      </div>
      
      {/* User profile section */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden mr-3">
          <img
            src={avatar || defaultAvatar}
            alt={userName}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium text-lg">{userName}</h3>
          <p className="text-xs text-white/60">Member Since {memberSince}</p>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="flex justify-between mb-5">
        <div>
          <h4 className="text-white text-sm mb-0.5">AI Connections:</h4>
          <p className="text-[#4caf50] font-medium">{aiConnections}</p>
        </div>
        <div>
          <h4 className="text-white text-sm mb-0.5">Verified Data:</h4>
          <p className="text-[#4caf50] font-medium">{verifiedData}</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <Button 
          className={`py-2 px-5 rounded-full flex items-center justify-center ${
            isVerified 
              ? "bg-[#2a5414] text-[#4caf50] hover:bg-[#2a5414]/80" 
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          disabled={!isVerified}
          onClick={() => navigate("/verification")}
        >
          <svg
            className="w-4 h-4 mr-1.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isVerified ? (
              <path d="M20 6 9 17l-5-5" />
            ) : (
              <path d="M18 6 7 17l-5-5" />
            )}
          </svg>
          <span>{isVerified ? "Verified" : "Verify"}</span>
        </Button>
        
        <Button 
          className="py-2 px-5 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
          onClick={handleAddData}
        >
          <svg
            className="w-4 h-4 mr-1.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Add Data</span>
        </Button>
        
        <Button 
          className="w-10 h-10 rounded-full bg-[#d4a166] hover:bg-[#d4a166]/80 flex items-center justify-center"
          onClick={handleMoreOptions}
          variant="ghost"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="19" cy="12" r="1" fill="currentColor" />
            <circle cx="5" cy="12" r="1" fill="currentColor" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
