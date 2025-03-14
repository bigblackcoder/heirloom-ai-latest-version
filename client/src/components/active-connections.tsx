import { MdAdd } from "react-icons/md";
import { SiOpenai } from "react-icons/si";
import ClaudeLogo from "@/components/ui/claude-logo";
import AnthropicLogo from "@/components/ui/anthropic-logo";
import GeminiLogo from "@/components/ui/gemini-logo";

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
  // Mock connections data for scrollable design
  const connectionsList = [
    {
      name: "Claude AI",
      icon: (
        <ClaudeLogo className="w-5 h-5" />
      ),
      lastUsed: "2h ago",
      status: "Active",
      color: "#E57B52"
    },
    {
      name: "OpenAI ChatGPT",
      icon: (
        <SiOpenai className="w-5 h-5 text-[#1a8870]" /> 
      ),
      lastUsed: "1d ago",
      status: "Active",
      color: "#1a8870"
    },
    {
      name: "Anthropic",
      icon: (
        <AnthropicLogo className="w-5 h-5" />
      ),
      lastUsed: "3d ago",
      status: "Active",
      color: "#5436DA"
    },
    {
      name: "Gemini AI",
      icon: (
        <GeminiLogo className="w-5 h-5" />
      ),
      lastUsed: "1w ago",
      status: "Active",
      color: "#2e77d0"
    }
  ];

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-gray-900">Active Connections</h2>
        <button className="text-sm text-gray-700 font-medium">
          Manage
        </button>
      </div>
      
      {/* Horizontal scrolling connections */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-6 hide-scrollbar space-x-4">
          {connectionsList.map((connection, index) => (
            <div key={index} className="flex-shrink-0 w-48 h-[106px] bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-1">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden">
                    <div className="flex items-center justify-center w-7 h-7">
                      {connection.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{connection.name}</h3>
                    <p className="text-xs text-gray-500">Last used {connection.lastUsed}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-start h-5">
                <div className="w-2 h-2 bg-[#4caf50] rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">{connection.status}</span>
              </div>
            </div>
          ))}
          
          {/* Add Connection Card */}
          <div className="flex-shrink-0 w-48 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center h-[106px]">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <MdAdd className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add New</span>
          </div>
        </div>
      </div>
    </div>
  );
}