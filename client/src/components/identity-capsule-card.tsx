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
  theme?: 'light' | 'dark';
}

export default function IdentityCapsuleCard({
  userName,
  memberSince,
  aiConnections,
  verifiedData,
  isVerified,
  avatar,
  theme = 'light'
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
  
  // Theme-specific styles
  const cardStyle = theme === 'light' 
    ? "bg-white text-gray-800 border border-gray-200" 
    : "bg-white text-gray-800";
  
  const verifiedBadgeStyle = theme === 'light'
    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
    : "bg-[#f7f9f7] text-gray-700 hover:bg-[#f7f9f7]/90";
  
  const actionBtnStyle = theme === 'light'
    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
    : "bg-[#f7f9f7] text-gray-700 hover:bg-[#f7f9f7]/90";
  
  const moreOptionsStyle = theme === 'light'
    ? "bg-gray-800 text-white hover:bg-gray-700"
    : "bg-[#273b37] text-white hover:bg-[#273b37]/90";
  
  const securityTextStyle = theme === 'light'
    ? "text-gray-500"
    : "text-gray-500";
  
  const subtitleStyle = theme === 'light'
    ? "text-gray-500"
    : "text-gray-500";
  
  const memberSinceStyle = theme === 'light'
    ? "text-gray-400"
    : "text-gray-400";
  
  const statsHeaderStyle = theme === 'light'
    ? "text-gray-700"
    : "text-gray-700";
  
  const statsValueStyle = theme === 'light'
    ? "text-gray-900 font-medium"
    : "text-gray-900 font-medium";

  return (
    <div className={`mx-4 mb-4 p-5 rounded-3xl shadow-lg ${cardStyle}`}>
      {/* Security status indicator */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className={`text-xs ${securityTextStyle}`}>Secure | 2FA Enabled</span>
        </div>
        <svg
          className={`w-5 h-5 ${securityTextStyle}`}
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
      
      <p className={`text-xs mb-2 ${subtitleStyle}`}>Identity Capsule Snapshot</p>
      
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
          <p className={`text-xs ${memberSinceStyle}`}>Member Since {memberSince}</p>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="flex justify-between mb-5">
        <div>
          <h4 className={`text-sm mb-0.5 ${statsHeaderStyle}`}>AI Connections:</h4>
          <p className={statsValueStyle}>{aiConnections}</p>
        </div>
        <div>
          <h4 className={`text-sm mb-0.5 ${statsHeaderStyle}`}>Verified Data:</h4>
          <p className={statsValueStyle}>{verifiedData}</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <Button 
          className={`py-2 px-5 rounded-full flex items-center justify-center ${
            isVerified ? verifiedBadgeStyle : actionBtnStyle
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
          className={`py-2 px-5 rounded-full flex items-center justify-center ${actionBtnStyle}`}
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
          className={`w-10 h-10 rounded-full flex items-center justify-center ${moreOptionsStyle}`}
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
