import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Activity, Settings, Shield, Info, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const AIPermissionsPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#273414] text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/logo-heirloom.png" 
              alt="Heirloom Logo" 
              className="h-8 w-auto"
              onError={(e) => {
                // Fallback if image isn't found
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="ml-3 text-xl font-bold">Heirloom</span>
          </div>
          <Button 
            variant="ghost" 
            className="text-white p-2 h-auto" 
            onClick={() => navigate('/')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#273414] mb-2">AI Permissions</h2>
          <p className="text-[#273414]/70 text-sm">
            Control what information is shared with AI services
          </p>
        </div>
        
        {/* Global AI Permissions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#273414] mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Global AI Permissions
          </h3>
          
          <div className="bg-[#e9f0e6] p-4 rounded-lg border border-[#273414]/10 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-[#273414]">Allow Identity Verification</h4>
                <p className="text-xs text-[#273414]/70">
                  Enable AI services to verify your identity
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          
          <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-[#273414]">Share Profile Data</h4>
                <p className="text-xs text-[#273414]/70">
                  Share basic profile information with AI services
                </p>
              </div>
              <Switch />
            </div>
          </div>
          
          <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-[#273414]">AI Learning</h4>
                <p className="text-xs text-[#273414]/70">
                  Allow AI to learn from your interactions
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
        
        {/* Connected AI Services */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#273414] mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Connected AI Services
          </h3>
          
          <div className="bg-[#e9f0e6] p-4 rounded-lg border border-[#273414]/10 mb-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center mr-3">
                <img 
                  src="/attached_assets/anthropic.png" 
                  alt="Claude" 
                  className="w-8 h-8"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/32x32?text=C';
                  }}
                />
              </div>
              <div>
                <h4 className="font-medium text-[#273414]">Claude AI</h4>
                <p className="text-xs text-[#273414]/70">
                  Connected: May 5, 2025
                </p>
              </div>
              <div className="ml-auto">
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="pl-13 mt-2">
              <Button 
                variant="outline"
                size="sm"
                className="text-xs border-[#273414] text-[#273414]"
              >
                Manage Permissions
              </Button>
            </div>
          </div>
          
          <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center mr-3">
                <img 
                  src="/attached_assets/openai.png" 
                  alt="OpenAI" 
                  className="w-8 h-8"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/32x32?text=O';
                  }}
                />
              </div>
              <div>
                <h4 className="font-medium text-[#273414]">OpenAI</h4>
                <p className="text-xs text-[#273414]/70">
                  Not connected
                </p>
              </div>
              <div className="ml-auto">
                <Button
                  size="sm"
                  className="text-xs bg-[#273414] hover:bg-[#1d2810] text-white"
                >
                  Connect
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center mr-3">
                <img 
                  src="/attached_assets/gemini-color.png" 
                  alt="Gemini" 
                  className="w-8 h-8"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/32x32?text=G';
                  }}
                />
              </div>
              <div>
                <h4 className="font-medium text-[#273414]">Google Gemini</h4>
                <p className="text-xs text-[#273414]/70">
                  Not connected
                </p>
              </div>
              <div className="ml-auto">
                <Button
                  size="sm"
                  className="text-xs bg-[#273414] hover:bg-[#1d2810] text-white"
                >
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Information */}
        <div className="mb-6">
          <div className="bg-[#e9f0e6]/30 p-4 rounded-lg border border-[#273414]/10">
            <div className="flex">
              <Info className="w-5 h-5 text-[#273414] mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#273414] text-sm">How AI Permissions Work</h4>
                <p className="text-xs text-[#273414]/70 mt-1">
                  Your identity is verified without sharing your actual biometric data. AI services 
                  only receive an authentication token confirming your identity, but never your 
                  actual biometric information.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            className="border-[#273414] text-[#273414]"
            onClick={() => navigate('/data-ownership')}
          >
            Data Ownership
          </Button>
          
          <Button
            className="bg-[#273414] text-white"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIPermissionsPage;