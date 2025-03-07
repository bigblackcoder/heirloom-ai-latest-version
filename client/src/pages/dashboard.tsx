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

export default function Dashboard() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);

  // Get current user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Get user's identity capsules
  const { data: capsules, isLoading: capsulesLoading } = useQuery({
    queryKey: ["/api/capsules"],
  });

  // Get user's AI connections
  const { data: connections, isLoading: connectionsLoading } = useQuery({
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
      llms: connections?.filter(c => c.isActive).length || 0,
      agents: 7, // Mock data
      verifiedAssets: 5 // Mock data
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 text-[#1e3c0d]">
              {/* Heirloom Logo (H) */}
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M5 3V21M19 3V21M5 12H19" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold">
                {getGreeting()}, {userData?.firstName || "User"}
              </h1>
              <p className="text-xs text-gray-500">Connecting You Safely to AI</p>
            </div>
          </div>
          <button 
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
            onClick={handleNotificationsClick}
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
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
        </div>
      </header>

      {/* Identity Capsule Card */}
      <IdentityCapsuleCard 
        userName={`${userData?.firstName || ""} ${userData?.lastName || ""}`}
        memberSince={userData?.memberSince ? new Date(userData.memberSince).getFullYear() : new Date().getFullYear()}
        aiConnections={`${stats.llms} LLMs | ${stats.agents} Agents`}
        verifiedData={`${stats.verifiedAssets} Assets`}
        isVerified={userData?.isVerified || false}
        avatar={userData?.avatar}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Active Connections */}
      <ActiveConnections 
        connections={connections || []}
        isLoading={connectionsLoading}
      />

      {/* Connection History Section */}
      <div className="mt-4 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium">Connection History</h2>
          <button 
            className="text-sm text-[#1e3c0d]"
            onClick={() => navigate("/notifications")}
          >
            View all
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar currentPath="/dashboard" />

      {/* Success Modal */}
      {showVerificationSuccess && (
        <SuccessModal 
          title="Nice! Your account is Verified!" 
          message="Welcome to Heirloom! You've successfully verified your humanness, and we're excited to have you!"
          buttonText="Get started!"
          onButtonClick={() => setShowVerificationSuccess(false)}
        />
      )}
    </div>
  );
}
