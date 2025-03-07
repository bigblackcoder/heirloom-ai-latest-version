import { useLocation } from "wouter";

export default function QuickActions() {
  const [_, navigate] = useLocation();

  const quickActions = [
    {
      name: "Identity",
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM17.8 14.5a3 3 0 00-5.6 0M5.8 21h12.4a2 2 0 001.9-2.6 8 8 0 00-16.2 0A2 2 0 005.8 21z" />
        </svg>
      )
    },
    {
      name: "Data",
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 18h10M7 14h2M7 10h2M11 14h2M11 10h2M15 14h2M15 10h2M3 22h18a2 2 0 002-2V4a2 2 0 00-2-2H3a2 2 0 00-2 2v16a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: "Capsule",
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      name: "AI",
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 17l3-3 2 2 4-4 3 3M5 19h14M5 5h14M5 12h14" />
        </svg>
      )
    },
    {
      name: "Apps",
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 3a1 1 0 011-1h2a1 1 0 011 1v1h3a2 2 0 012 2v4h-6M1 10h6m0 0v11a1 1 0 001 1h8a1 1 0 001-1V10m0 0h6" />
        </svg>
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