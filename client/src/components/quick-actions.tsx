import { useLocation } from "wouter";

export default function QuickActions() {
  const [_, navigate] = useLocation();
  
  const actions = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      name: "Verify Identity",
      onClick: () => navigate("/verification")
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
      name: "Add Data",
      onClick: () => navigate("/capsule")
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h6" />
          <path d="M14 3v5h5M18 21v-6M15 18h6" />
        </svg>
      ),
      name: "Manage Capsule",
      onClick: () => navigate("/capsule")
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      name: "Connect AI",
      onClick: () => navigate("/capsule")
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
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
      ),
      name: "More",
      onClick: () => {}
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-2 px-4 mt-6">
      {actions.map((action, index) => (
        <div key={index} className="flex flex-col items-center">
          <button 
            className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-1"
            onClick={action.onClick}
          >
            {action.icon}
          </button>
          <span className="text-xs text-center">{action.name}</span>
        </div>
      ))}
    </div>
  );
}
