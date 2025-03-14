import { MdAdd } from "react-icons/md";
import { SiOpenai } from "react-icons/si";
import ClaudeLogo from "@/components/ui/claude-logo";
import AnthropicLogo from "@/components/ui/anthropic-logo";
import GeminiLogo from "@/components/ui/gemini-logo";
import { useLocation } from "wouter";

interface Connection {
  id: number;
  userId: number;
  aiServiceName: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface ActiveConnectionsProps {
  connections: Connection[];
  isLoading: boolean;
}

export default function ActiveConnections({ connections, isLoading }: ActiveConnectionsProps) {
  const [_, navigate] = useLocation();
  
  // Mock connections data for scrollable design
  const connectionsList = [
    {
      name: "Add",
      icon: (
        <MdAdd className="w-6 h-6 text-[#1e3c0d]" />
      )
    },
    {
      name: "Open AI",
      icon: (
        <SiOpenai className="w-6 h-6 text-[#1e3c0d]" /> 
      )
    },
    {
      name: "Claude",
      icon: (
        <ClaudeLogo className="w-6 h-6" />
      )
    },
    {
      name: "Perple⁠xity",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.75C9.37665 21.75 6.64765 20.6205 4.6341 18.6069C2.62053 16.5934 1.49113 13.8639 1.49113 11.2406C1.49113 8.61726 2.62053 5.88826 4.6341 3.87471C6.64765 1.86115 9.37665 0.731201 12 0.731201C14.6234 0.731201 17.3523 1.86115 19.3659 3.87471C21.3795 5.88826 22.5088 8.61726 22.5088 11.2406C22.5088 13.8639 21.3795 16.5934 19.3659 18.6069C17.3523 20.6205 14.6234 21.75 12 21.75" fill="#1e3c0d"/>
          <path d="M12 0.731201C9.3766 0.731201 6.64759 1.86064 4.63403 3.8742C2.62047 5.88776 1.49103 8.61677 1.49103 11.2402C1.49103 13.8636 2.62047 16.5926 4.63403 18.6062C6.64759 20.6197 9.3766 21.7492 12 21.7492C14.6233 21.7492 17.3523 20.6197 19.3659 18.6062C21.3794 16.5926 22.5089 13.8636 22.5089 11.2402C22.5089 8.61677 21.3794 5.88776 19.3659 3.8742C17.3523 1.86064 14.6233 0.731201 12 0.731201ZM12 20.6342C9.73384 20.6342 7.36157 19.6736 5.61218 17.9542C3.83388 16.2048 2.90598 13.7925 2.90598 11.2402C2.90598 8.68789 3.83388 6.27561 5.61218 4.52622C7.36157 2.80682 9.73384 1.78032 12 1.78032C14.3023 1.78032 16.6384 2.77792 18.4138 4.52622C20.1661 6.23771 21.094 8.68789 21.094 11.2402C21.094 13.7925 20.1661 16.2048 18.4138 17.9542C16.6384 19.6736 14.3023 20.6342 12 20.6342Z" fill="#1e3c0d"/>
          <path d="M12 1.78003C14.3023 1.78003 16.6383 2.77763 18.4137 4.52593C20.166 6.23743 21.0939 8.6876 21.0939 11.2399C21.0939 13.7922 20.166 16.2045 18.4137 17.9539C16.6383 19.6733 14.3023 20.6339 12 20.6339C9.73384 20.6339 7.36157 19.6733 5.61218 17.9539C3.83388 16.2045 2.90598 13.7922 2.90598 11.2399C2.90598 8.6876 3.83388 6.2753 5.61218 4.52593C7.36157 2.80653 9.73384 1.78003 12 1.78003ZM12 3.2259C10.0644 3.2259 8.09197 3.97939 6.63921 5.33786C5.22104 6.75602 4.35178 8.91459 4.35178 11.2399C4.35178 13.5652 5.22104 15.7238 6.63921 17.1419C8.09197 18.5004 10.0644 19.2539 12 19.2539C14.072 19.2539 16.0076 18.5004 17.4608 17.1419C18.8789 15.7238 19.7482 13.5652 19.7482 11.2399C19.7482 8.91459 18.8789 6.75602 17.4608 5.33786C16.0076 3.97939 14.072 3.2259 12 3.2259Z" fill="#1e3c0d"/>
          <path d="M12 3.22577C14.072 3.22577 16.0076 3.97927 17.4608 5.33773C18.8789 6.75589 19.7482 8.91447 19.7482 11.2398C19.7482 13.5651 18.8789 15.7237 17.4608 17.1418C16.0076 18.5003 14.072 19.2538 12 19.2538C10.0644 19.2538 8.09197 18.5003 6.63921 17.1418C5.22104 15.7237 4.35178 13.5651 4.35178 11.2398C4.35178 8.91447 5.22104 6.75589 6.63921 5.33773C8.09197 3.97927 10.0644 3.22577 12 3.22577ZM12 10.9144C11.8065 10.9144 11.613 10.9901 11.4707 11.1324C11.3284 11.2747 11.2526 11.4682 11.2526 11.6618C11.2526 11.8553 11.3284 12.0488 11.4707 12.1911C11.613 12.3334 11.8065 12.4091 12 12.4091C12.1935 12.4091 12.387 12.3334 12.5293 12.1911C12.6716 12.0488 12.7474 11.8553 12.7474 11.6618C12.7474 11.4682 12.6716 11.2747 12.5293 11.1324C12.387 10.9901 12.1935 10.9144 12 10.9144Z" fill="#1e3c0d"/>
        </svg>
      )
    },
    {
      name: "Gemini",
      icon: (
        <GeminiLogo className="w-6 h-6" />
      )
    }
  ];

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-gray-900">Active Connections</h2>
        <button className="text-sm text-[#4A566B] font-medium">
          View all
        </button>
      </div>
      
      {/* Horizontal scrolling connections */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar space-x-6">
          {connectionsList.map((connection, index) => (
            <div key={index} className="flex-shrink-0 flex flex-col items-center">
              <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm`}>
                {connection.icon}
              </div>
              <span className="text-[10px] text-[#1e3c0d] font-medium">{connection.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <h2 className="text-lg font-medium text-gray-900 mt-6 mb-3">Connection History</h2>
    </div>
  );
}