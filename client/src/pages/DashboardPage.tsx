import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, Activity, User, Settings, LogOut } from 'lucide-react';

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
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
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="bg-[#273414] text-white px-6 pb-8">
        <div className="pt-4 flex items-center">
          <div className="w-16 h-16 rounded-full bg-[#e9f0e6] flex items-center justify-center mr-4">
            <User className="w-8 h-8 text-[#273414]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Welcome Back</h2>
            <p className="text-[#e9f0e6]/80">Verified User</p>
          </div>
        </div>
      </div>
      
      {/* Status Section */}
      <div className="bg-white shadow-md rounded-t-xl -mt-4 px-6 py-5">
        <h3 className="text-lg font-semibold text-[#273414] mb-4">Identity Status</h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#e9f0e6] flex items-center justify-center mr-3">
              <ShieldCheck className="w-5 h-5 text-[#273414]" />
            </div>
            <div>
              <h4 className="font-medium text-[#273414]">Identity Verified</h4>
              <p className="text-xs text-[#273414]/70">
                Last verified: Today
              </p>
            </div>
          </div>
          <span className="text-sm font-medium bg-[#e9f0e6] text-[#273414] px-3 py-1 rounded-full">
            Active
          </span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#273414] mb-4">Identity Services</h3>
        
        {/* Service Cards */}
        <div className="space-y-4">
          {/* Verified Identity */}
          <div 
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start cursor-pointer"
            onClick={() => navigate('/authenticate')}
          >
            <div className="w-12 h-12 rounded-full bg-[#e9f0e6] flex items-center justify-center mr-4 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#273414]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#273414] mb-1">Verified Identity</h3>
              <p className="text-[#273414]/70 text-sm">
                Manage your verification methods
              </p>
            </div>
          </div>
          
          {/* Data Ownership */}
          <div 
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start cursor-pointer"
            onClick={() => navigate('/data-ownership')}
          >
            <div className="w-12 h-12 rounded-full bg-[#e9f0e6] flex items-center justify-center mr-4 flex-shrink-0">
              <Lock className="w-6 h-6 text-[#273414]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#273414] mb-1">Data Ownership</h3>
              <p className="text-[#273414]/70 text-sm">
                Manage how your data is stored and shared
              </p>
            </div>
          </div>
          
          {/* AI Permissions */}
          <div 
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start cursor-pointer"
            onClick={() => navigate('/ai-permissions')}
          >
            <div className="w-12 h-12 rounded-full bg-[#e9f0e6] flex items-center justify-center mr-4 flex-shrink-0">
              <Activity className="w-6 h-6 text-[#273414]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#273414] mb-1">AI Permissions</h3>
              <p className="text-[#273414]/70 text-sm">
                Manage what data is shared with AI services
              </p>
            </div>
          </div>
          
          {/* Settings */}
          <div 
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start cursor-pointer"
            onClick={() => {}}
          >
            <div className="w-12 h-12 rounded-full bg-[#e9f0e6] flex items-center justify-center mr-4 flex-shrink-0">
              <Settings className="w-6 h-6 text-[#273414]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#273414] mb-1">Settings</h3>
              <p className="text-[#273414]/70 text-sm">
                Configure your identity preferences
              </p>
            </div>
          </div>
        </div>
        
        {/* Activity Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#273414] mb-4">Recent Activity</h3>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="border-l-4 border-[#273414] pl-3 py-1 mb-3">
              <h4 className="font-medium text-[#273414]">Identity Verified</h4>
              <p className="text-xs text-[#273414]/70">Today, 10:23 AM</p>
            </div>
            
            <div className="border-l-4 border-[#273414]/70 pl-3 py-1 mb-3">
              <h4 className="font-medium text-[#273414]">Device Registered</h4>
              <p className="text-xs text-[#273414]/70">Today, 10:22 AM</p>
            </div>
            
            <div className="border-l-4 border-[#273414]/50 pl-3 py-1">
              <h4 className="font-medium text-[#273414]">Account Created</h4>
              <p className="text-xs text-[#273414]/70">Today, 10:20 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;