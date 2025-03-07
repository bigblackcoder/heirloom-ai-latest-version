import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ActivityFeed from "@/components/activity-feed";
import NavigationBar from "@/components/navigation-bar";

export default function Notifications() {
  const [_, navigate] = useLocation();
  
  // State for tab selection
  const [activeTab, setActiveTab] = useState<"activity" | "updates" | "tips">("activity");
  
  // Fetch activities
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities"],
  });
  
  const handleTabChange = (tab: "activity" | "updates" | "tips") => {
    setActiveTab(tab);
  };
  
  const handleBackClick = () => {
    navigate("/dashboard");
  };
  
  const handleSettingsClick = () => {
    // Handle settings click
  };

  // Group activities by date
  const groupActivitiesByDate = (activities: any[] = []) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const grouped = {
      today: [],
      yesterday: [],
      older: []
    };
    
    activities.forEach(activity => {
      const date = new Date(activity.createdAt).toDateString();
      
      if (date === today) {
        grouped.today.push(activity);
      } else if (date === yesterday) {
        grouped.yesterday.push(activity);
      } else {
        grouped.older.push(activity);
      }
    });
    
    return grouped;
  };
  
  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center">
        <button 
          onClick={handleBackClick}
          className="mr-4"
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Identity Capsule</h1>
        <div className="ml-auto">
          <button onClick={handleSettingsClick}>
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="flex border-b px-4">
        <button 
          className={`px-6 py-2 ${activeTab === "activity" ? "border-b-2 border-[#1e3c0d] text-[#1e3c0d] font-medium" : "text-gray-500"}`}
          onClick={() => handleTabChange("activity")}
        >
          Activity
        </button>
        <button 
          className={`px-6 py-2 ${activeTab === "updates" ? "border-b-2 border-[#1e3c0d] text-[#1e3c0d] font-medium" : "text-gray-500"}`}
          onClick={() => handleTabChange("updates")}
        >
          Updates
        </button>
        <button 
          className={`px-6 py-2 ${activeTab === "tips" ? "border-b-2 border-[#1e3c0d] text-[#1e3c0d] font-medium" : "text-gray-500"}`}
          onClick={() => handleTabChange("tips")}
        >
          Tips
        </button>
      </div>
      
      {/* Activity Feed */}
      {activeTab === "activity" && (
        <ActivityFeed 
          today={groupedActivities.today} 
          yesterday={groupedActivities.yesterday}
          older={groupedActivities.older}
          isLoading={isLoading}
        />
      )}
      
      {/* Updates Tab Content */}
      {activeTab === "updates" && (
        <div className="px-6 py-8 text-center text-gray-500">
          <p>No updates available at this time.</p>
        </div>
      )}
      
      {/* Tips Tab Content */}
      {activeTab === "tips" && (
        <div className="px-6 py-8 text-center text-gray-500">
          <p>Tips and best practices coming soon.</p>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <NavigationBar currentPath="/notifications" />
    </div>
  );
}
