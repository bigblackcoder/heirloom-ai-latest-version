import { useLocation } from "wouter";
import { formatTime } from "@/lib/identity";

interface Activity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
}

interface ActivityFeedProps {
  today: Activity[];
  yesterday: Activity[];
  older: Activity[];
  isLoading: boolean;
}

export default function ActivityFeed({ today, yesterday, older, isLoading }: ActivityFeedProps) {
  const [_, navigate] = useLocation();
  
  // Mock activity data for the scrollable design
  const activities = [
    {
      type: "identity_verified",
      title: "Identity Verified",
      description: "Your identity has been successfully verified through biometric scan.",
      time: "Today, 10:32 AM",
      icon: (
        <svg className="w-5 h-5 text-[#d4a166]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      iconBg: "bg-[#d4a166]/10"
    },
    {
      type: "ai_connected",
      title: "Claude AI Connected",
      description: "Claude AI now has limited access to your identity information.",
      time: "Today, 11:45 AM",
      icon: (
        <svg className="w-5 h-5 text-[#4caf50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
        </svg>
      ),
      iconBg: "bg-[#4caf50]/10"
    },
    {
      type: "data_added",
      title: "New Data Added",
      description: "Your driver's license has been added to your identity capsule.",
      time: "Yesterday, 4:15 PM",
      icon: (
        <svg className="w-5 h-5 text-[#2196f3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      ),
      iconBg: "bg-[#2196f3]/10"
    },
    {
      type: "login_attempt",
      title: "Login Attempt",
      description: "Unusual login attempt detected from a new location.",
      time: "3 days ago",
      icon: (
        <svg className="w-5 h-5 text-[#f44336]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      iconBg: "bg-[#f44336]/10"
    }
  ];

  const renderActivity = (activity: any) => (
    <div className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex">
        <div className={`w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center mr-3 flex-shrink-0`}>
          {activity.icon}
        </div>
        <div>
          <h3 className="text-sm font-medium">{activity.title}</h3>
          <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 mt-6 mb-24">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-gray-900">Connection History</h2>
        <button 
          className="text-sm text-[#1e3c0d] font-medium"
          onClick={() => navigate("/notifications")}
        >
          View all
        </button>
      </div>
      
      {/* Horizontal scrolling activity feed */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-6 hide-scrollbar space-x-4">
          {activities.map((activity, index) => (
            <div key={index}>{renderActivity(activity)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}