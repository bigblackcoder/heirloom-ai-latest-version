import { useLocation } from "wouter";
import { formatTime } from "@/lib/identity";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  IoShieldCheckmarkSharp,
  IoDocumentTextSharp,
  IoWarningSharp,
  IoCheckmarkCircleSharp
} from "react-icons/io5";
import { SiProbot } from "react-icons/si";

interface Activity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
  title?: string;
  time?: string;
  icon?: React.ReactNode;
  iconBg?: string;
}

interface ActivityFeedProps {
  today: Activity[];
  yesterday: Activity[];
  older: Activity[];
  isLoading: boolean;
}

export default function ActivityFeed({ today, yesterday, older, isLoading }: ActivityFeedProps) {
  const [_, navigate] = useLocation();
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3c0d]"></div>
      </div>
    );
  }
  
  if ((!today || today.length === 0) && 
      (!yesterday || yesterday.length === 0) && 
      (!older || older.length === 0)) {
    // If no real data is available, show mock data in a horizontal scrolling feed
    return <ActivityFeedHorizontal />;
  }
  
  // Detailed activity feed with sections for today, yesterday, and older
  const renderActivity = (activity: Activity) => {
    return (
      <div 
        key={activity.id} 
        className="flex items-start py-3 border-b border-gray-100 last:border-0"
      >
        <div className={`rounded-full bg-[#e6efe6] p-2 mr-3 ${isMobile ? 'mt-0.5' : 'mt-0'}`}>
          {activity.type === 'verification' ? (
            <IoShieldCheckmarkSharp className="w-5 h-5 text-[#1e3c0d]" />
          ) : activity.type === 'login' ? (
            <IoCheckmarkCircleSharp className="w-5 h-5 text-[#1e3c0d]" />
          ) : (
            <IoDocumentTextSharp className="w-5 h-5 text-[#1e3c0d]" />
          )}
        </div>
        <div className="flex-1">
          <p className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>{activity.title || activity.type}</p>
          <p className={`text-gray-500 ${isMobile ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>{activity.description}</p>
        </div>
        <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} ml-3`}>
          {activity.time || formatTime(activity.createdAt)}
        </div>
      </div>
    );
  };
  
  return (
    <div className="px-4 sm:px-6 py-2">
      {today?.length > 0 && (
        <div className="mb-4">
          <h3 className={`text-gray-400 font-medium mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Today</h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {today.map(renderActivity)}
          </div>
        </div>
      )}
      
      {yesterday?.length > 0 && (
        <div className="mb-4">
          <h3 className={`text-gray-400 font-medium mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Yesterday</h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {yesterday.map(renderActivity)}
          </div>
        </div>
      )}
      
      {older?.length > 0 && (
        <div>
          <h3 className={`text-gray-400 font-medium mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Earlier</h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {older.map(renderActivity)}
          </div>
        </div>
      )}
    </div>
  );
}

// Horizontal scrolling version used for dashboard preview
function ActivityFeedHorizontal() {
  const [_, navigate] = useLocation();
  
  // Mock activity data for the scrollable design
  const activities = [
    {
      type: "identity_verified",
      title: "Identity Verified",
      description: "Your identity has been successfully verified through biometric scan.",
      time: "Today, 10:32 AM",
      icon: (
        <IoShieldCheckmarkSharp className="w-5 h-5 text-[#d4a166]" />
      ),
      iconBg: "bg-[#d4a166]/10"
    },
    {
      type: "ai_connected",
      title: "Claude AI Connected",
      description: "Claude AI now has limited access to your identity information.",
      time: "Today, 11:45 AM",
      icon: (
        <SiProbot className="w-5 h-5 text-[#4caf50]" />
      ),
      iconBg: "bg-[#4caf50]/10"
    },
    {
      type: "data_added",
      title: "New Data Added",
      description: "Your driver's license has been added to your identity capsule.",
      time: "Yesterday, 4:15 PM",
      icon: (
        <IoDocumentTextSharp className="w-5 h-5 text-[#2196f3]" />
      ),
      iconBg: "bg-[#2196f3]/10"
    },
    {
      type: "login_attempt",
      title: "Login Attempt",
      description: "Unusual login attempt detected from a new location.",
      time: "3 days ago",
      icon: (
        <IoWarningSharp className="w-5 h-5 text-[#f44336]" />
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
