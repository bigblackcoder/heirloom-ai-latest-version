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
        <svg className="w-6 h-6 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
          <path d="M8.5 8.5v.01" />
          <path d="M16 15.5v.01" />
          <path d="M12 12v.01" />
        </svg>
      ),
      lastUsed: "2h ago",
      status: "Active"
    },
    {
      name: "OpenAI ChatGPT",
      icon: (
        <svg className="w-6 h-6 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 20A7 7 0 0 1 9.8 8.8M22 16.5l-3.5.7-2.8 2.2" />
          <path d="M2 16.5l3.5.7 2.8 2.2" />
          <path d="M9 6.8 7 9.2l-3.4.7" />
          <path d="M15 6.8l2 2.4 3.4.7" />
          <path d="M12 8v16" />
          <path d="M6 2h12" />
        </svg>
      ),
      lastUsed: "1d ago",
      status: "Active"
    },
    {
      name: "Anthropic",
      icon: (
        <svg className="w-6 h-6 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
      lastUsed: "3d ago",
      status: "Active"
    },
    {
      name: "Gemini AI",
      icon: (
        <svg className="w-6 h-6 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 3-1.912 5.813a8.09 8.09 0 0 1-5.309 5.344L3 15l1.791.843a8.09 8.09 0 0 1 5.309 5.344L12 21l1.88-5.813a8.09 8.09 0 0 1 5.33-5.344L21 9l-1.78-.843a8.09 8.09 0 0 1-5.33-5.344L12 3z" />
        </svg>
      ),
      lastUsed: "1w ago",
      status: "Active"
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
              <svg width="20" height="20" viewBox="0 0 49 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.457 23.7509H31.4205M24.4387 16.8237V30.678" stroke="#23340E" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-[#1e3c0d]">Add New</span>
          </div>
        </div>
      </div>
    </div>
  );
}