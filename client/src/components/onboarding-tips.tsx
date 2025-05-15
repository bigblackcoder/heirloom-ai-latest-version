import { useState, useEffect } from 'react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

interface Tip {
  id: string;
  title: string;
  description: string;
  element: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

const ONBOARDING_TIPS: Tip[] = [
  {
    id: 'profile-photo',
    title: 'Upload your profile photo',
    description: 'Add a clear photo of your face for identity verification',
    element: '.profile-photo-area',
    position: 'right',
  },
  {
    id: 'verification',
    title: 'Complete verification',
    description: 'Verify your identity to unlock all platform features',
    element: '.verification-button',
    position: 'bottom',
  },
  {
    id: 'feedback-button',
    title: 'Share your feedback',
    description: 'Help us improve by reporting issues or suggesting features',
    element: '.feedback-button',
    position: 'left',
  },
];

export default function OnboardingTips() {
  const [completedTips, setCompletedTips] = useState<string[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tipOpen, setTipOpen] = useState(false);
  
  // Load completed tips from localStorage on mount
  useEffect(() => {
    const savedTips = localStorage.getItem('completedOnboardingTips');
    if (savedTips) {
      setCompletedTips(JSON.parse(savedTips));
    }
    
    // Show first tip automatically after a short delay
    const timer = setTimeout(() => {
      if (!localStorage.getItem('onboardingStarted')) {
        setTipOpen(true);
        localStorage.setItem('onboardingStarted', 'true');
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter out completed tips
  const remainingTips = ONBOARDING_TIPS.filter(tip => !completedTips.includes(tip.id));
  const currentTip = remainingTips[currentTipIndex];
  
  // Save completed tips to localStorage
  const saveTips = (tips: string[]) => {
    localStorage.setItem('completedOnboardingTips', JSON.stringify(tips));
    setCompletedTips(tips);
  };
  
  // Mark current tip as completed
  const completeTip = () => {
    const newCompletedTips = [...completedTips, currentTip.id];
    saveTips(newCompletedTips);
    
    if (currentTipIndex < remainingTips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
    } else {
      setCurrentTipIndex(0);
    }
    
    setTipOpen(false);
  };
  
  // Skip current tip
  const skipTip = () => {
    if (currentTipIndex < remainingTips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
    } else {
      setCurrentTipIndex(0);
    }
    
    setTipOpen(false);
  };
  
  // Reset all tips (for testing)
  const resetTips = () => {
    localStorage.removeItem('completedOnboardingTips');
    localStorage.removeItem('onboardingStarted');
    setCompletedTips([]);
    setCurrentTipIndex(0);
    setTipOpen(true);
  };
  
  // If all tips are completed, render nothing
  if (remainingTips.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={tipOpen} onOpenChange={setTipOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full bg-amber-500 text-white hover:bg-amber-600 shadow-lg">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side={currentTip.position} className="w-80 p-0 border-2 border-amber-500">
          <div className="p-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <div className="flex-shrink-0 h-6 w-6 text-amber-500">
                <HelpCircle className="h-6 w-6" />
              </div>
              <span>{currentTip.title}</span>
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {currentTip.description}
            </p>
          </div>
          <div className="border-t flex justify-between p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTip}
              className="text-gray-600 hover:text-gray-800"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Skip
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={completeTip}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Got it
            </Button>
          </div>
          <div className="text-xs text-center p-1 bg-gray-50 text-gray-500">
            <button 
              onClick={() => setTipOpen(false)} 
              className="hover:underline"
            >
              Close for now
            </button>
            {" • "}
            <button 
              onClick={resetTips} 
              className="hover:underline"
            >
              Reset all tips
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}