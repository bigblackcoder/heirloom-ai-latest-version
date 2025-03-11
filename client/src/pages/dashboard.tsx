import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { getGreeting } from "../lib/identity";
import { apiRequest } from "../lib/queryClient";
import IdentityCapsuleCard from "../components/identity-capsule-card";
import QuickActions from "../components/quick-actions";
import ActiveConnections from "../components/active-connections";
import ActivityFeed from "../components/activity-feed";
import NavigationBar from "../components/navigation-bar";
import VerificationSuccessPopup from "../components/verification-success-popup";
import CapsuleSetupPopup from "../components/capsule-setup-popup";
import { HeirloomLogo } from "../components/heirloom-logo";

// Define types for our API responses
interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  memberSince: string;
  isVerified: boolean;
  avatar?: string;
}

interface Connection {
  id: number;
  userId: number;
  aiServiceName: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface Capsule {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
}

export default function Dashboard() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [showCapsuleSetupPopup, setShowCapsuleSetupPopup] = useState(false);

  // Get current user data
  const { data: userData, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  // Get user's identity capsules
  const { data: capsules, isLoading: capsulesLoading } = useQuery<Capsule[]>({
    queryKey: ["/api/capsules"],
  });

  // Get user's AI connections
  const { data: connections, isLoading: connectionsLoading } = useQuery<Connection[]>({
    queryKey: ["/api/connections"],
  });

  // Handle notification button click
  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  // Show verification success popup if the user just verified
  useEffect(() => {
    const justVerified = sessionStorage.getItem("justVerified");
    if (justVerified === "true") {
      setShowVerificationSuccess(true);
      sessionStorage.removeItem("justVerified");
      
      // Show capsule setup notification after verification success closes
      setTimeout(() => {
        setShowCapsuleSetupPopup(true);
      }, 6000); // 6 seconds (5s display + 1s transition)
    }
  }, []);

  // Calculate stats for the identity capsule card
  const getStats = () => {
    return {
      llms: connections ? connections.filter((c: Connection) => c.isActive).length : 0,
      agents: 7, // Mock data
      verifiedAssets: 5 // Mock data
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Status bar area */}
      <div className="w-full px-4 pt-6 pb-2 flex items-center bg-white">
        <div className="text-sm text-gray-500">9:41</div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none">
            <path d="M18 10a6 6 0 0 0-12 0v7h12v-7z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 2a2 2 0 1 0 4 0v1a2 2 0 1 0-4 0v-1z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7Z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="px-5 pt-6 pb-4 bg-white border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-[#8ccc5c] flex items-center justify-center shadow mr-3">
              <HeirloomLogo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {getGreeting()}, {userData?.firstName || "User"}
              </h1>
              <p className="text-xs text-gray-500">Your Identity Platform</p>
            </div>
          </div>
          
          <button 
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center relative"
            onClick={handleNotificationsClick}
          >
            <svg
              className="w-5 h-5 text-gray-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </header>

      {/* Identity Capsule Card */}
      <IdentityCapsuleCard 
        userName={`${userData?.firstName || "Leslie"} ${userData?.lastName || "Alexander"}`}
        memberSince={userData?.memberSince ? new Date(userData.memberSince).getFullYear() : 2024}
        aiConnections={`${stats.llms} LLMs | ${stats.agents} Agents`}
        verifiedData={`${stats.verifiedAssets} Assets`}
        isVerified={userData?.isVerified || true}
        avatar={userData?.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Active Connections */}
      <ActiveConnections 
        connections={connections || []} 
        isLoading={connectionsLoading} 
      />

      {/* Recent Activity */}
      <ActivityFeed 
        today={[]} 
        yesterday={[]} 
        older={[]} 
        isLoading={false} 
      />

      {/* Test buttons - Remove in production */}
      <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-2">
        <button 
          className="bg-[#8ccc5c] text-white text-xs py-2 px-3 rounded-full shadow-lg"
          onClick={() => {
            setShowVerificationSuccess(true);
            
            // Show capsule setup after verification success closes
            setTimeout(() => {
              setShowCapsuleSetupPopup(true);
            }, 6000); // 6 seconds (5s display + 1s transition)
          }}
        >
          Test Popups
        </button>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar currentPath="/dashboard" />

      {/* Verification Success Popup */}
      <VerificationSuccessPopup 
        isOpen={showVerificationSuccess}
        onClose={() => setShowVerificationSuccess(false)}
      />

      {/* Capsule Setup Popup */}
      <CapsuleSetupPopup 
        isOpen={showCapsuleSetupPopup}
        onClose={() => setShowCapsuleSetupPopup(false)}
      />
    </div>
  );
}
