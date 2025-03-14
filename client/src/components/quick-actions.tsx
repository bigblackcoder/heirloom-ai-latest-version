import { useLocation } from "wouter";
import { FiShield, FiShare2, FiFolder, FiRefreshCw, FiGrid } from "react-icons/fi";

export default function QuickActions() {
  const [_, navigate] = useLocation();

  const quickActions = [
    {
      name: "Verify Identity",
      icon: (
        <FiShield className="w-5 h-5 text-[#1e3c0d]" />
      ),
      onClick: () => navigate("/verification")
    },
    {
      name: "Add Data",
      icon: (
        <FiShare2 className="w-5 h-5 text-[#1e3c0d]" />
      ),
      onClick: () => navigate("/capsule")
    },
    {
      name: "Manage Capsule",
      icon: (
        <FiFolder className="w-5 h-5 text-[#1e3c0d]" />
      ),
      onClick: () => navigate("/capsule")
    },
    {
      name: "Connect AI",
      icon: (
        <FiRefreshCw className="w-5 h-5 text-[#1e3c0d]" />
      ),
      onClick: () => navigate("/dashboard")
    },
    {
      name: "More",
      icon: (
        <FiGrid className="w-5 h-5 text-[#1e3c0d]" />
      ),
      onClick: () => {}
    }
  ];

  return (
    <div className="mt-4">      
      {/* Horizontal scrolling quick actions */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 hide-scrollbar px-4 space-x-2">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 flex flex-col items-center" 
              onClick={action.onClick}
            >
              <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-1">
                {action.icon}
              </div>
              <span className="text-[10px] text-[#1e3c0d] font-medium text-center px-1 w-16">{action.name}</span>
            </div>
          ))}
        </div>
        
        {/* Hide scrollbar functionality added via index.css */}
      </div>
    </div>
  );
}