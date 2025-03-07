import { useLocation, Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationBarProps {
  currentPath: string;
}

export default function NavigationBar({ currentPath }: NavigationBarProps) {
  const [_, navigate] = useLocation();
  const isMobile = useIsMobile();

  // Determine which style to use - the grid-based or the simple
  const useGridStyle = true;
  
  if (useGridStyle) {
    // Rich navigation with 5 items in a grid
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
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
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
        name: "Verify",
        path: "/verification",
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
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
      }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 max-w-md mx-auto overflow-hidden">
        {/* Green Vector Background */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#1e3c0d]/10 rounded-t-3xl z-0"></div>
        
        {/* Home indicator line for iPhone */}
        <div className="w-full flex justify-center pb-1 pt-2 relative z-10">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-5 px-2 py-1 relative z-10">
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
  } else {
    // Simpler 4-item navigation
    return (
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white py-2 px-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link href="/dashboard">
            <a className={`flex flex-col items-center ${currentPath === "/dashboard" ? "text-[#1e3c0d]" : "text-gray-500"}`}>
              <svg 
                className={`w-6 h-6 ${isMobile ? 'mb-1' : 'mb-1.5'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Home</span>
            </a>
          </Link>
          
          <Link href="/capsule">
            <a className={`flex flex-col items-center ${currentPath === "/capsule" ? "text-[#1e3c0d]" : "text-gray-500"}`}>
              <svg 
                className={`w-6 h-6 ${isMobile ? 'mb-1' : 'mb-1.5'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Capsule</span>
            </a>
          </Link>
          
          <Link href="/verification">
            <a className={`flex flex-col items-center ${currentPath === "/verification" ? "text-[#1e3c0d]" : "text-gray-500"}`}>
              <svg 
                className={`w-6 h-6 ${isMobile ? 'mb-1' : 'mb-1.5'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Verify</span>
            </a>
          </Link>
          
          <Link href="/notifications">
            <a className={`flex flex-col items-center ${currentPath === "/notifications" ? "text-[#1e3c0d]" : "text-gray-500"}`}>
              <svg 
                className={`w-6 h-6 ${isMobile ? 'mb-1' : 'mb-1.5'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Alerts</span>
            </a>
          </Link>
        </div>
      </nav>
    );
  }
}
