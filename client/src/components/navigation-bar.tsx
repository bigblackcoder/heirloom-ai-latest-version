import { useLocation } from "wouter";

interface NavigationBarProps {
  currentPath: string;
}

export default function NavigationBar({ currentPath }: NavigationBarProps) {
  const [_, navigate] = useLocation();

  const navItems = [
    {
      name: "Home",
      path: "/dashboard",
      icon: (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      name: "Activity",
      path: "/notifications",
      icon: (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    {
      name: "Identity",
      path: "/capsule",
      icon: (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      name: "More",
      path: "/more",
      icon: (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 max-w-md mx-auto">
      {/* Home indicator line for iPhone */}
      <div className="w-full flex justify-center pb-1 pt-2">
        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-5 px-2 py-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button 
              key={item.path}
              className={`flex flex-col items-center justify-center py-2 relative ${
                isActive ? "text-[#1e3c0d]" : "text-gray-500"
              }`}
              onClick={() => navigate(item.path)}
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-[#1e3c0d] rounded-full"></div>
              )}
              
              <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                isActive ? "bg-[#1e3c0d]/5" : ""
              }`}>
                {item.icon}
              </div>
              
              <span className={`text-xs mt-1 font-medium ${
                isActive ? "text-[#1e3c0d]" : "text-gray-500"
              }`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
