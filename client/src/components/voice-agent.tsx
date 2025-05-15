import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, MicOff, Play, Pause, VolumeX, Volume2, 
  SkipForward, Settings, X, Volume1, RotateCcw 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFaceVerification } from '@/hooks/use-face-verification';
import { useLocation } from 'wouter';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Slider
} from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Sound effects for more engaging audio experience
const SOUND_EFFECTS = {
  success: new Audio('/sounds/success.mp3'),
  complete: new Audio('/sounds/complete.mp3'),
  transition: new Audio('/sounds/transition.mp3'),
  welcome: new Audio('/sounds/welcome.mp3')
};

// More conversational and concise demo scripts
// Written to sound like a friendly guide rather than a robotic narrator
const DEMO_SCRIPT = {
  welcome: `Hey there! Welcome to Heirloom. I'm here to give you a quick tour of our platform. 
            Think of me as your friendly guide to the future of digital identity.`,
  
  introduction: `So what makes Heirloom special? In a world where our digital identities are scattered across 
                countless platforms, we've created a way for you to stay in control. It's your identity, 
                so you should own it, right?`,
  
  verification: `Let me show you our face verification. Instead of typing passwords or remembering PINs, 
                your face is your key. Simple, secure, and impossible to forget. And don't worry, 
                we've built this with privacy as our top priority.`,
  
  capsules: `These identity capsules are like digital safes for different parts of your life. 
            Banking in one, healthcare in another. You decide who sees what and for how long.
            It's all about giving you control over your information.`,
  
  blockchain: `Behind the scenes, we use blockchain technology to keep everything secure. 
              Your identity information is protected by the same tech that powers digital currencies, 
              making it virtually impossible to fake or tamper with.`,
  
  achievements: `We've also added some fun to identity management with achievements. 
                As you use Heirloom, you'll earn badges that track your journey. 
                It's our way of making security a bit more engaging.`,
  
  privacy: `Privacy isn't just a feature for us—it's our foundation. Your data is encrypted, 
           you control who accesses it, and we don't sell your information to anyone. 
           That's our promise to you.`,
  
  conclusion: `That's Heirloom in a nutshell! A secure, private way to manage your digital identity
              with you in complete control. Ready to try it out for yourself?`
};

// Extended voice options with descriptions for better voice selection
const VOICES = {
  'default': { name: 'Default', description: 'System default voice' },
  'en-US-female-1': { name: 'Emma', description: 'Clear and friendly female voice' },
  'en-US-male-1': { name: 'Thomas', description: 'Professional male voice' },
  'en-GB-female-1': { name: 'Sophia', description: 'Warm British female voice' },
  'en-US-Guy': { name: 'Guy', description: 'Casual American male voice' }
};

