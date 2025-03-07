import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center">
          <svg
            className="w-12 h-12 text-[#1e3c0d]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 3V21M19 3V21M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-[#1e3c0d]">Heirloom</h1>
            <p className="text-sm text-gray-500">Identity Platform</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-16">
        <Card className="bg-[#1e3c0d] text-white mb-8 shadow-lg">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Secure Your Digital Identity</h2>
            <p className="text-white/80 mb-6">
              Heirloom gives you complete control over your personal data and how it's shared with AI systems.
            </p>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#2a5414] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#4caf50]"
                  xmlns="http://www.w3.org/2000/svg"
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
              <div className="ml-4">
                <h3 className="font-medium">Verified Identity</h3>
                <p className="text-sm text-white/70">
                  Prove your humanness without compromising privacy
                </p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#2a5414] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#4caf50]"
                  xmlns="http://www.w3.org/2000/svg"
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
              <div className="ml-4">
                <h3 className="font-medium">Data Ownership</h3>
                <p className="text-sm text-white/70">
                  Your data stays in your control at all times
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#2a5414] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#4caf50]"
                  xmlns="http://www.w3.org/2000/svg"
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
              <div className="ml-4">
                <h3 className="font-medium">Selective Sharing</h3>
                <p className="text-sm text-white/70">
                  Choose what to share with each AI service
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full py-6 bg-[#4caf50] hover:bg-[#2a5414] text-white font-medium text-lg rounded-full"
          onClick={() => navigate("/verification")}
        >
          Verify My Identity
        </Button>
        
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            className="text-sm text-gray-500"
            onClick={() => navigate("/dashboard")}
          >
            Already verified? Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
