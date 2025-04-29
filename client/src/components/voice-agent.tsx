import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFaceVerification } from '@/hooks/use-face-verification';
import { useLocation } from 'wouter';

// Demo script segments
const DEMO_SCRIPT = {
  welcome: `Welcome to Heirloom, the next generation identity verification platform. 
            I'll be your guide through this demonstration of our secure identity verification system.`,
  
  introduction: `Heirloom provides a secure way to verify and manage your digital identity 
                 using advanced facial recognition technology. Our platform ensures your identity 
                 remains private while giving you control over how it's used and shared.`,
  
  verification: `Let's start with our core feature - facial verification. 
                 This process securely captures your facial biometrics and verifies your identity 
                 in real-time. It's designed to be both highly secure and user-friendly.`,
  
  capsules: `Identity capsules are secure containers where your verified identity information is stored. 
             You can create multiple capsules for different purposes, like one for financial services 
             and another for healthcare. Each capsule can be selectively shared with trusted parties.`,
  
  blockchain: `Heirloom leverages blockchain technology to provide tamper-proof verification records. 
               Our Heirloom Identity Tokens, or HITs, serve as cryptographic proof of your verified identity 
               without exposing your personal information.`,
  
  achievements: `As you use Heirloom, you'll earn achievements that mark milestones in your identity journey. 
                 These can be shared with others to demonstrate your commitment to digital identity management.`,
  
  privacy: `Privacy is at the core of Heirloom. Your data remains encrypted and under your control at all times. 
            You decide what information to share, with whom, and for how long.`,
  
  conclusion: `Thank you for exploring Heirloom with me today. The future of digital identity is secure, 
               private, and user-controlled. Would you like to try the verification process yourself?`
};

// Voice options
const VOICES = {
  female: 'en-US-AriaNeural',
  male: 'en-US-GuyNeural'
};

interface VoiceAgentProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export function VoiceAgent({ onComplete, autoStart = false }: VoiceAgentProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScript, setCurrentScript] = useState<keyof typeof DEMO_SCRIPT>('welcome');
  const [scriptIndex, setScriptIndex] = useState(0);
  const scriptOrder = useRef<Array<keyof typeof DEMO_SCRIPT>>([
    'welcome',
    'introduction',
    'verification',
    'capsules',
    'blockchain',
    'achievements',
    'privacy',
    'conclusion'
  ]);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { simulateVerification } = useFaceVerification();
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
      speechSynthesisRef.current.lang = 'en-US';
      speechSynthesisRef.current.rate = 1.0;
      speechSynthesisRef.current.pitch = 1.0;
      
      // Set voice if available
      setTimeout(() => {
        if (speechSynthesisRef.current) {
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => voice.name === VOICES.female) || 
                                 voices.find(voice => voice.lang === 'en-US') || 
                                 voices[0];
          
          if (preferredVoice) {
            speechSynthesisRef.current.voice = preferredVoice;
          }
        }
      }, 100);
      
      // Auto-start if requested
      if (autoStart) {
        setTimeout(() => {
          playCurrentSegment();
        }, 1000);
      }
    }
    
    return () => {
      stopSpeaking();
    };
  }, [autoStart]);
  
  // Handle speech end event
  useEffect(() => {
    const handleSpeechEnd = () => {
      if (currentScript === 'verification') {
        // After explaining verification, show it in action
        simulateVerification();
        setTimeout(() => {
          advanceScript();
        }, 5000);
      } else if (currentScript === 'conclusion') {
        // After conclusion, trigger completion callback
        if (onComplete) {
          onComplete();
        }
      } else {
        // Advance to next script segment
        advanceScript();
      }
    };
    
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.onend = handleSpeechEnd;
    }
    
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.onend = null;
      }
    };
  }, [currentScript, onComplete, simulateVerification]);
  
  // Play the current script segment
  const playCurrentSegment = () => {
    if (!speechSynthesisRef.current) return;
    
    setIsPlaying(true);
    
    // Get the script text
    const text = DEMO_SCRIPT[currentScript];
    
    // Set the text to speak
    speechSynthesisRef.current.text = text;
    
    // Start speaking
    window.speechSynthesis.speak(speechSynthesisRef.current);
    
    // Visual feedback
    toast({
      title: 'Voice Demo',
      description: `Playing: ${currentScript.charAt(0).toUpperCase() + currentScript.slice(1)}`,
    });
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };
  
  // Toggle play/pause
  const togglePlayback = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      playCurrentSegment();
    }
  };
  
  // Advance to the next script
  const advanceScript = () => {
    const currentIndex = scriptOrder.current.indexOf(currentScript);
    if (currentIndex < scriptOrder.current.length - 1) {
      setCurrentScript(scriptOrder.current[currentIndex + 1]);
      setScriptIndex(currentIndex + 1);
      
      // Auto-play the next segment
      setTimeout(() => {
        playCurrentSegment();
      }, 750);
      
      // If moving to verification, navigate to that page
      if (scriptOrder.current[currentIndex + 1] === 'verification') {
        navigate('/verification');
      } else if (scriptOrder.current[currentIndex + 1] === 'capsules') {
        navigate('/dashboard');
      } else if (scriptOrder.current[currentIndex + 1] === 'achievements') {
        navigate('/achievements');
      }
    } else {
      // End of demo
      setIsPlaying(false);
      
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  // Go to a specific script segment
  const jumpToSegment = (segment: keyof typeof DEMO_SCRIPT) => {
    stopSpeaking();
    setCurrentScript(segment);
    setScriptIndex(scriptOrder.current.indexOf(segment));
    setTimeout(() => {
      playCurrentSegment();
    }, 100);
    
    // Navigate to appropriate page
    if (segment === 'verification') {
      navigate('/verification');
    } else if (segment === 'capsules') {
      navigate('/dashboard');
    } else if (segment === 'achievements') {
      navigate('/achievements');
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="fixed bottom-20 right-5 z-50">
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Heirloom Voice Demo</h3>
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-8 h-8 p-0" 
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button 
              variant={isPlaying ? "destructive" : "outline"} 
              size="sm" 
              className="w-8 h-8 p-0"
              onClick={stopSpeaking}
            >
              <MicOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          {Object.keys(DEMO_SCRIPT).map((key, index) => (
            <Button 
              key={key} 
              variant={currentScript === key ? "default" : "outline"} 
              size="sm"
              className="text-xs"
              onClick={() => jumpToSegment(key as keyof typeof DEMO_SCRIPT)}
            >
              {index + 1}. {key.charAt(0).toUpperCase() + key.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 italic">
          {isPlaying ? 'Speaking...' : 'Click a topic or play button to start'}
        </div>
      </div>
    </div>
  );
}