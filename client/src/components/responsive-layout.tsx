import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useDevice } from '@/lib/device-context';
import NavigationBar from './navigation-bar';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [location] = useLocation();
  const { isMobile } = useDevice();
  
  // Exclude certain pages from having the navigation bar (login, register, home)
  const excludedRoutes = ['/', '/login', '/register'];
  const shouldShowNav = !excludedRoutes.includes(location);

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {shouldShowNav && (
          <div className="w-64 bg-white border-r border-gray-200 shadow-sm flex-shrink-0 hidden lg:block">
            {/* Desktop side navigation */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#1e3c0d] rounded-md flex items-center justify-center text-white font-bold mr-2">
                  H
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Heirloom Identity</h1>
              </div>
            </div>
            <nav className="pt-5 px-4">
              <ul className="space-y-2">
                <li>
                  <a href="/dashboard" className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${location === '/dashboard' ? 'bg-[#1e3c0d]/10 text-[#1e3c0d]' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/capsule" className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${location === '/capsule' ? 'bg-[#1e3c0d]/10 text-[#1e3c0d]' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Identity Capsule
                  </a>
                </li>
                <li>
                  <a href="/verification" className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${location === '/verification' ? 'bg-[#1e3c0d]/10 text-[#1e3c0d]' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Verification
                  </a>
                </li>
                <li>
                  <a href="/notifications" className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${location === '/notifications' ? 'bg-[#1e3c0d]/10 text-[#1e3c0d]' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    Notifications
                  </a>
                </li>
                <li>
                  <a href="/profile" className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${location === '/profile' ? 'bg-[#1e3c0d]/10 text-[#1e3c0d]' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Profile
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        )}
        
        <main className={`flex-1 ${!shouldShowNav ? "" : "pl-0 lg:pl-64"}`}>
          <div className="max-w-4xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }
  
  // Mobile layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-20">
        <div className="max-w-md mx-auto p-4">
          {children}
        </div>
      </main>
      
      {shouldShowNav && <NavigationBar currentPath={location} />}
    </div>
  );
}