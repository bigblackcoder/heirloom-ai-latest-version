import { useLocation } from "wouter";

export default function QuickActionItems() {
  const [_, navigate] = useLocation();

  const quickActions = [
    {
      name: "Identity",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3h6m-6 0a3 3 0 0 0-3 3m-3 3h3m12 0h3m-3 0a9 9 0 1 1-18 0m18 0a3 3 0 0 0-3-3m-12 0a3 3 0 0 0-3 3" />
        </svg>
      )
    },
    {
      name: "Data",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 4v16M10 4v16M6 4v16M18 4v16" />
        </svg>
      )
    },
    {
      name: "Capsule",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      name: "AI",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
          <path d="M8.5 8.5v.01" />
          <path d="M16 15.5v.01" />
          <path d="M12 12v.01" />
        </svg>
      )
    },
    {
      name: "More",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      )
    }
  ];

  return (
    <div className="px-4 mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h2>
      <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[100px]"
          >
            <div className="w-12 h-12 rounded-full bg-[#1e3c0d]/5 flex items-center justify-center mb-2">
              {action.icon}
            </div>
            <span className="text-sm font-medium text-gray-900">{action.name}</span>
          </button>
        ))}
      </div>
      
      {/* Add custom scrollbar styling */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}