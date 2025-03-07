import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CapsuleSetupInfo() {
  const [_, navigate] = useLocation();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  return (
    <div className="px-6 pt-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-[#f0b73e] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2">
        Complete Your Capsule Setup to Start Connecting with AI Safely.
      </h2>
      
      <p className="text-center text-gray-600 mb-6">
        Your Identity Capsule is your secure digital vault, designed to keep your verified data 
        safe and under your control. With Heirloom, you can confidently manage your data, connect 
        it to trusted AI systems, and shape your digital legacy—all on your terms. Ready to take the next step?
      </p>
      
      <Button 
        className="w-full py-6 bg-[#4caf50] hover:bg-[#2a5414] text-white rounded-full font-medium mb-6"
        onClick={handleGetStarted}
      >
        Let's Do It!
      </Button>
    </div>
  );
}
