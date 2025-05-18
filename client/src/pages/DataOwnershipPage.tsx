import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Lock, Settings, FileCheck, Share2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const DataOwnershipPage: React.FC = () => {
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
          <h2 className="text-2xl font-bold text-[#273414] mb-2">Data Ownership</h2>
          <p className="text-[#273414]/70 text-sm">
            Control how your personal data is stored and shared
          </p>
        </div>
        
        {/* Data Storage Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#273414] mb-3 flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Data Storage
          </h3>
          
          <div className="bg-[#e9f0e6] p-4 rounded-lg border border-[#273414]/10 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-[#273414]">Local Storage Only</h4>
                <p className="text-xs text-[#273414]/70">
                  Keep sensitive data only on your device
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          
          <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-[#273414]">Encrypted Sync</h4>
                <p className="text-xs text-[#273414]/70">
                  Sync data between devices with end-to-end encryption
                </p>
              </div>
              <Switch />
            </div>
          </div>
          
          <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-[#273414]">Auto Deletion</h4>
                <p className="text-xs text-[#273414]/70">
                  Automatically delete data after 30 days
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
        
        {/* Data Export Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#273414] mb-3 flex items-center">
            <FileCheck className="w-5 h-5 mr-2" />
            Data Export
          </h3>
          
          <div className="bg-[#e9f0e6] p-4 rounded-lg border border-[#273414]/10 mb-4">
            <h4 className="font-medium text-[#273414] mb-2">Export Options</h4>
            <p className="text-sm text-[#273414]/70 mb-3">
              Download a copy of your data in your preferred format
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline"
                className="w-full border-[#273414] text-[#273414] justify-start"
              >
                Export as JSON
              </Button>
              <Button 
                variant="outline"
                className="w-full border-[#273414] text-[#273414] justify-start"
              >
                Export as CSV
              </Button>
              <Button 
                variant="outline"
                className="w-full border-[#273414] text-[#273414] justify-start"
              >
                Export as PDF
              </Button>
            </div>
          </div>
        </div>
        
        {/* Permissions Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#273414] mb-3 flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Connected Services
          </h3>
          
          <div className="bg-[#e9f0e6]/50 p-4 rounded-lg border border-[#273414]/10 mb-4">
            <h4 className="font-medium text-[#273414] mb-2">No Connected Services</h4>
            <p className="text-sm text-[#273414]/70 mb-3">
              You haven't connected any external services yet
            </p>
            <Button 
              className="w-full bg-[#273414] text-white"
              onClick={() => navigate('/ai-permissions')}
            >
              Manage AI Connections
            </Button>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            className="border-[#273414] text-[#273414]"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          
          <Button
            className="bg-[#273414] text-white"
            onClick={() => navigate('/ai-permissions')}
          >
            AI Permissions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataOwnershipPage;