import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getGreeting } from "@/lib/identity";
import { apiRequest } from "@/lib/queryClient";
import IdentityCapsuleCard from "@/components/identity-capsule-card";
import QuickActions from "@/components/quick-actions";
import ActiveConnections from "@/components/active-connections";
import NavigationBar from "@/components/navigation-bar";
import SuccessModal from "@/components/success-modal";

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

  // Show verification success modal if the user just verified
  useEffect(() => {
    const justVerified = sessionStorage.getItem("justVerified");
    if (justVerified === "true") {
      setShowVerificationSuccess(true);
      sessionStorage.removeItem("justVerified");

      // Hide modal after a delay
      setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 3000);
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
            <div className="w-10 h-10 rounded-xl bg-[#d4a166] flex items-center justify-center shadow mr-3">
              <svg
                className="w-6 h-6 text-white"
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
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-900">Active Connections</h2>
          <button className="text-sm text-[#1e3c0d] font-medium">
            Manage
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 15.5v.01" />
                  <path d="M12 12v.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Claude AI</h3>
                <p className="text-xs text-gray-500">Connected • Last used 2h ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#4caf50] rounded-full mr-2"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 20A7 7 0 0 1 9.8 8.8M22 16.5l-3.5.7-2.8 2.2" />
                  <path d="M2 16.5l3.5.7 2.8 2.2" />
                  <path d="M9 6.8 7 9.2l-3.4.7" />
                  <path d="M15 6.8l2 2.4 3.4.7" />
                  <path d="M12 8v16" />
                  <path d="M6 2h12" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">OpenAI ChatGPT</h3>
                <p className="text-xs text-gray-500">Connected • Last used 1d ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#4caf50] rounded-full mr-2"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 mt-6 mb-24">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <button 
            className="text-sm text-[#1e3c0d] font-medium"
            onClick={() => navigate("/notifications")}
          >
            View all
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-[#d4a166]/10 flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-[#d4a166]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium">Identity Verified</h3>
              <p className="text-xs text-gray-600 mt-0.5">Your identity has been successfully verified through biometric scan.</p>
              <p className="text-xs text-gray-400 mt-1">Today, 10:32 AM</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-[#4caf50]/10 flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-[#4caf50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium">Claude AI Connected</h3>
              <p className="text-xs text-gray-600 mt-0.5">Claude AI now has limited access to your identity information.</p>
              <p className="text-xs text-gray-400 mt-1">Today, 11:45 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar currentPath="/dashboard" />

      {/* Success Modal */}
      {showVerificationSuccess && (
        <SuccessModal 
          title="Verification Successful!" 
          message="Your identity has been securely verified. Welcome to the Heirloom ecosystem."
          buttonText="Continue to Dashboard"
          onButtonClick={() => setShowVerificationSuccess(false)}
        />
      )}
    </div>
  );
}
