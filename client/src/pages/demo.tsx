import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { VoiceAgent } from '@/components/voice-agent';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, ChevronRight, Shield, Fingerprint, Award, LockKeyhole } from 'lucide-react';

export default function DemoPage() {
  const [_, navigate] = useLocation();
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [startedDemo, setStartedDemo] = useState(false);
  
  const startDemo = () => {
    setShowVoiceAgent(true);
    setStartedDemo(true);
  };
  
  const completeDemo = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E3C0D] to-[#0A1908] text-white">
      {/* Header */}
      <header className="pt-10 pb-6 px-5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/heirloom_white.png" 
                alt="Heirloom Logo" 
                className="h-10 mr-3"
              />
              <h1 className="text-2xl font-semibold">Heirloom</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="hover:text-[#D4A166] transition-colors">Features</a>
              <a href="#security" className="hover:text-[#D4A166] transition-colors">Security</a>
              <a href="#about" className="hover:text-[#D4A166] transition-colors">About</a>
            </nav>
            {!startedDemo && (
              <Button 
                className="bg-[#D4A166] hover:bg-[#A67D4F] text-black"
                onClick={() => navigate('/verification')}
              >
                Try Verification
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-10 md:py-16 px-5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                The Future of <span className="text-[#D4A166]">Digital Identity</span> Verification
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Secure, private, and blockchain-powered identity verification
                that puts you in control of your digital presence.
              </p>
              
              {!startedDemo ? (
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
                    onClick={() => navigate('/dashboard')}
                  >
                    Explore Dashboard
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle>Voice Demo Active</CardTitle>
                    <CardDescription className="text-white/70">
                      Our virtual assistant is explaining Heirloom's features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80">
                      The demo will guide you through key features and navigate through the application.
                      Follow along or use the controls to explore at your own pace.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={() => setShowVoiceAgent(false)}
                    >
                      Hide Voice Controls
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            <div className="relative">
              <div className="bg-[#1A3006] rounded-2xl p-5 md:p-8 shadow-xl">
                <img 
                  src="/attached_assets/Screenshot 2025-03-14 at 10.36.09 PM.png" 
                  alt="Heirloom Dashboard" 
                  className="rounded-lg shadow-lg"
                />
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="bg-[#0F1D04] p-4 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <Shield className="h-8 w-8 text-[#D4A166]" />
                    </div>
                    <p className="text-center text-sm">Secure Identity</p>
                  </div>
                  <div className="bg-[#0F1D04] p-4 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <Fingerprint className="h-8 w-8 text-[#D4A166]" />
                    </div>
                    <p className="text-center text-sm">Biometric Verification</p>
                  </div>
                  <div className="bg-[#0F1D04] p-4 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <LockKeyhole className="h-8 w-8 text-[#D4A166]" />
                    </div>
                    <p className="text-center text-sm">Privacy Control</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-[#D4A166] rounded-full p-4 shadow-lg">
                <Award className="h-8 w-8 text-[#1E3C0D]" />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-[#0F1D04] rounded-xl p-3 shadow-lg border border-white/10">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-[#D4A166] mr-2" />
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
                          className="mt-6 bg-[#D4A166] hover:bg-[#A67D4F] text-black"
                          onClick={() => navigate('/verification')}
                        >
                          Try Verification
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="rounded-xl overflow-hidden">
                        <img 
                          src="/attached_assets/Screenshot 2025-03-14 at 10.38.25 PM.png" 
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
                          className="mt-6 bg-[#D4A166] hover:bg-[#A67D4F] text-black"
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
                          className="mt-6 bg-[#D4A166] hover:bg-[#A67D4F] text-black"
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
                          className="mt-6 bg-[#D4A166] hover:bg-[#A67D4F] text-black"
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
                src="/attached_assets/Screenshot 2025-03-14 at 3.14.52 PM.png" 
                alt="Heirloom Team" 
                className="rounded-lg shadow-lg mb-6"
              />
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-[#D4A166] h-1 w-10 rounded-full"></div>
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
                src="/heirloom_white.png" 
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