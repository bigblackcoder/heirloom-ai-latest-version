import { useLocation } from "wouter";
import { 
  IdentificationBadge, 
  Database, 
  ShieldCheck, 
  Robot, 
  AppWindow 
} from "phosphor-react";

export default function QuickActions() {
  const [_, navigate] = useLocation();

  const quickActions = [
    {
      name: "Identity",
      icon: (
        <IdentificationBadge weight="duotone" className="w-8 h-8 text-[#1e3c0d]" />
      )
    },
    {
      name: "Data",
      icon: (
        <Database weight="duotone" className="w-8 h-8 text-[#1e3c0d]" />
      )
    },
    {
      name: "Capsule",
      icon: (
        <ShieldCheck weight="duotone" className="w-8 h-8 text-[#1e3c0d]" />
      )
    },
    {
      name: "AI",
      icon: (
        <Robot weight="duotone" className="w-8 h-8 text-[#1e3c0d]" />
      )
    },
    {
      name: "Apps",
      icon: (
        <AppWindow weight="duotone" className="w-8 h-8 text-[#1e3c0d]" />
      )
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
            <div key={index} className="flex-shrink-0 w-20 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-2 border border-gray-100">
                {action.icon}
              </div>
              <span className="text-xs text-gray-700 font-medium">{action.name}</span>
            </div>
          ))}
        </div>
        
        {/* Hide scrollbar functionality added via index.css */}
      </div>
    </div>
  );
}