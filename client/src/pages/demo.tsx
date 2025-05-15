import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { VoiceAgent } from '@/components/voice-agent';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, ChevronRight, Shield, Fingerprint, Award, LockKeyhole, 
  Volume, VolumeX, Check, Info, ArrowRight, Sparkles, Users, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DemoPage() {
  const [location, navigate] = useLocation();
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [startedDemo, setStartedDemo] = useState(false);
  const [preferVoiceDemo, setPreferVoiceDemo] = useState(false);
  const [muteVoice, setMuteVoice] = useState(false);
  
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
  
  const startDemo = (withVoice = true) => {
    setShowVoiceAgent(withVoice && !muteVoice);
    setStartedDemo(true);
    
    // Save preference if user explicitly chose voice demo
    if (withVoice) {
      setPreferVoiceDemo(true);
      localStorage.setItem('prefer-voice-demo', 'true');
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3C0D] via-[#152A0A] to-[#0A1908] text-white">
      {/* Modern Header with glassmorphism */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[#1E3C0D]/80 border-b border-[#D4A166]/20">
        <div className="container mx-auto max-w-6xl py-4 px-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/images/logo-heirloom.png" 
                alt="Heirloom Logo" 
                className="h-12 mr-3"
              />
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-white to-[#D4A166] bg-clip-text text-transparent">Heirloom</h1>
            </div>
            
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
            
            <div className="flex items-center space-x-2">
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
                      {muteVoice ? <VolumeMute className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{muteVoice ? "Enable Voice Guide" : "Mute Voice Guide"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {!startedDemo && (
                <Button 
                  className="bg-[#D4A166] hover:bg-[#A67D4F] text-black font-medium"
                  onClick={() => navigate('/verification')}
                >
                  Try Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section with modern design elements */}
      <section className="relative py-20 px-5 overflow-hidden">
        {/* Background decoration elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A166]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1E3C0D]/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-[#D4A166]/20 text-[#D4A166] text-sm font-medium">
                Next Generation Identity Platform
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your <span className="text-[#D4A166]">Digital Identity</span>, Reinvented
              </h1>
              
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Simple biometric verification combined with enterprise-grade 
                blockchain security — putting you in complete control 
                of your digital presence.
              </p>
              
              {!startedDemo ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    className="bg-[#D4A166] hover:bg-[#A67D4F] text-black transition-all duration-300 transform hover:translate-y-[-2px]"
                    onClick={() => startDemo(true)}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Interactive Demo
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                    onClick={() => navigate('/dashboard')}
                  >
                    Explore Dashboard
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Card className="bg-[#0F1D04]/80 border-[#D4A166]/20 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[#D4A166]">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#D4A166] mr-2 animate-pulse"></div>
                          Interactive Demo
                        </div>
                      </CardTitle>
                      {showVoiceAgent ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#D4A166] hover:bg-[#D4A166]/10"
                          onClick={() => setShowVoiceAgent(false)}
                        >
                          <VolumeMute className="mr-1 h-4 w-4" />
                          Mute Guide
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#D4A166] hover:bg-[#D4A166]/10"
                          onClick={() => !muteVoice && setShowVoiceAgent(true)}
                          disabled={muteVoice}
                        >
                          <Bell className="mr-1 h-4 w-4" />
                          Enable Guide
                        </Button>
                      )}
                    </div>
                    <CardDescription className="text-white/80">
                      {showVoiceAgent 
                        ? "Our voice guide is explaining Heirloom's features" 
                        : "Follow the visual guide or enable voice assistance"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center py-2 px-4 bg-[#D4A166]/10 rounded-md mb-4">
                      <Info className="h-4 w-4 text-[#D4A166] flex-shrink-0 mr-3" />
                      <p className="text-sm text-white/90">
                        {showVoiceAgent 
                          ? "The demo will guide you through key features and navigate through the app automatically"
                          : "You can explore at your own pace or enable the voice guide for a guided tour"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Button
                        variant="outline" 
                        size="sm"
                        className="text-white/80 border-white/20 hover:bg-white/10"
                        onClick={() => navigate('/verification')}
                      >
                        <Fingerprint className="mr-2 h-4 w-4 text-[#D4A166]" />
                        Try Verification
                      </Button>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="text-white/80 border-white/20 hover:bg-white/10"
                        onClick={() => navigate('/dashboard')}
                      >
                        <Shield className="mr-2 h-4 w-4 text-[#D4A166]" />
                        View Dashboard
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center w-full justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          showVoiceAgent ? "bg-[#D4A166] animate-pulse" : "bg-white/30"
                        )}></div>
                        <span className="text-xs text-white/60">
                          {showVoiceAgent ? "Voice guide active" : "Voice guide inactive"}
                        </span>
                      </div>
                      <Button 
                        variant="default"
                        size="sm"
                        className="bg-[#D4A166]/90 hover:bg-[#D4A166] text-black"
                        onClick={() => navigate('/achievements')}
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        Explore Achievements
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}
              
              {/* Voice preference toggle */}
              <div className="mt-6 flex items-center">
                <button
                  onClick={toggleVoicePreference}
                  className="flex items-center text-sm text-white/60 hover:text-white/90 focus:outline-none"
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
            
            {/* Updated dashboard preview with modern design */}
            <div className="relative">
              <div className="bg-[#0F1D04]/80 rounded-2xl p-6 backdrop-blur-sm border border-white/10 shadow-[0_0_25px_rgba(212,161,102,0.1)]">
                <div className="absolute -top-2 -left-2 bg-[#D4A166]/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-[#D4A166]/30 shadow-lg">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-[#D4A166] mr-2" />
                    <span className="text-sm font-medium">Identity Platform</span>
                  </div>
                </div>
                
                <img 
                  src="/images/dashboard.png" 
                  alt="Heirloom Dashboard" 
                  className="rounded-lg shadow-xl border border-white/5"
                />
                
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="bg-[#1E3C0D]/50 backdrop-blur-sm p-4 rounded-lg border border-white/5 transform transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <Shield className="h-7 w-7 text-[#D4A166]" />
                    </div>
                    <p className="text-center text-sm">Secure Identity</p>
                  </div>
                  <div className="bg-[#1E3C0D]/50 backdrop-blur-sm p-4 rounded-lg border border-white/5 transform transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <Fingerprint className="h-7 w-7 text-[#D4A166]" />
                    </div>
                    <p className="text-center text-sm">Face Verification</p>
                  </div>
                  <div className="bg-[#1E3C0D]/50 backdrop-blur-sm p-4 rounded-lg border border-white/5 transform transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <LockKeyhole className="h-7 w-7 text-[#D4A166]" />
                    </div>
                    <p className="text-center text-sm">Privacy Control</p>
                  </div>
                </div>
              </div>
              
              {/* Modern floating elements */}
              <div className="absolute top-1/4 -right-4 transform translate-x-1/2 bg-[#D4A166] rounded-full p-3 shadow-lg border-2 border-[#1E3C0D]">
                <Award className="h-6 w-6 text-[#1E3C0D]" />
              </div>
              <div className="absolute -bottom-5 left-1/3 bg-[#1E3C0D] rounded-xl p-3 shadow-lg border border-[#D4A166]/30 backdrop-blur-sm">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-[#D4A166] mr-2" />
                  <span className="text-sm font-medium">Identity Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 px-5 bg-[#0F1D04]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Heirloom combines cutting-edge biometric verification with blockchain 
              technology to create a secure, private identity solution.
            </p>
          </div>
          
          <Tabs defaultValue="verification" className="w-full">
            <TabsList className="grid grid-cols-4 bg-[#182E0B]">
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="capsules">Identity Capsules</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="verification" className="space-y-4">
                <Card className="bg-[#182E0B] border-[#2A3D1E]">
                  <CardHeader>
                    <CardTitle className="text-[#D4A166]">Face Verification</CardTitle>
                    <CardDescription className="text-white/70">
                      Secure biometric verification with advanced liveness detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-white/80 mb-4">
                          Our advanced facial verification system uses multiple layers of security:
                        </p>
                        <ul className="space-y-2 text-white/80">
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Real-time alignment and feedback</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Liveness detection to prevent spoofing</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Anti-fraud measures built in</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Privacy-preserving processing</span>
                          </li>
                        </ul>
                        
                        <Button
                          className="mt-6 bg-[#D4A166] hover:bg-[#A67D4F] text-black font-medium"
                          onClick={() => navigate('/verification')}
                        >
                          Try Verification
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="rounded-xl overflow-hidden">
                        <img 
                          src="/images/face-verification.png" 
                          alt="Face Verification" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="capsules" className="space-y-4">
                <Card className="bg-[#182E0B] border-[#2A3D1E]">
                  <CardHeader>
                    <CardTitle className="text-[#D4A166]">Identity Capsules</CardTitle>
                    <CardDescription className="text-white/70">
                      Secure containers for your digital identity information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-white/80 mb-4">
                          Identity Capsules are secure, encrypted containers that store different 
                          aspects of your digital identity:
                        </p>
                        <ul className="space-y-2 text-white/80">
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Create multiple capsules for different contexts</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>End-to-end encryption protects your data</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Selective disclosure - share only what you want</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Time-limited access for third parties</span>
                          </li>
                        </ul>
                        
                        <Button
                          className="mt-6 bg-[#D4A166] hover:bg-[#A67D4F] text-black font-medium"
                          onClick={() => navigate('/dashboard')}
                        >
                          View Capsules
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="bg-[#0F1D04] rounded-xl p-6">
                        <div className="space-y-4">
                          <div className="bg-[#182E0B] p-4 rounded-lg border border-[#D4A166]/30">
                            <h4 className="font-medium text-[#D4A166] mb-2">Financial Identity</h4>
                            <div className="flex items-center text-white/60 text-sm">
                              <LockKeyhole className="h-4 w-4 mr-2" />
                              <span>End-to-end encrypted</span>
                            </div>
                            <div className="mt-3 h-2 bg-[#0F1D04] rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4A166] w-3/4"></div>
                            </div>
                            <div className="mt-2 text-xs text-white/60">75% complete</div>
                          </div>
                          
                          <div className="bg-[#182E0B] p-4 rounded-lg border border-[#D4A166]/30">
                            <h4 className="font-medium text-[#D4A166] mb-2">Healthcare Profile</h4>
                            <div className="flex items-center text-white/60 text-sm">
                              <LockKeyhole className="h-4 w-4 mr-2" />
                              <span>End-to-end encrypted</span>
                            </div>
                            <div className="mt-3 h-2 bg-[#0F1D04] rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4A166] w-1/2"></div>
                            </div>
                            <div className="mt-2 text-xs text-white/60">50% complete</div>
                          </div>
                          
                          <div className="bg-[#182E0B] p-4 rounded-lg border border-white/10">
                            <h4 className="font-medium text-white/80 mb-2">Travel Documents</h4>
                            <div className="flex items-center text-white/60 text-sm">
                              <LockKeyhole className="h-4 w-4 mr-2" />
                              <span>Not yet verified</span>
                            </div>
                            <div className="mt-3 h-2 bg-[#0F1D04] rounded-full overflow-hidden">
                              <div className="h-full bg-white/30 w-1/4"></div>
                            </div>
                            <div className="mt-2 text-xs text-white/60">25% complete</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="blockchain" className="space-y-4">
                <Card className="bg-[#182E0B] border-[#2A3D1E]">
                  <CardHeader>
                    <CardTitle className="text-[#D4A166]">Blockchain Integration</CardTitle>
                    <CardDescription className="text-white/70">
                      Tamper-proof verification with Heirloom Identity Tokens (HITs)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-white/80 mb-4">
                          Our blockchain integration provides immutable proof of your verified identity:
                        </p>
                        <ul className="space-y-2 text-white/80">
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Receive HIT tokens as proof of verification</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Integration with multiple blockchain networks</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Zero-knowledge proofs for privacy</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Smart contract integration for automated verification</span>
                          </li>
                        </ul>
                        
                        <Button
                          className="mt-6 bg-[#D4A166] hover:bg-[#A67D4F] text-black font-medium"
                          onClick={() => navigate('/dashboard')}
                        >
                          View Blockchain Tokens
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="bg-[#0F1D04] rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-[#D4A166]">Heirloom Identity Token</h4>
                          <div className="bg-[#D4A166]/20 text-[#D4A166] text-xs font-medium px-2.5 py-1 rounded">
                            HIT-721
                          </div>
                        </div>
                        
                        <div className="border border-white/10 rounded-lg p-4 mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-white/60">Token ID</span>
                            <span className="text-sm text-white/90 font-mono">0x7f...3a9b</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-white/60">Issued</span>
                            <span className="text-sm text-white/90">April 12, 2025</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-white/60">Verification Level</span>
                            <span className="text-sm text-white/90">Level 3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-white/60">Network</span>
                            <span className="text-sm text-white/90">Polygon</span>
                          </div>
                        </div>
                        
                        <div className="bg-[#182E0B] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-white/90">Blockchain Verification</h5>
                            <div className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                              Verified
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-white/70">
                            <span>Tx Hash:</span>
                            <span className="font-mono">0x8d92...4c7e</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="achievements" className="space-y-4">
                <Card className="bg-[#182E0B] border-[#2A3D1E]">
                  <CardHeader>
                    <CardTitle className="text-[#D4A166]">Identity Achievements</CardTitle>
                    <CardDescription className="text-white/70">
                      Showcase your identity verification milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-white/80 mb-4">
                          Collect and share achievements as you build your digital identity:
                        </p>
                        <ul className="space-y-2 text-white/80">
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Earn verification achievements automatically</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Create custom achievements for personal milestones</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Share achievements on social media</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-[#D4A166] text-[#182E0B] rounded-full p-1 mr-2 inline-flex mt-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>Blockchain-backed for authenticity</span>
                          </li>
                        </ul>
                        
                        <Button
                          className="mt-6 bg-[#D4A166] hover:bg-[#A67D4F] text-black font-medium"
                          onClick={() => navigate('/achievements')}
                        >
                          View Achievements
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0F1D04] rounded-xl p-4 border border-[#D4A166]/20">
                          <div className="flex justify-center mb-3">
                            <div className="bg-[#D4A166]/20 p-3 rounded-full">
                              <Fingerprint className="h-8 w-8 text-[#D4A166]" />
                            </div>
                          </div>
                          <h4 className="text-center font-medium text-white">Identity Verified</h4>
                          <p className="text-center text-xs text-white/60 mt-1">April 2025</p>
                        </div>
                        
                        <div className="bg-[#0F1D04] rounded-xl p-4 border border-[#D4A166]/20">
                          <div className="flex justify-center mb-3">
                            <div className="bg-[#D4A166]/20 p-3 rounded-full">
                              <Shield className="h-8 w-8 text-[#D4A166]" />
                            </div>
                          </div>
                          <h4 className="text-center font-medium text-white">Security Champion</h4>
                          <p className="text-center text-xs text-white/60 mt-1">April 2025</p>
                        </div>
                        
                        <div className="bg-[#0F1D04] rounded-xl p-4 border border-white/10">
                          <div className="flex justify-center mb-3">
                            <div className="bg-white/10 p-3 rounded-full">
                              <Award className="h-8 w-8 text-white/60" />
                            </div>
                          </div>
                          <h4 className="text-center font-medium text-white/80">First Connection</h4>
                          <p className="text-center text-xs text-white/60 mt-1">Coming soon</p>
                        </div>
                        
                        <div className="bg-[#0F1D04] rounded-xl p-4 border border-white/10">
                          <div className="flex justify-center mb-3">
                            <div className="bg-white/10 p-3 rounded-full">
                              <Award className="h-8 w-8 text-white/60" />
                            </div>
                          </div>
                          <h4 className="text-center font-medium text-white/80">HIT Holder</h4>
                          <p className="text-center text-xs text-white/60 mt-1">Coming soon</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
      
      {/* Security Section */}
      <section id="security" className="py-16 px-5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Security & Privacy</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Your identity is secured with multiple layers of protection and privacy-first design.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#182E0B] border-[#2A3D1E]">
              <CardHeader>
                <div className="mb-4 bg-[#0F1D04] p-3 inline-flex rounded-lg">
                  <LockKeyhole className="h-8 w-8 text-[#D4A166]" />
                </div>
                <CardTitle>End-to-End Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  All sensitive data is encrypted on your device before being stored, 
                  ensuring only you can access your full identity information.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#182E0B] border-[#2A3D1E]">
              <CardHeader>
                <div className="mb-4 bg-[#0F1D04] p-3 inline-flex rounded-lg">
                  <Shield className="h-8 w-8 text-[#D4A166]" />
                </div>
                <CardTitle>Selective Disclosure</CardTitle>
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