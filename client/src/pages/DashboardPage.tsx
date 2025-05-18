import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { getGreeting } from '@/lib/identity';
import { ProtectedRoute } from '@/components/protected-route';
import VerificationSuccessModal from '@/components/verification-success-modal';

export default function DashboardPage() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [showCapsuleSetup, setShowCapsuleSetup] = useState(false);

  // Check for verification success on component mount
  useEffect(() => {
    const verificationSuccess = localStorage.getItem('showVerificationSuccess') === 'true';
    if (verificationSuccess) {
      localStorage.removeItem('showVerificationSuccess');
      setShowVerificationSuccess(true);

      // Get verification data if available
      const verificationDataStr = localStorage.getItem('verificationData');
      if (verificationDataStr) {
        try {
          const data = JSON.parse(verificationDataStr);
          setVerificationData(data);
          localStorage.removeItem('verificationData');
        } catch (e) {
          console.error('Error parsing verification data:', e);
        }
      }

      // Show capsule setup after verification success closes
      setTimeout(() => {
        setShowCapsuleSetup(true);
      }, 6000);
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f5f7] pb-20">
        {/* Status bar */}
        <div className="w-full px-4 pt-6 pb-2 flex items-center bg-white">
          <div className="text-sm text-gray-500">9:41</div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none">
              <path d="M18 10a6 6 0 0 0-12 0v7h12v-7z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 2a2 2 0 1 0 4 0v1a2 2 0 1 0-4 0v-1z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-white flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-[#1a472a] flex items-center justify-center mr-3">
              <div className="text-white font-bold text-xl">H</div>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {getGreeting()}, {user?.firstName || "Leslie"}
              </h1>
              <p className="text-sm text-gray-500">Connecting You Safely to AI</p>
            </div>
          </div>
          
          <button 
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center relative"
            onClick={() => navigate('/notifications')}
          >
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </header>

        {/* Identity Capsule Card */}
        <div className="px-5 pt-4">
          <div className="rounded-xl overflow-hidden bg-[#1a472a] text-white p-4 shadow-md relative">
            {/* Security badge */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center px-2 py-1 rounded-full bg-[#8ccc5c]/20 text-[#8ccc5c] gap-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#8ccc5c]"></div>
                <span>Secure | 2FA Enabled</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-[#8ccc5c] text-base mb-2">Identity Capsule Snapshot</h2>
            
            {/* User info */}
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-3">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#8ccc5c] flex items-center justify-center text-[#1a472a] font-bold text-lg">
                    {user?.firstName?.[0] || 'L'}
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-lg">
                  {user?.firstName || 'Leslie'} {user?.lastName || 'Alexander'}
                </div>
                <div className="text-xs text-gray-300">Member Since 2024</div>
              </div>
            </div>
            
            {/* AI connections and verified data */}
            <div className="flex justify-between mb-3">
              <div>
                <div className="text-sm text-gray-300">AI Connections:</div>
                <div className="font-medium">3 LLMs | 7 Agents</div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Verified Data:</div>
                <div className="font-medium">5 Assets</div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 bg-[#1a472a] border border-[#8ccc5c]/30 rounded-lg py-2 hover:bg-[#8ccc5c]/10">
                <svg className="w-4 h-4 text-[#8ccc5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[#8ccc5c] text-sm">Verified</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 bg-[#1a472a] border border-gray-500/30 rounded-lg py-2 hover:bg-white/10">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-white text-sm">Add Data</span>
              </button>
              <button className="w-12 flex items-center justify-center gap-1 bg-[#1a472a] border border-gray-500/30 rounded-lg py-2 hover:bg-white/10">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="px-5 py-4 grid grid-cols-5 gap-2">
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <svg className="w-6 h-6 text-[#1a472a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xs text-gray-700">Verify Identity</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <svg className="w-6 h-6 text-[#1a472a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-xs text-gray-700">Add Data</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <svg className="w-6 h-6 text-[#1a472a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-xs text-gray-700">Manage Capsule</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <svg className="w-6 h-6 text-[#1a472a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <span className="text-xs text-gray-700">Connect AI</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <svg className="w-6 h-6 text-[#1a472a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-700">More</span>
          </button>
        </div>

        {/* Active Connections */}
        <div className="px-5 pt-3 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Active Connections</h2>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            <button className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-xs text-gray-700">Add</span>
            </button>
            
            <button className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-1 overflow-hidden">
                <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#000000"/>
                  <path d="M17.5458 11.7365L7.5 6L7.56175 17.4911L10.5278 13.0694L17.5458 11.7365Z" fill="white"/>
                </svg>
              </div>
              <span className="text-xs text-gray-700">Open AI</span>
            </button>
            
            <button className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-1 overflow-hidden">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                  <path d="M10.5 13.5L2 21V3L10.5 10.5V3L21.5 12L10.5 21V13.5Z" fill="#000000"/>
                </svg>
              </div>
              <span className="text-xs text-gray-700">Claude</span>
            </button>
            
            <button className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-1 overflow-hidden">
                <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none">
                  <path d="M2 12L12 2L22 12L12 22L2 12Z" fill="#000000"/>
                </svg>
              </div>
              <span className="text-xs text-gray-700">Perplexity</span>
            </button>
            
            <button className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-1 overflow-hidden">
                <svg viewBox="0 0 24 24" className="w-10 h-10">
                  <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#4285F4"/>
                  <path d="M12 7L17 12L12 17L7 12L12 7Z" fill="white"/>
                </svg>
              </div>
              <span className="text-xs text-gray-700">Gemini</span>
            </button>
          </div>
        </div>

        {/* Connection History */}
        <div className="px-5 pt-3 pb-20">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Connection History</h2>
            <button className="text-sm text-blue-500">View all</button>
          </div>
          
          {/* History would go here */}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a472a] h-[72px] flex items-center justify-around px-6 shadow-lg">
          <button className="flex flex-col items-center text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Activity</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span className="text-xs">Capsule</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </button>
        </div>

        {/* Verification Success Modal */}
        {showVerificationSuccess && (
          <VerificationSuccessModal 
            isOpen={showVerificationSuccess}
            onClose={() => setShowVerificationSuccess(false)}
            verificationData={verificationData}
          />
        )}

        {/* Capsule Setup Modal - Would implement this component as needed */}
        {showCapsuleSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 m-4 max-w-sm w-full">
              <div className="w-16 h-16 bg-[#f3f9ee] rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#8ccc5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-center mb-2">Complete Your Capsule Setup to Start Connecting with AI Safely.</h2>
              <p className="text-gray-600 text-center mb-6">
                Your Identity Capsule is your secure digital vault, designed to keep your verified data safe and under your control. With Heirloom, you can confidently manage your data, connect it to trusted AI systems, and shape your digital legacy—all on your terms.
              </p>
              <button 
                className="w-full bg-[#8ccc5c] text-[#1a472a] py-3 rounded-full font-medium"
                onClick={() => setShowCapsuleSetup(false)}
              >
                Let's Do It!
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}