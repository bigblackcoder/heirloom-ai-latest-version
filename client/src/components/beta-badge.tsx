import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function BetaBadge() {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Show welcome message for beta testers on first visit
  useEffect(() => {
    const hasSeenBetaMessage = localStorage.getItem('hasSeenBetaMessage');
    
    if (!hasSeenBetaMessage) {
      toast({
        title: "Welcome to the Heirloom Beta!",
        description: "You're among the first to try our new identity platform. Help us improve by providing feedback.",
        duration: 6000,
      });
      localStorage.setItem('hasSeenBetaMessage', 'true');
    }
  }, []);

  return (
    <div className="relative inline-flex">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold"
      >
        <AlertCircle className="h-3 w-3" />
        <span>BETA</span>
      </button>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-60 p-2 bg-black/90 text-white text-xs rounded shadow-lg z-50">
          <p className="mb-1 font-semibold">Heirloom Beta Preview</p>
          <p className="text-[11px]">This is a preview version. Some features may change before the final release. Your feedback helps us improve!</p>
          <div className="absolute w-2 h-2 bg-black/90 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
        </div>
      )}
    </div>
  );
}