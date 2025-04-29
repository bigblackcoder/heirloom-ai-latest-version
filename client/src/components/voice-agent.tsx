import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFaceVerification } from '@/hooks/use-face-verification';
import { useLocation } from 'wouter';

// Demo script segments with more conversational language and natural pauses
// Carefully formatted to ensure proper spacing around question marks and exclamation points
const DEMO_SCRIPT = {
  welcome: `Hi there! I'm your Heirloom guide. I'd love to walk you through our identity platform today.
            Let me show you how we're changing the way people manage their digital identity.`,
  
  introduction: `So what exactly is Heirloom? Think of it as your digital identity guardian.
                 We use smart facial recognition that keeps your identity secure, but also completely
                 under your control. It's kind of like having a digital passport that only you can use.`,
  
  verification: `Let's check out the coolest part first, our face verification.
                 Instead of remembering passwords, your face becomes your key.
                 Watch this. It scans your face, confirms it's really you, not a photo or mask,
                 and unlocks your identity in seconds. Pretty neat, right?`,
  
  capsules: `Now these identity capsules are my favorite feature. 
             Imagine having different digital lockboxes for different parts of your life.
             One for your banking info, another for healthcare, and you decide exactly who gets access to what.
             No more oversharing your personal details with every service you use!`,
  
  blockchain: `Here's where it gets really interesting. We use blockchain, you know, the technology behind
               Bitcoin. But instead of currency, we're securing your identity with what we call HITs.
               These are like digital certificates that prove you're you, without revealing your personal details.
               It's technological magic, really!`,
  
  achievements: `We've also made identity management fun! As you use Heirloom, you'll collect these achievement badges.
                 Just completed your first verification? That's an achievement! Shared your first capsule? Achievement unlocked!
                 You can even share these on social media if you're proud of your digital security game.`,
  
  privacy: `I can't stress enough how seriously we take your privacy at Heirloom.
            Your data is encrypted, meaning scrambled so only you can make sense of it.
            And unlike other services, we don't own your data, you do. It's your identity after all!
            You're in the driver's seat at all times.`,
  
  conclusion: `And that wraps up our tour of Heirloom! What do you think? Pretty exciting, right?
               The future of identity is here, secure, private, and completely in your hands.
               Would you like to give the verification process a try yourself? I promise it's super easy!`
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
  
  // Initialize speech synthesis with more natural-sounding parameters
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
      speechSynthesisRef.current.lang = 'en-US';
      speechSynthesisRef.current.rate = 0.95; // Slightly slower rate sounds more natural
      speechSynthesisRef.current.pitch = 1.05; // Slight pitch variation for more human-like sound
      speechSynthesisRef.current.volume = 1.0; // Full volume
      
      // Set voice if available
      setTimeout(() => {
        if (speechSynthesisRef.current) {
          const voices = window.speechSynthesis.getVoices();
          
          // Look for higher quality voices first
          const preferredVoice = 
            // Look for Google US English voice which tends to sound more natural
            voices.find(voice => voice.name.includes('Google') && voice.name.includes('US English')) ||
            // Apple's Samantha voice sounds natural on Safari
            voices.find(voice => voice.name === 'Samantha') ||
            // Try Microsoft voices which are often high quality
            voices.find(voice => voice.name === VOICES.female) || 
            // Fallback to any English US voice
            voices.find(voice => voice.lang === 'en-US') || 
            // Last resort - any available voice
            voices[0];
          
          if (preferredVoice) {
            speechSynthesisRef.current.voice = preferredVoice;
            console.log('Using voice:', preferredVoice.name);
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
  
  // Add pauses to text for more natural speech rhythms
  const processTextForSpeech = (text: string): string => {
    // Fix any problematic question marks or symbols first
    let cleanedText = text
      // Replace any encoded question marks with actual question marks
      .replace(/&quest;/g, '?')
      .replace(/&#63;/g, '?')
      .replace(/&#x3F;/g, '?')
      // Replace any encoded exclamation with actual exclamation
      .replace(/&excl;/g, '!')
      .replace(/&#33;/g, '!')
      .replace(/&#x21;/g, '!');
    
    // Add strategic pauses with commas and periods
    let processedText = cleanedText
      // Make sure there's a pause after question marks and exclamation points
      .replace(/\?([^\s])/g, '? $1')
      .replace(/\!([^\s])/g, '! $1')
      // Add pause after "..."
      .replace(/\.\.\.([^\s])/g, '... $1')
      // Replace dashes with slight pauses
      .replace(/\s-\s/g, ', ')
      // Ensure proper pauses after sentences
      .replace(/\.([^\s\.])/g, '. $1');
      
    // Make sure question marks and exclamation points are properly spaced
    processedText = processedText
      .replace(/([^\s])\?/g, '$1 ?')
      .replace(/([^\s])\!/g, '$1 !');
      
    // Remove extra whitespace
    return processedText.replace(/\s+/g, ' ').trim();
  };
  
  // Break down text into "sentences" to create natural pauses
  const speakWithPauses = (text: string) => {
    if (!speechSynthesisRef.current) return;
    
    // Get the processed text
    const processedText = processTextForSpeech(text);
    
    // Set the text to speak
    speechSynthesisRef.current.text = processedText;
    
    // Start speaking
    window.speechSynthesis.speak(speechSynthesisRef.current);
  };
  
  // Play the current script segment with improved naturalness
  const playCurrentSegment = () => {
    if (!speechSynthesisRef.current) return;
    
    setIsPlaying(true);
    
    // Get the script text
    const text = DEMO_SCRIPT[currentScript];
    
    // Speak the text with natural pauses
    speakWithPauses(text);
    
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
      <div className="bg-white rounded-xl shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-[#1E3C0D] rounded-full w-7 h-7 flex items-center justify-center mr-2">
              {isPlaying ? 
                <Pause className="h-3 w-3 text-white" /> : 
                <Play className="h-3 w-3 text-white" />
              }
            </div>
            <h3 className="text-sm font-semibold">Voice Tour</h3>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-7 h-7 p-0" 
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button 
              variant={isPlaying ? "destructive" : "outline"} 
              size="sm" 
              className="w-7 h-7 p-0"
              onClick={stopSpeaking}
            >
              <MicOff className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {Object.keys(DEMO_SCRIPT).map((key, index) => (
            <Button 
              key={key} 
              variant={currentScript === key ? "default" : "outline"} 
              size="sm"
              className="text-xs px-2 py-0 h-7 flex-1"
              onClick={() => jumpToSegment(key as keyof typeof DEMO_SCRIPT)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          {isPlaying ? 'Now speaking: ' + currentScript : 'Select a topic to start'}
        </div>
      </div>
    </div>
  );
}