interface VoiceAgentProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export function VoiceAgent({ onComplete, autoStart = false }: VoiceAgentProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScript, setCurrentScript] = useState<keyof typeof DEMO_SCRIPT>('welcome');
  const [scriptIndex, setScriptIndex] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [volume, setVolume] = useState(80);
  const [rate, setRate] = useState(0.95);
  const [enableSoundEffects, setEnableSoundEffects] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
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
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  
  // Initialize speech synthesis with improved parameters
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Create utterance
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
      
      // Set initial parameters
      updateSpeechParameters();
      
      // Get available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          availableVoicesRef.current = voices;
          updateVoice();
        }
      };
      
      // Load voices immediately and also listen for voiceschanged event
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      // Play welcome sound if sound effects are enabled
      if (enableSoundEffects) {
        try {
          SOUND_EFFECTS.welcome.volume = volume / 100;
          SOUND_EFFECTS.welcome.play().catch(e => console.log('Sound effect failed:', e));
        } catch (e) {
          console.log('Sound effect not available');
        }
      }
      
      // Auto-start if requested (with a slight delay)
      if (autoStart) {
        setTimeout(() => {
          playCurrentSegment();
        }, 1500);
      }
    }
    
    return () => {
      stopSpeaking();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [autoStart]);
  
  // Update speech parameters when they change
  useEffect(() => {
    updateSpeechParameters();
  }, [volume, rate, selectedVoice]);
  
  // Update speech parameters based on user preferences
  const updateSpeechParameters = () => {
    if (!speechSynthesisRef.current) return;
    
    speechSynthesisRef.current.lang = 'en-US';
    speechSynthesisRef.current.rate = rate;
    speechSynthesisRef.current.pitch = 1.05;  // Slight pitch variation for natural sound
    speechSynthesisRef.current.volume = volume / 100;
    
    updateVoice();
  };
  
  // Update the voice based on selection
  const updateVoice = () => {
    if (!speechSynthesisRef.current || availableVoicesRef.current.length === 0) return;
    
    // Find the selected voice based on preference
    let voiceToUse;
    
    if (selectedVoice === 'default') {
      // Find a good default voice
      voiceToUse = 
        // Look for Google US English voice which tends to sound more natural
        availableVoicesRef.current.find(v => v.name.includes('Google') && v.name.includes('US English')) ||
        // Apple's Samantha voice sounds natural on Safari
        availableVoicesRef.current.find(v => v.name === 'Samantha') ||
        // Try to find a female US English voice
        availableVoicesRef.current.find(v => v.lang === 'en-US' && v.name.includes('Female')) ||
        // Fallback to any English US voice
        availableVoicesRef.current.find(v => v.lang === 'en-US') ||
        // Last resort - first available voice
        availableVoicesRef.current[0];
    } else if (VOICES[selectedVoice as keyof typeof VOICES]) {
      // Find the voice that matches the selected name pattern
      const voiceInfo = VOICES[selectedVoice as keyof typeof VOICES];
      voiceToUse = availableVoicesRef.current.find(v => {
        const voiceName = v.name.toLowerCase();
        const searchName = voiceInfo.name.toLowerCase();
        return voiceName.includes(searchName);
      });
      
      if (!voiceToUse) {
        // If specific voice not found, use a US English voice
        voiceToUse = availableVoicesRef.current.find(v => v.lang === 'en-US') ||
                    availableVoicesRef.current[0];
      }
    }
    
    if (voiceToUse) {
      speechSynthesisRef.current.voice = voiceToUse;
      console.log('Using voice:', voiceToUse.name);
    }
  };
  
  // Handle speech end event with enhanced feedback
  useEffect(() => {
    const handleSpeechEnd = () => {
      // Play transition sound effect between segments if enabled
      if (enableSoundEffects) {
        try {
          SOUND_EFFECTS.transition.volume = volume / 100 * 0.5; // Quieter than speech
          SOUND_EFFECTS.transition.play().catch(e => console.log('Transition sound failed:', e));
        } catch (e) {
          console.log('Sound effect not available');
        }
      }
      
      if (currentScript === 'verification') {
        // After explaining verification, show it in action with special effect
        simulateVerification();
        
        if (enableSoundEffects) {
          try {
            SOUND_EFFECTS.success.volume = volume / 100;
            SOUND_EFFECTS.success.play().catch(e => console.log('Success sound failed:', e));
          } catch (e) {
            console.log('Sound effect not available');
          }
        }
        
        setTimeout(() => {
          advanceScript();
        }, 5000);
      } else if (currentScript === 'conclusion') {
        // After conclusion, play completion sound and trigger callback
        if (enableSoundEffects) {
          try {
            SOUND_EFFECTS.complete.volume = volume / 100;
            SOUND_EFFECTS.complete.play().catch(e => console.log('Completion sound failed:', e));
          } catch (e) {
            console.log('Sound effect not available');
          }
        }
        
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      } else {
        // Advance to next script segment with slight delay
        setTimeout(() => {
          advanceScript();
        }, 500);
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
  }, [currentScript, onComplete, simulateVerification, enableSoundEffects, volume]);
  
  // Process text for more natural speech patterns
  const processTextForSpeech = (text: string): string => {
    // Remove excess whitespace and normalize
    let cleanedText = text.replace(/\s+/g, ' ').trim();
    
    // Add strategic pauses for better rhythm
    let processedText = cleanedText
      // Ensure proper sentence spacing
      .replace(/\.\s*([A-Z])/g, '. $1')
      .replace(/\?\s*([A-Z])/g, '? $1')
      .replace(/\!\s*([A-Z])/g, '! $1')
      // Add slight pauses at commas
      .replace(/,\s*/g, ', ')
      // Add pauses for quoted text
      .replace(/"/g, ' " ')
      // Add pauses around dashes
      .replace(/\s-\s/g, ' - ')
      // Add pauses for parenthetical remarks
      .replace(/\(/g, ' (')
      .replace(/\)/g, ') ');
    
    // Add occasional SSML-like pauses for more natural cadence
    processedText = processedText
      .replace(/\.\s+/g, '. <pause> ')
      .replace(/\?\s+/g, '? <pause> ')
      .replace(/\!\s+/g, '! <pause> ');
    
    // Remove the actual SSML tags since we're using the browser's speech API
    processedText = processedText.replace(/<pause>/g, '');
    
    return processedText;
  };
  
  // Speak text with improved naturalness
  const speakWithPauses = (text: string) => {
    if (!speechSynthesisRef.current) return;
    
    // Get the processed text
    const processedText = processTextForSpeech(text);
    
    // Set the text to speak
    speechSynthesisRef.current.text = processedText;
    
    // Start speaking
    window.speechSynthesis.speak(speechSynthesisRef.current);
  };
  
  // Play the current script segment
  const playCurrentSegment = () => {
    if (!speechSynthesisRef.current) return;
    
    setIsPlaying(true);
    
    // Get the script text
    const text = DEMO_SCRIPT[currentScript];
    
    // Speak the text with natural pauses
    speakWithPauses(text);
    
    // Provide visual feedback
    toast({
      title: 'Voice Guide',
      description: `Topic: ${currentScript.charAt(0).toUpperCase() + currentScript.slice(1)}`,
      className: 'bg-[#1E3C0D] text-white border-[#D4A166]',
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
  
  // Advance to the next script segment
  const advanceScript = () => {
    const currentIndex = scriptOrder.current.indexOf(currentScript);
    if (currentIndex < scriptOrder.current.length - 1) {
      setCurrentScript(scriptOrder.current[currentIndex + 1]);
      setScriptIndex(currentIndex + 1);
      
      // Auto-play the next segment
      setTimeout(() => {
        playCurrentSegment();
      }, 750);
      
      // Navigate to the appropriate page based on script segment
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
  
  // Skip to next segment
  const skipToNext = () => {
    stopSpeaking();
    advanceScript();
  };
  
  // Jump to a specific segment
  const jumpToSegment = (segment: keyof typeof DEMO_SCRIPT) => {
    stopSpeaking();
    setCurrentScript(segment);
    setScriptIndex(scriptOrder.current.indexOf(segment));
    
    // Play after a brief pause for better UX
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
  
  // Reset demo to beginning
  const resetDemo = () => {
    stopSpeaking();
    setCurrentScript('welcome');
    setScriptIndex(0);
    navigate('/');
    
    setTimeout(() => {
      playCurrentSegment();
    }, 500);
  };
  
  // Get human-readable topic name
  const getTopicName = (key: string): string => {
    const names: Record<string, string> = {
      'welcome': 'Welcome',
      'introduction': 'About Heirloom',
      'verification': 'Face Verification',
      'capsules': 'Identity Capsules',
      'blockchain': 'Blockchain Security',
      'achievements': 'Achievements',
      'privacy': 'Privacy Features',
      'conclusion': 'Conclusion'
    };
    
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };
  
  // Determine if a button should show as active/current
  const isActiveSegment = (segment: string): boolean => {
    return currentScript === segment;
  };
  
  // Toggle compact/expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    // Close settings when collapsing
    if (isExpanded) {
      setShowSettings(false);
    }
  };
  
  // Render the minimal audio-only control
  if (audioOnly) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <div className="bg-[#1E3C0D] text-white rounded-full shadow-lg p-2 flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-8 h-8 p-0 rounded-full text-white hover:bg-white/10" 
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="w-8 h-8 p-0 rounded-full text-white hover:bg-white/10"
            onClick={() => setAudioOnly(false)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Render the full voice agent component with settings
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className={`bg-white dark:bg-[#1A2D0B] rounded-xl shadow-lg 
                     transition-all duration-300 ease-in-out
                     ${isExpanded ? 'w-80' : 'w-64'}`}>
        {/* Header */}
        <div className="bg-[#1E3C0D] text-white p-3 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center">
            <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 
                          ${isPlaying ? 'bg-[#D4A166]' : 'bg-white/20'}`}>
              {isPlaying ? 
                <Pause className="h-4 w-4 text-[#1E3C0D]" /> : 
                <Mic className="h-4 w-4 text-white" />
              }
            </div>
            <h3 className="text-sm font-semibold">Heirloom Voice Guide</h3>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-7 h-7 p-0 text-white hover:bg-white/10" 
              onClick={() => setAudioOnly(true)}
              title="Minimize"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-7 h-7 p-0 text-white hover:bg-white/10"
              onClick={toggleExpanded}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? 
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 15l7-7 7 7" />
                </svg> : 
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              }
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-3">
          {/* Controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-8 h-8 p-0 ${isPlaying ? 'bg-[#1E3C0D] text-white' : ''}`}
                onClick={togglePlayback}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-8 h-8 p-0"
                onClick={skipToNext}
                disabled={scriptIndex === scriptOrder.current.length - 1}
                title="Skip to Next"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-8 h-8 p-0"
                onClick={resetDemo}
                title="Restart Tour"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              <Popover open={showSettings} onOpenChange={setShowSettings}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={`w-8 h-8 p-0 ${showSettings ? 'bg-[#1E3C0D] text-white' : ''}`}
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-3">
                  <h4 className="font-medium mb-2">Voice Settings</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Voice Style</Label>
                      <Select 
                        value={selectedVoice} 
                        onValueChange={setSelectedVoice}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(VOICES).map(([key, data]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              {data.name} - {data.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label className="text-xs">Volume</Label>
                        <span className="text-xs text-gray-500">{volume}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <VolumeX className="h-3 w-3 text-gray-500" />
                        <Slider
                          value={[volume]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) => setVolume(value[0])}
                          className="flex-1"
                        />
                        <Volume2 className="h-3 w-3 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label className="text-xs">Speaking Rate</Label>
                        <span className="text-xs text-gray-500">{Math.round(rate * 100)}%</span>
                      </div>
                      <Slider
                        value={[rate * 100]}
                        min={50}
                        max={150}
                        step={5}
                        onValueChange={(value) => setRate(value[0] / 100)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Sound Effects</Label>
                      <Switch
                        checked={enableSoundEffects}
                        onCheckedChange={setEnableSoundEffects}
                        className="data-[state=checked]:bg-[#1E3C0D]"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant={volume === 0 ? "secondary" : "outline"}
                size="sm" 
                className="w-8 h-8 p-0"
                onClick={() => volume > 0 ? setVolume(0) : setVolume(80)}
                title={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? <VolumeX className="h-4 w-4" /> : 
                 volume < 50 ? <Volume1 className="h-4 w-4" /> : 
                 <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Topic selection */}
          {isExpanded && (
            <div className="grid grid-cols-2 gap-1 mb-3">
              {Object.keys(DEMO_SCRIPT).map((key) => (
                <Button 
                  key={key} 
                  variant={isActiveSegment(key) ? "default" : "outline"} 
                  size="sm"
                  className={`text-xs h-8 ${isActiveSegment(key) ? 'bg-[#1E3C0D] hover:bg-[#2A4A17]' : ''}`}
                  onClick={() => jumpToSegment(key as keyof typeof DEMO_SCRIPT)}
                >
                  {getTopicName(key)}
                </Button>
              ))}
            </div>
          )}
          
          {/* Current status */}
          <div className="flex items-center text-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-[#D4A166] animate-pulse' : 'bg-gray-300'}`}></div>
            <div className="flex-1 truncate">
              {isPlaying ? (
                <span className="text-[#1E3C0D] font-medium">
                  {getTopicName(currentScript)}
                </span>
              ) : (
                <span className="text-gray-500">Select a topic to start</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {scriptIndex + 1}/{scriptOrder.current.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}