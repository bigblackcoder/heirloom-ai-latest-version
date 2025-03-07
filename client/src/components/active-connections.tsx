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
  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-gray-900">Active Connections</h2>
        <button className="text-sm text-[#1e3c0d] font-medium">
          Manage
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M16 15.5v.01" />
                <path d="M12 12v.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Claude AI</h3>
              <p className="text-xs text-gray-500">Connected • Last used 2h ago</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#4caf50] rounded-full mr-2"></div>
            <span className="text-xs text-gray-500">Active</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 20A7 7 0 0 1 9.8 8.8M22 16.5l-3.5.7-2.8 2.2" />
                <path d="M2 16.5l3.5.7 2.8 2.2" />
                <path d="M9 6.8 7 9.2l-3.4.7" />
                <path d="M15 6.8l2 2.4 3.4.7" />
                <path d="M12 8v16" />
                <path d="M6 2h12" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">OpenAI ChatGPT</h3>
              <p className="text-xs text-gray-500">Connected • Last used 1d ago</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#4caf50] rounded-full mr-2"></div>
            <span className="text-xs text-gray-500">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}