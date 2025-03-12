import { MdAdd } from "react-icons/md";
import {
  SiOpenai,
  SiGoogle,
  SiMeta,
  SiAmazon
} from "react-icons/si";
import { TbBrain, TbRobot } from "react-icons/tb";
import { GiArtificialIntelligence } from "react-icons/gi";

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
        <GiArtificialIntelligence className="w-6 h-6 text-[#6333c4]" />
      ),
      lastUsed: "2h ago",
      status: "Active",
      color: "#6333c4"
    },
    {
      name: "OpenAI ChatGPT",
      icon: (
        <SiOpenai className="w-6 h-6 text-[#1a8870]" /> 
      ),
      lastUsed: "1d ago",
      status: "Active",
      color: "#1a8870"
    },
    {
      name: "Anthropic",
      icon: (
        <TbBrain className="w-6 h-6 text-[#f02c56]" strokeWidth={2} />
      ),
      lastUsed: "3d ago",
      status: "Active",
      color: "#f02c56"
    },
    {
      name: "Gemini AI",
      icon: (
        <SiGoogle className="w-6 h-6 text-[#2e77d0]" />
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
        <button className="text-sm text-[#1e3c0d] font-medium">
          Manage
        </button>
      </div>
      
      {/* Horizontal scrolling connections */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-6 hide-scrollbar space-x-4">
          {connectionsList.map((connection, index) => (
            <div key={index} className="flex-shrink-0 w-48 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center mr-3">
                  {connection.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{connection.name}</h3>
                  <p className="text-xs text-gray-500">Last used {connection.lastUsed}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[#4caf50] rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">{connection.status}</span>
              </div>
            </div>
          ))}
          
          {/* Add Connection Card */}
          <div className="flex-shrink-0 w-48 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center h-[106px]">
            <div className="w-10 h-10 rounded-full bg-[#1e3c0d]/10 flex items-center justify-center mb-2">
              <MdAdd className="w-6 h-6 text-[#1e3c0d]" />
            </div>
            <span className="text-sm font-medium text-[#1e3c0d]">Add New</span>
          </div>
        </div>
      </div>
    </div>
  );
}