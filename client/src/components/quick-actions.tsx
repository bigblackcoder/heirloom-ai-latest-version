import { useState } from "react";
import { useLocation } from "wouter";
import { 
  BsPersonBadgeFill, 
  BsDatabaseFill, 
  BsShieldLockFill, 
  BsRobot, 
  BsGrid3X3GapFill 
} from "react-icons/bs";
import { IoShieldCheckmark } from "react-icons/io5";
import { SiProbot } from "react-icons/si";
import { GrCube } from "react-icons/gr";
import { FaIdCard, FaDatabase } from "react-icons/fa";
import AddConnectionSlideModal from "./add-connection-slide-modal";
import ManageConnectionsSlideModal from "./manage-connections-slide-modal";

export default function QuickActions() {
  const [_, navigate] = useLocation();
  const [showAddConnectionModal, setShowAddConnectionModal] = useState(false);
  const [showManageConnectionsModal, setShowManageConnectionsModal] = useState(false);

  const quickActions = [
    {
      name: "Identity",
      icon: (
        <FaIdCard className="w-8 h-8 text-[#1e3c0d]" />
      ),
      onClick: () => navigate("/profile")
    },
    {
      name: "Data",
      icon: (
        <FaDatabase className="w-8 h-8 text-[#1e3c0d]" />
      ),
      onClick: () => navigate("/capsule")
    },
    {
      name: "Capsule",
      icon: (
        <IoShieldCheckmark className="w-8 h-8 text-[#1e3c0d]" />
      ),
      onClick: () => navigate("/capsule")
    },
    {
      name: "AI",
      icon: (
        <SiProbot className="w-8 h-8 text-[#1e3c0d]" />
      ),
      onClick: () => setShowManageConnectionsModal(true)
    },
    {
      name: "Connect",
      icon: (
        <BsGrid3X3GapFill className="w-8 h-8 text-[#1e3c0d]" />
      ),
      onClick: () => setShowAddConnectionModal(true)
    }
  ];

  return (
    <div className="mt-6">
      <div className="px-4 flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <button className="text-sm text-[#1e3c0d] font-medium">
          View All
        </button>
      </div>
      
      {/* Horizontal scrolling quick actions */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 hide-scrollbar px-4 space-x-4">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-20 flex flex-col items-center cursor-pointer"
              onClick={action.onClick}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-2 border border-gray-100 hover:shadow-lg transition-shadow">
                {action.icon}
              </div>
              <span className="text-xs text-gray-700 font-medium">{action.name}</span>
            </div>
          ))}
        </div>
        
        {/* Hide scrollbar functionality added via index.css */}
      </div>
      
      {/* Sliding Modals */}
      <AddConnectionSlideModal 
        isOpen={showAddConnectionModal}
        onClose={() => setShowAddConnectionModal(false)}
      />
      
      <ManageConnectionsSlideModal 
        isOpen={showManageConnectionsModal}
        onClose={() => setShowManageConnectionsModal(false)}
      />
    </div>
  );
}