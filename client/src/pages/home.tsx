import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import HeirloomLogo from "@/components/heirloom-logo";

export default function Home() {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1e2610] via-[#232d12] to-[#273414] text-white">
      {/* Status bar area */}
      <div className="w-full px-4 pt-6 pb-2 flex items-center">
        <div className="text-sm opacity-70">9:41</div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
            <path d="M17 6h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="3" y="6" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="5" y="8" width="10" height="8" rx="1" fill="currentColor" fillOpacity="0.5" />
          </svg>
          <div className="w-0.5 h-3 bg-white/40 rounded-full mx-0.5"></div>
          <div className="w-5 h-5">
            <img src="/images/heirloom-logo-white-black.jpeg" alt="Heirloom Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Logo and brand */}
      <div className="pt-8 pb-6 px-6 flex items-center">
        <div className="w-10 h-10 mr-3">
          <img src="/images/heirloom-logo-white-black.jpeg" alt="Heirloom Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold">Heirloom</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pb-16 mt-4">
        {/* Hero section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold leading-tight mb-3">
            Your Digital<br />Identity, Under<br />Your Control
          </h2>
          <p className="text-white/80 leading-relaxed">
            Heirloom gives you complete control over your personal data and how it's shared with AI systems.
          </p>
        </div>
        
        {/* Features list */}
        <div className="space-y-5 mb-8">
          <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#273414] flex items-center justify-center mr-4 shadow-sm">
              <svg
                className="w-6 h-6 text-[#7c9861]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-base">Verified Identity</h3>
              <p className="text-sm text-white/70 mt-0.5 leading-snug">
                Prove your humanness without compromising privacy
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#273414] flex items-center justify-center mr-4 shadow-sm">
              <svg
                className="w-6 h-6 text-[#7c9861]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-base">Data Ownership</h3>
              <p className="text-sm text-white/70 mt-0.5 leading-snug">
                Your data stays in your control at all times
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#273414] flex items-center justify-center mr-4 shadow-sm">
              <svg
                className="w-6 h-6 text-[#7c9861]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-base">AI Permissions</h3>
              <p className="text-sm text-white/70 mt-0.5 leading-snug">
                Choose what to share with each AI service
              </p>
            </div>
          </div>
        </div>

        {/* Mobile mockup design element */}
        <div className="relative mb-10">
          <div className="absolute -right-4 top-3 w-36 h-36 rounded-full bg-[#d4a166]/20 blur-2xl"></div>
          <div className="absolute -left-4 -bottom-4 w-28 h-28 rounded-full bg-[#7c9861]/20 blur-2xl"></div>
          
          <div className="relative mx-auto w-48 h-48 border-4 border-white/20 rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex justify-center items-center">
                <img src="/images/heirloom-logo-white-black.jpeg" alt="Heirloom Logo" className="w-full h-full object-contain" />
              </div>
              <p className="text-white/90 text-base leading-tight px-2">Your identity capsule<br />awaits activation</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-auto">
          <Button 
            className="w-full py-7 bg-[#7c9861] hover:bg-[#273414] text-white font-medium text-lg rounded-full shadow-lg"
            onClick={() => navigate("/verification")}
          >
            Verify My Identity
          </Button>
          
          <div className="mt-4 text-center flex flex-col items-center">
            <div className="flex flex-col items-center">
              <Button 
                variant="outline" 
                className="text-sm text-white border-white/30 hover:bg-white/10 hover:text-white w-48 rounded-full"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </Button>
              
              <Button 
                variant="link" 
                className="text-sm text-white/70 hover:text-white mt-2"
                onClick={() => navigate("/login")}
              >
                Already verified? Sign in
              </Button>
            </div>
            
            <div className="flex flex-row gap-2 items-center justify-center mt-3">
              <Button 
                variant="link" 
                className="text-sm text-[#d4a166] hover:text-[#e5b277] mt-2"
                onClick={() => navigate("/demo")}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"></path>
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="m4.93 4.93 1.41 1.41"></path>
                    <path d="m17.66 17.66 1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="m6.34 17.66-1.41 1.41"></path>
                    <path d="m19.07 4.93-1.41 1.41"></path>
                  </svg>
                  Tour Demo
                </span>
              </Button>
              
              <Button 
                variant="link" 
                className="text-sm text-[#d4a166] hover:text-[#e5b277] mt-2"
                onClick={() => navigate("/demo?voice=true")}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7Z"></path>
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                    <path d="M12 11h.01"></path>
                    <path d="M19 6.337A7.964 7.964 0 0 0 12 3a7.964 7.964 0 0 0-7 3.337"></path>
                    <path d="M12 19c2.5 0 6.5-1.5 6.5-7 0-1-1.5-1.5-1.5-1.5h-10S5.5 11 5.5 12c0 5.5 4 7 6.5 7Z"></path>
                  </svg>
                  Voice-Guided Demo
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
