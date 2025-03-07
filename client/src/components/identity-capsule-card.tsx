import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    <div className="mx-4 p-4 rounded-xl bg-[#1e3c0d] text-white">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center px-3 py-1 bg-[#2a5414] rounded-full text-xs">
          <span className="w-2 h-2 bg-[#4caf50] rounded-full mr-2"></span>
          <span>Secure | 2FA Enabled</span>
        </div>
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      
      <p className="text-white/60 text-sm mb-2">Identity Capsule Snapshot</p>
      
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden mr-3">
          <img
            src={avatar || defaultAvatar}
            alt={userName}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium">{userName}</h3>
          <p className="text-xs text-white/60">Member Since {memberSince}</p>
        </div>
      </div>
      
      <div className="flex justify-between mb-4">
        <div>
          <p className="text-white/60 text-sm">AI Connections:</p>
          <p className="text-[#4caf50]">{aiConnections}</p>
        </div>
        <div>
          <p className="text-white/60 text-sm">Verified Data:</p>
          <p className="text-white">{verifiedData}</p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          className={`flex-1 py-2 px-4 rounded-full mr-2 flex items-center justify-center ${
            isVerified 
              ? "bg-[#2a5414] text-[#4caf50]" 
              : "bg-white/10 text-white"
          }`}
          disabled={!isVerified}
          onClick={() => navigate("/verification")}
        >
          <svg
            className="w-4 h-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
          className="flex-1 py-2 px-4 rounded-full bg-white/10 text-white mr-2 flex items-center justify-center"
          onClick={handleAddData}
        >
          <svg
            className="w-4 h-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
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
          className="w-10 h-10 rounded-full bg-[#f0b73e] flex items-center justify-center"
          onClick={handleMoreOptions}
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
