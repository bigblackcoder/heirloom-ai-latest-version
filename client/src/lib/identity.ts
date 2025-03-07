// Get personalized greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good Morning";
  } else if (hour < 18) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

// Format time for display
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const pastDate = new Date(date);
  const diffMs = now.getTime() - pastDate.getTime();
  
  // Convert to seconds/minutes/hours
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return "moments ago";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    // Format as time if today, otherwise as date
    return pastDate.toLocaleString();
  }
}

// Format time in 12-hour format with AM/PM
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Activity type icons and colors map
export const activityTypeMap = {
  "identity-verified": {
    icon: "person",
    bgColor: "bg-green-100",
    textColor: "text-green-500"
  },
  "connection-revoked": {
    icon: "bolt",
    bgColor: "bg-red-100",
    textColor: "text-red-500"
  },
  "ai-connected": {
    icon: "sync",
    bgColor: "bg-blue-100",
    textColor: "text-blue-500"
  },
  "data-added": {
    icon: "check_circle",
    bgColor: "bg-green-100",
    textColor: "text-green-500"
  },
  "account-created": {
    icon: "person_add",
    bgColor: "bg-blue-100",
    textColor: "text-blue-500"
  },
  "verification-failed": {
    icon: "error",
    bgColor: "bg-red-100",
    textColor: "text-red-500"
  }
};

// Generic function to format complex data
export function formatVerifiedData(dataType: string, value: string): string {
  switch (dataType) {
    case "employment":
      return `Employment at ${value}`;
    case "income":
      return `Income verification`;
    case "education":
      return `Education at ${value}`;
    case "identity":
      return `Government ID verification`;
    default:
      return `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data`;
  }
}
