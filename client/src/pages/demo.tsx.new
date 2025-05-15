import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { VoiceAgent } from '@/components/voice-agent';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, ChevronRight, Shield, Fingerprint, Award, LockKeyhole, 
  Volume, VolumeX, Check, Info, ArrowRight, Sparkles, Users, Bell,
  Home, Menu, X, Settings, Book, LucideProps
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Feature icon component for mobile-first design
interface FeatureIconProps {
  active?: boolean;
  label: string;
  icon: React.ComponentType<LucideProps>;
}

const FeatureIcon = ({ active = false, label, icon, ...props }: FeatureIconProps) => (
  <div className="flex flex-col items-center">
    <div 
      className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center mb-2",
        active 
          ? "bg-[#D4A166] text-[#0F1D04]" 
          : "bg-[#1E3C0D]/60 text-white/80 border border-white/10"
      )}
    >
      {React.createElement(icon as any, { 
        className: "h-6 w-6"
      })}
    </div>
    <span className="text-xs text-center">{label}</span>
  </div>
);

export default function DemoPage() {
  const [location, navigate] = useLocation();
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [startedDemo, setStartedDemo] = useState(false);
  const [preferVoiceDemo, setPreferVoiceDemo] = useState(false);
  const [muteVoice, setMuteVoice] = useState(false);
  const [activeSection, setActiveSection] = useState('welcome');
  
  // Check URL parameters for voice demo flag
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('voice') === 'true') {
      setShowVoiceAgent(true);
      setStartedDemo(true);
    }
    
    // Check if user previously set a preference
    const voicePreference = localStorage.getItem('prefer-voice-demo');
    if (voicePreference === 'true') {
      setPreferVoiceDemo(true);
    }
  }, []);
  
  // Function to start the demo, accepting either a boolean directly or a React mouse event
  const startDemo = (withVoiceOrEvent: boolean | React.MouseEvent<HTMLButtonElement> = true) => {
    // Check if it's a mouse event or a boolean
    const withVoice = typeof withVoiceOrEvent === 'boolean' 
      ? withVoiceOrEvent 
      : true; // Default to true if it's an event
      
    if (typeof withVoiceOrEvent !== 'boolean') {
      // If it's an event, prevent default browser behavior
      withVoiceOrEvent.preventDefault();
    }
    
    setShowVoiceAgent(withVoice && !muteVoice);
    setStartedDemo(true);
    
    // Save preference if user explicitly chose voice demo
    if (withVoice) {
      setPreferVoiceDemo(true);
      localStorage.setItem('prefer-voice-demo', 'true');
    }
    
    // On mobile, scroll down to feature section
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };
  
  const toggleVoicePreference = () => {
    const newPreference = !preferVoiceDemo;
    setPreferVoiceDemo(newPreference);
    localStorage.setItem('prefer-voice-demo', newPreference.toString());
    
    // Update voice agent visibility based on new preference
    if (startedDemo) {
      setShowVoiceAgent(newPreference && !muteVoice);
    }
  };
  
  const toggleMute = () => {
    const newMuteState = !muteVoice;
    setMuteVoice(newMuteState);
    
    // Hide voice agent if muted
    if (newMuteState && showVoiceAgent) {
      setShowVoiceAgent(false);
    } else if (!newMuteState && startedDemo && preferVoiceDemo) {
      setShowVoiceAgent(true);
    }
  };
  
  const completeDemo = () => {
    navigate('/dashboard');
  };
  
  // Feature items for both mobile and desktop
  const featureItems = [
    { id: 'identity', icon: Fingerprint, label: 'Verification', href: '/verification' },
    { id: 'security', icon: Shield, label: 'Security', href: '/dashboard' },
    { id: 'achievements', icon: Award, label: 'Achievements', href: '/achievements' },
    { id: 'blockchain', icon: LockKeyhole, label: 'Blockchain', href: '/dashboard' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3C0D] via-[#152A0A] to-[#0A1908] text-white">
      {/* Modern Mobile-Friendly Header with glassmorphism */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[#1E3C0D]/80 border-b border-[#D4A166]/20">
        <div className="w-full px-4 py-3 md:py-4 md:container md:mx-auto md:max-w-6xl md:px-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/images/logo-heirloom.png" 
                alt="Heirloom Logo" 
                className="h-8 md:h-12 mr-2 md:mr-3"
              />
              <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-white to-[#D4A166] bg-clip-text text-transparent">
                Heirloom
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {['Features', 'Security', 'Privacy', 'About'].map((item) => (
                <TooltipProvider key={item}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href={`#${item.toLowerCase()}`}
                        className="px-4 py-2 rounded-md hover:bg-white/10 transition-colors"
                      >
                        {item}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View {item} Section</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </nav>
            
            {/* Mobile Navigation */}
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden text-white"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#0F1D04] border-l border-[#D4A166]/20 text-white p-0">
                  <SheetHeader className="bg-[#1E3C0D] p-4 border-b border-[#D4A166]/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <img 
                          src="/images/logo-heirloom.png" 
                          alt="Heirloom Logo" 
                          className="h-8 mr-2"
                        />
                        <SheetTitle className="text-xl font-semibold bg-gradient-to-r from-white to-[#D4A166] bg-clip-text text-transparent">
                          Heirloom
                        </SheetTitle>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="text-white">
                          <X className="h-5 w-5" />
                        </Button>
                      </SheetClose>
                    </div>
                    <SheetDescription className="text-white/70 mt-1">
                      Next-Gen Identity Platform
                    </SheetDescription>
                  </SheetHeader>
                  <div className="p-6 flex flex-col space-y-4">
                    {['Features', 'Security', 'Privacy', 'About'].map((item) => (
                      <SheetClose asChild key={item}>
                        <a 
                          href={`#${item.toLowerCase()}`}
                          className="flex items-center py-3 px-4 rounded-md hover:bg-white/10 transition-colors"
                        >
                          {item === 'Features' && <Sparkles className="mr-3 h-5 w-5 text-[#D4A166]" />}
                          {item === 'Security' && <Shield className="mr-3 h-5 w-5 text-[#D4A166]" />}
                          {item === 'Privacy' && <LockKeyhole className="mr-3 h-5 w-5 text-[#D4A166]" />}
                          {item === 'About' && <Book className="mr-3 h-5 w-5 text-[#D4A166]" />}
                          {item}
                        </a>
                      </SheetClose>
                    ))}
                    
                    <div className="pt-4 border-t border-white/10">
                      <SheetClose asChild>
                        <Button 
                          className="w-full bg-[#D4A166] hover:bg-[#A67D4F] text-black font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/verification');
                          }}
                        >
                          <Fingerprint className="mr-2 h-4 w-4" />
                          Try Verification
                        </Button>
                      </SheetClose>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      {/* Voice preference toggle */}
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm">Voice Guide</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={toggleMute}
                          className={cn(
                            "rounded-full w-9 h-9",
                            muteVoice ? "bg-[#D4A166]/20 text-[#D4A166]" : "text-white/80"
                          )}
                        >
                          {muteVoice ? <VolumeX className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center py-2">
                        <button
                          onClick={toggleVoicePreference}
                          className="flex items-center text-sm text-white/80 hover:text-white focus:outline-none"
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-sm border mr-2 flex items-center justify-center transition-colors",
                            preferVoiceDemo 
                              ? "bg-[#D4A166] border-[#D4A166]" 
                              : "border-white/30 bg-transparent"
                          )}>
                            {preferVoiceDemo && <Check className="h-3 w-3 text-black" />}
                          </div>
                          Enable voice guide by default
                        </button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden md:block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={toggleMute}
                        className={cn(
                          "rounded-full w-10 h-10",
                          muteVoice ? "bg-[#D4A166]/20 text-[#D4A166]" : "text-white/80"
                        )}
                      >
                        {muteVoice ? <VolumeX className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{muteVoice ? "Enable Voice Guide" : "Mute Voice Guide"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {!startedDemo && (
                <Button 
                  className="bg-[#D4A166] hover:bg-[#A67D4F] text-black font-medium hidden md:flex"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/verification');
                  }}
                >
                  Try Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section with mobile-first design */}
      <section className="relative pt-8 pb-12 md:py-20 px-4 md:px-5 overflow-hidden">
        {/* Background decoration elements */}
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-[#D4A166]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-[#1E3C0D]/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="md:container md:mx-auto md:max-w-6xl relative">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-block mb-2 md:mb-3 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-[#D4A166]/20 text-[#D4A166] text-xs md:text-sm font-medium">
                Next Generation Identity Platform
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6">
                Your <span className="text-[#D4A166]">Digital Identity</span>, Reinvented
              </h1>
              
              <p className="text-base md:text-lg text-white/80 mb-6 md:mb-8 leading-relaxed">
                Simple biometric verification combined with enterprise-grade 
                blockchain security — putting you in complete control 
                of your digital presence.
              </p>
              
              {!startedDemo ? (
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button 
                    size="lg"
                    className="bg-[#D4A166] hover:bg-[#A67D4F] text-black transition-all duration-300 transform hover:translate-y-[-2px]"
                    onClick={startDemo}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Interactive Demo
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/dashboard');
                    }}
                  >
                    Explore Dashboard
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Card className="bg-[#0F1D04]/80 border-[#D4A166]/20 backdrop-blur-sm">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center text-white">
                        <Bell className="h-5 w-5 text-[#D4A166] mr-2" />
                        Voice Guide
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={cn(
                          "px-2 h-8 text-xs",
                          showVoiceAgent 
                            ? "bg-[#D4A166]/20 text-[#D4A166] border-[#D4A166]/30" 
                            : "text-white/70 border-white/20"
                        )}
                        onClick={() => setShowVoiceAgent(!showVoiceAgent && !muteVoice)}
                        disabled={muteVoice}
                      >
                        {showVoiceAgent ? "Guide Active" : "Enable Guide"}
                      </Button>
                    </div>
                    <CardDescription className="text-white/70">
                      Get a guided tour with voice narration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white/70 border border-white/10 h-8"
                        onClick={toggleMute}
                      >
                        {muteVoice ? <VolumeX className="h-4 w-4 mr-1.5" /> : <Volume className="h-4 w-4 mr-1.5" />}
                        {muteVoice ? "Unmute" : "Mute"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white/70 border border-white/10 h-8"
                        onClick={toggleVoicePreference}
                      >
                        <div className={cn(
                          "w-3.5 h-3.5 rounded-sm border mr-1.5 flex items-center justify-center",
                          preferVoiceDemo 
                            ? "bg-[#D4A166] border-[#D4A166]" 
                            : "border-white/30 bg-transparent"
                        )}>
                          {preferVoiceDemo && <Check className="h-2.5 w-2.5 text-black" />}
                        </div>
                        Default On
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* AI Service Selection */}
              <div className="hidden md:block mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4A166]/20 flex items-center justify-center mr-3">
                    <Settings className="h-4 w-4 text-[#D4A166]" />
                  </div>
                  <p className="text-sm text-white/70">Select Your Preferred AI Service</p>
                </div>
                <div className="flex space-x-4">
                  <button 
                    className={cn(
                      "p-3 rounded-lg transition-all duration-300 transform hover:scale-105 bg-[#1E3C0D]/60 border border-white/10",
                      activeSection === 'anthropic' ? "ring-2 ring-[#D4A166] scale-105" : ""
                    )}
                    onClick={() => setActiveSection('anthropic')}
                  >
                    <img src="/images/ai-services/claude-color.svg" alt="Claude AI" className="h-7" />
                  </button>
                  <button 
                    className={cn(
                      "p-3 rounded-lg transition-all duration-300 transform hover:scale-105 bg-[#1E3C0D]/60 border border-white/10",
                      activeSection === 'gemini' ? "ring-2 ring-[#D4A166] scale-105" : ""
                    )}
                    onClick={() => setActiveSection('gemini')}
                  >
                    <img src="/images/ai-services/gemini-color.svg" alt="Google Gemini" className="h-7" />
                  </button>
                  <button 
                    className={cn(
                      "p-3 rounded-lg transition-all duration-300 transform hover:scale-105 bg-[#1E3C0D]/60 border border-white/10",
                      activeSection === 'openai' ? "ring-2 ring-[#D4A166] scale-105" : ""
                    )}
                    onClick={() => setActiveSection('openai')}
                  >
                    <img src="/images/ai-services/openai.svg" alt="ChatGPT" className="h-7" />
                  </button>
                  <button 
                    className={cn(
                      "p-3 rounded-lg transition-all duration-300 transform hover:scale-105 bg-[#1E3C0D]/60 border border-white/10",
                      activeSection === 'perplexity' ? "ring-2 ring-[#D4A166] scale-105" : ""
                    )}
                    onClick={() => setActiveSection('perplexity')}
                  >
                    <img src="/images/ai-services/perplexity-logo.svg" alt="Perplexity AI" className="h-7" />
                  </button>
                  <button 
                    className={cn(
                      "p-3 rounded-lg transition-all duration-300 transform hover:scale-105 bg-[#1E3C0D]/60 border border-white/10",
                      activeSection === 'copilot' ? "ring-2 ring-[#D4A166] scale-105" : ""
                    )}
                    onClick={() => setActiveSection('copilot')}
                  >
                    <img src="/images/ai-services/copilot-logo.svg" alt="Microsoft Copilot" className="h-7" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Updated dashboard preview with mobile-first design */}
            <div className="relative hidden sm:block">
              <div className="bg-[#0F1D04]/80 rounded-2xl p-4 md:p-6 backdrop-blur-sm border border-white/10 shadow-[0_0_25px_rgba(212,161,102,0.1)]">
                <div className="absolute -top-2 -left-2 bg-[#D4A166]/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-[#D4A166]/30 shadow-lg">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-[#D4A166] mr-2" />
                    <span className="text-sm font-medium">Identity Platform</span>
                  </div>
                </div>
                
                <img 
                  src="/images/dashboard.png" 
                  alt="Heirloom Dashboard" 
                  className="rounded-lg shadow-xl border border-white/5 w-full"
                />
                
                <div className="mt-4 md:mt-6 grid grid-cols-3 gap-2 md:gap-3">
                  <div className="bg-[#1E3C0D]/50 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-white/5 transform transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <Shield className="h-6 w-6 md:h-7 md:w-7 text-[#D4A166]" />
                    </div>
                    <p className="text-center text-xs md:text-sm">Secure Identity</p>
                  </div>
                  <div className="bg-[#1E3C0D]/50 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-white/5 transform transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <Fingerprint className="h-6 w-6 md:h-7 md:w-7 text-[#D4A166]" />
                    </div>
                    <p className="text-center text-xs md:text-sm">Face Verification</p>
                  </div>
                  <div className="bg-[#1E3C0D]/50 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-white/5 transform transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <Award className="h-6 w-6 md:h-7 md:w-7 text-[#D4A166]" />
                    </div>
                    <p className="text-center text-xs md:text-sm">Achievement System</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mobile optimized features section with icons */}
      <section id="features" className="py-8 md:py-16 px-4 md:px-5 bg-[#0A1908]/60">
        <div className="md:container md:mx-auto md:max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Key <span className="text-[#D4A166]">Features</span>
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto">
              Explore Heirloom's core capabilities to take control of your digital identity 
              with enterprise-grade security and simplicity.
            </p>
          </div>
          
          {/* Feature Icons - Mobile First */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
            {featureItems.map(item => (
              <button 
                key={item.id}
                className="flex justify-center"
                onClick={() => {
                  navigate(item.href);
                  setActiveSection(item.id);
                }}
              >
                <FeatureIcon 
                  icon={item.icon} 
                  label={item.label} 
                  active={activeSection === item.id}
                />
              </button>
            ))}
          </div>
          
          {/* Feature Cards - Mobile-First with optimized spacing */}
          <div className="space-y-4 md:space-y-6">
            {/* Identity Verification Card */}
            <Card className="bg-[#0F1D04]/80 border-[#D4A166]/20 overflow-hidden">
              <div className="md:grid md:grid-cols-5 items-stretch">
                <div className="md:col-span-3 p-4 md:p-6">
                  <CardHeader className="p-0 pb-3">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#D4A166]/20 flex items-center justify-center mr-3">
                        <Fingerprint className="h-4 w-4 text-[#D4A166]" />
                      </div>
                      <CardTitle className="text-xl text-white">Identity Verification</CardTitle>
                    </div>
                    <CardDescription className="text-white/70">
                      Secure, fast, and privacy-focused biometric verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-1">
                    <ul className="space-y-2 text-sm md:text-base text-white/80">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#D4A166] mr-2 flex-shrink-0 mt-0.5" />
                        Face verification with liveness detection
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#D4A166] mr-2 flex-shrink-0 mt-0.5" />
                        Encrypted and secure data processing
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#D4A166] mr-2 flex-shrink-0 mt-0.5" />
                        Works on all devices with a camera
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-0 pt-4">
                    <Button 
                      className="bg-[#D4A166] hover:bg-[#A67D4F] text-black"
                      onClick={() => navigate('/verification')}
                    >
                      Try Verification
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </div>
                <div className="hidden md:block md:col-span-2 bg-[#1E3C0D] relative">
                  <img 
                    src="/images/verification-preview.png" 
                    alt="Identity Verification" 
                    className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0F1D04] to-transparent"></div>
                </div>
              </div>
            </Card>
            
            {/* Security Card */}
            <Card className="bg-[#0F1D04]/80 border-[#D4A166]/20 overflow-hidden">
              <div className="md:grid md:grid-cols-5 items-stretch">
                <div className="md:col-span-3 p-4 md:p-6">
                  <CardHeader className="p-0 pb-3">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#D4A166]/20 flex items-center justify-center mr-3">
                        <Shield className="h-4 w-4 text-[#D4A166]" />
                      </div>
                      <CardTitle className="text-xl text-white">Security & Control</CardTitle>
                    </div>
                    <CardDescription className="text-white/70">
                      Enterprise-grade protection with user-friendly controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-1">
                    <ul className="space-y-2 text-sm md:text-base text-white/80">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#D4A166] mr-2 flex-shrink-0 mt-0.5" />
                        Blockchain-verified identity credentials
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#D4A166] mr-2 flex-shrink-0 mt-0.5" />
                        Granular permission control for shared data
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#D4A166] mr-2 flex-shrink-0 mt-0.5" />
                        Revoke access with a single tap
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-0 pt-4">
                    <Button 
                      className="bg-[#D4A166] hover:bg-[#A67D4F] text-black"
                      onClick={() => navigate('/dashboard')}
                    >
                      View Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </div>
                <div className="hidden md:block md:col-span-2 bg-[#1E3C0D] relative">
                  <img 
                    src="/images/security-preview.png" 
                    alt="Security Controls" 
                    className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0F1D04] to-transparent"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Simplified voice agent section for mobile */}
      <section className="py-8 px-4 bg-[#1E3C0D]/50 flex justify-center md:hidden">
        <Card className="w-full bg-[#0F1D04]/80 border-[#D4A166]/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center text-white">
                <Bell className="h-5 w-5 text-[#D4A166] mr-2" />
                Voice Guide
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "px-2 h-8 text-xs",
                  showVoiceAgent 
                    ? "bg-[#D4A166]/20 text-[#D4A166] border-[#D4A166]/30" 
                    : "text-white/70 border-white/20"
                )}
                onClick={() => setShowVoiceAgent(!showVoiceAgent && !muteVoice)}
                disabled={muteVoice}
              >
                {showVoiceAgent ? "Guide Active" : "Enable Guide"}
              </Button>
            </div>
            <CardDescription className="text-white/70 text-xs">
              Get a guided tour with voice narration
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white/70 border border-white/10 h-8"
                onClick={toggleMute}
              >
                {muteVoice ? <VolumeX className="h-4 w-4 mr-1.5" /> : <Volume className="h-4 w-4 mr-1.5" />}
                {muteVoice ? "Unmute" : "Mute"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white/70 border border-white/10 h-8"
                onClick={toggleVoicePreference}
              >
                <div className={cn(
                  "w-3.5 h-3.5 rounded-sm border mr-1.5 flex items-center justify-center",
                  preferVoiceDemo 
                    ? "bg-[#D4A166] border-[#D4A166]" 
                    : "border-white/30 bg-transparent"
                )}>
                  {preferVoiceDemo && <Check className="h-2.5 w-2.5 text-black" />}
                </div>
                Default On
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Security Section with added information */}
      <section id="security" className="py-8 md:py-16 px-4 md:px-5 bg-[#0A1908]">
        <div className="md:container md:mx-auto md:max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Enterprise-Grade <span className="text-[#D4A166]">Security</span>
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto">
              Your digital identity protected by blockchain technology and 
              advanced encryption at every step.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-[#182E0B] border-[#2A3D1E]">
              <CardHeader>
                <div className="mb-4 bg-[#0F1D04] p-3 inline-flex rounded-lg">
                  <LockKeyhole className="h-8 w-8 text-[#D4A166]" />
                </div>
                <CardTitle>Blockchain Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Identity tokens stored on blockchain for immutable, 
                  tamper-proof verification that can't be falsified.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#182E0B] border-[#2A3D1E]">
              <CardHeader>
                <div className="mb-4 bg-[#0F1D04] p-3 inline-flex rounded-lg">
                  <Shield className="h-8 w-8 text-[#D4A166]" />
                </div>
                <CardTitle>Privacy Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Share only the specific parts of your identity that are required, 
                  maintaining privacy while still providing necessary verification.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#182E0B] border-[#2A3D1E]">
              <CardHeader>
                <div className="mb-4 bg-[#0F1D04] p-3 inline-flex rounded-lg">
                  <Fingerprint className="h-8 w-8 text-[#D4A166]" />
                </div>
                <CardTitle>Biometric Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Advanced face detection with liveness checks ensures only real, 
                  present humans can verify, preventing spoofing attacks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-16 px-5 bg-[#0F1D04]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Heirloom</h2>
              <p className="text-white/80 mb-4">
                Heirloom represents the future of digital identity - secure, private, and 
                user-controlled. We're building a world where individuals have ownership of 
                their digital selves, with the power to control how their identity is shared.
              </p>
              <p className="text-white/80 mb-4">
                Our platform combines cutting-edge biometric verification with blockchain 
                technology to create an identity system that can't be compromised or manipulated.
              </p>
              <p className="text-white/80 mb-6">
                Try our demo today to experience the future of digital identity verification.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-[#D4A166] hover:bg-[#A67D4F] text-black"
                  onClick={startDemo}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Voice Demo
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={() => navigate('/verification')}
                >
                  Try Verification
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="bg-[#182E0B] rounded-2xl p-6 shadow-xl">
              <img 
                src="/images/team.png" 
                alt="Heirloom Team" 
                className="rounded-lg shadow-lg mb-6"
              />
              
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src="/images/logo-heirloom.png" 
                  alt="Heirloom Logo" 
                  className="h-8 w-8 object-contain"
                />
                <h3 className="text-xl font-medium">Our Mission</h3>
              </div>
              
              <p className="text-white/80">
                To empower individuals with control over their digital identity 
                through secure, privacy-preserving technology that enables seamless 
                verification without sacrificing personal data.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-5 bg-[#0A1504] border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <img 
                src="/images/logo-heirloom.png" 
                alt="Heirloom Logo" 
                className="h-8 mr-3"
              />
              <span className="text-xl font-semibold">Heirloom</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 items-center">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#security" className="text-white/70 hover:text-white transition-colors">Security</a>
              <a href="#about" className="text-white/70 hover:text-white transition-colors">About</a>
              <Button 
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate('/verification')}
              >
                Try Demo
              </Button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm mb-4 md:mb-0">
              © 2025 Heirloom Identity. All rights reserved.
            </p>
            
            <div className="flex space-x-6">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Bottom Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0F1D04] border-t border-[#D4A166]/20 p-2 md:hidden">
        <div className="flex justify-around">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center py-1 px-2 h-auto text-white/70 hover:text-white"
            onClick={() => {
              navigate('/');
              setActiveSection('welcome');
            }}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center py-1 px-2 h-auto text-white/70 hover:text-white"
            onClick={() => {
              navigate('/verification');
              setActiveSection('identity');
            }}
          >
            <Fingerprint className="h-5 w-5 mb-1" />
            <span className="text-xs">Verify</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center py-1 px-2 h-auto text-white/70 hover:text-white"
            onClick={() => {
              navigate('/dashboard');
              setActiveSection('security');
            }}
          >
            <Shield className="h-5 w-5 mb-1" />
            <span className="text-xs">Security</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center py-1 px-2 h-auto text-white/70 hover:text-white"
            onClick={() => {
              navigate('/achievements');
              setActiveSection('achievements');
            }}
          >
            <Award className="h-5 w-5 mb-1" />
            <span className="text-xs">Rewards</span>
          </Button>
        </div>
      </div>
      
      {/* Voice Agent */}
      {showVoiceAgent && (
        <VoiceAgent 
          onComplete={completeDemo}
          autoStart={true}
        />
      )}
    </div>
  );
}