import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import HeirloomLogo from "@/components/heirloom-logo";

export default function Home() {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1a3607] via-[#1e3c0d] to-[#2a5414] text-white">
      {/* Status bar area */}
      <div className="w-full px-4 pt-6 pb-2 flex items-center">
        <div className="text-sm opacity-70">9:41</div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
            <path d="M1.5 6.5C1.5 4 3.5 2 6 2 8.5 2 10.5 4 10.5 6.5v11C10.5 20 8.5 22 6 22 3.5 22 1.5 20 1.5 17.5v-11Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 6c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v11c0 2.5-2 4.5-4.5 4.5S10.5 19.5 10.5 17V6Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M19.5 7a2.5 2.5 0 0 1 5 0v10a2.5 2.5 0 0 1-5 0V7Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
            <path d="M3 7c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M21 16h2v-8h-2M1 16h2V8H1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>

      {/* Logo and brand */}
      <div className="pt-8 pb-6 px-6">
        <HeirloomLogo className="w-auto h-auto" variant="complete" />
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
            <div className="w-12 h-12 rounded-full bg-[#2a5414] flex items-center justify-center mr-4 shadow-sm">
              <svg
                className="w-6 h-6 text-[#4caf50]"
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
            <div className="w-12 h-12 rounded-full bg-[#2a5414] flex items-center justify-center mr-4 shadow-sm">
              <svg
                className="w-6 h-6 text-[#4caf50]"
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
            <div className="w-12 h-12 rounded-full bg-[#2a5414] flex items-center justify-center mr-4 shadow-sm">
              <svg
                className="w-6 h-6 text-[#4caf50]"
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
          <div className="absolute -left-4 -bottom-4 w-28 h-28 rounded-full bg-[#4caf50]/20 blur-2xl"></div>
          
          <div className="relative mx-auto w-48 h-48 border-4 border-white/20 rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex justify-center items-center">
                <HeirloomLogo className="w-full h-full" variant="icon" />
              </div>
              <p className="text-white/90 text-base leading-tight px-2">Your identity capsule<br />awaits activation</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-auto">
          <Button 
            className="w-full py-7 bg-[#4caf50] hover:bg-[#2a5414] text-white font-medium text-lg rounded-full shadow-lg"
            onClick={() => navigate("/verification")}
          >
            Verify My Identity
          </Button>
          
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              className="text-sm text-white/70 hover:text-white"
              onClick={() => navigate("/dashboard")}
            >
              Already verified? Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
