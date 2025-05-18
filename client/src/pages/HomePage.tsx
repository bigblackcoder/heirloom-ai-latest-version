import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, Activity } from 'lucide-react';

const HomePage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#273414] text-white p-6">
      {/* Header with logo */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img 
            src="/logo-heirloom.png" 
            alt="Heirloom Logo" 
            className="h-10 w-auto"
            onError={(e) => {
              // Fallback if image isn't found
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="ml-3 text-2xl font-bold">Heirloom</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col mt-10">
        <h1 className="text-4xl font-bold leading-tight mb-2">
          Your Digital Identity, Under Your Control
        </h1>
        
        <p className="text-[#e9f0e6] mb-10">
          Heirloom gives you complete control over your personal data and how it's shared with AI systems.
        </p>
        
        {/* Feature cards */}
        <div className="space-y-4">
          {/* Verified Identity Card */}
          <div 
            className="bg-[#273414]/40 p-5 rounded-xl border border-[#e9f0e6]/20 flex items-start"
            onClick={() => navigate('/authenticate')}
          >
            <div className="w-12 h-12 rounded-full bg-[#e9f0e6]/10 flex items-center justify-center mr-4 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#e9f0e6]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Verified Identity</h3>
              <p className="text-[#e9f0e6]/80 text-sm">
                Prove your humanness without compromising privacy
              </p>
            </div>
          </div>
          
          {/* Data Ownership Card */}
          <div 
            className="bg-[#273414]/40 p-5 rounded-xl border border-[#e9f0e6]/20 flex items-start"
            onClick={() => navigate('/data-ownership')}
          >
            <div className="w-12 h-12 rounded-full bg-[#e9f0e6]/10 flex items-center justify-center mr-4 flex-shrink-0">
              <Lock className="w-6 h-6 text-[#e9f0e6]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Data Ownership</h3>
              <p className="text-[#e9f0e6]/80 text-sm">
                Your data stays in your control at all times
              </p>
            </div>
          </div>
          
          {/* AI Permissions Card */}
          <div 
            className="bg-[#273414]/40 p-5 rounded-xl border border-[#e9f0e6]/20 flex items-start"
            onClick={() => navigate('/ai-permissions')}
          >
            <div className="w-12 h-12 rounded-full bg-[#e9f0e6]/10 flex items-center justify-center mr-4 flex-shrink-0">
              <Activity className="w-6 h-6 text-[#e9f0e6]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">AI Permissions</h3>
              <p className="text-[#e9f0e6]/80 text-sm">
                Choose what to share with each AI service
              </p>
            </div>
          </div>
        </div>
        
        {/* Get Started Button */}
        <div className="mt-10">
          <Button 
            className="w-full bg-[#e9f0e6] text-[#273414] hover:bg-[#c4d3c0] border-none font-semibold py-6"
            onClick={() => navigate('/authenticate')}
          >
            Get Started
          </Button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;