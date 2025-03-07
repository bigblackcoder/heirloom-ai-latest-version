import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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
  // Helper to get the icon for each activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "connection-revoked":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-500",
          icon: (
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
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" />
              <path d="M13 2v7h7" />
              <path d="m22 17-5-5M17 17l5-5" />
            </svg>
          )
        };
      case "ai-connected":
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-500",
          icon: (
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
              <path d="M14 13a7 7 0 0 0-9.9-9.9" />
              <path d="M7 11a7 7 0 0 1 9.9 9.9" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
            </svg>
          )
        };
      case "data-added":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-500",
          icon: (
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M12 18v-6" />
              <path d="M9 15h6" />
            </svg>
          )
        };
      case "identity-verified":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-500",
          icon: (
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-500",
          icon: (
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          )
        };
    }
  };

  // Format the time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  // Render an activity item
  const renderActivity = (activity: Activity) => {
    const { bgColor, textColor, icon } = getActivityIcon(activity.type);
    
    return (
      <div key={activity.id} className="flex items-start mb-4">
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center mr-3`}>
          <span className={textColor}>{icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-medium capitalize">
              {activity.type.replace(/-/g, " ")}
            </h4>
            <span className="text-xs text-gray-500">{formatTime(activity.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-600">{activity.description}</p>
        </div>
      </div>
    );
  };

  // Render skeleton loader
  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-start mb-4">
        <Skeleton className="w-10 h-10 rounded-full mr-3" />
        <div className="flex-1">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
        </div>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="px-4 mt-4">
        <h3 className="text-sm text-gray-500 mb-2">Today</h3>
        {renderSkeletons(3)}
        <h3 className="text-sm text-gray-500 mt-6 mb-2">Yesterday</h3>
        {renderSkeletons(2)}
      </div>
    );
  }

  return (
    <div className="px-4 mt-4">
      {today.length > 0 && (
        <>
          <h3 className="text-sm text-gray-500 mb-2">Today</h3>
          {today.map(renderActivity)}
        </>
      )}
      
      {yesterday.length > 0 && (
        <>
          <h3 className="text-sm text-gray-500 mt-6 mb-2">Yesterday</h3>
          {yesterday.map(renderActivity)}
        </>
      )}
      
      {older.length > 0 && (
        <>
          <h3 className="text-sm text-gray-500 mt-6 mb-2">Earlier</h3>
          {older.map(renderActivity)}
        </>
      )}
      
      {today.length === 0 && yesterday.length === 0 && older.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>No activity recorded yet.</p>
          <p className="text-sm mt-2">Start adding data or connecting with AI services.</p>
        </div>
      )}
    </div>
  );
}
