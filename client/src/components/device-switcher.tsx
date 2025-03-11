import React from 'react';
import { useDevice } from '@/lib/device-context';
import { Button } from '@/components/ui/button';

export default function DeviceSwitcher() {
  const { 
    isMobile, 
    isActualMobile, 
    forceMobile, 
    setForceMobile, 
    forceDesktop, 
    setForceDesktop 
  } = useDevice();

  // Don't show the switcher on actual mobile devices since they can't view desktop version well
  if (isActualMobile) return null;

  return (
    <div className="fixed top-2 right-2 z-50 flex gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-md">
      <Button 
        variant={isMobile ? "default" : "outline"} 
        size="sm"
        onClick={() => {
          setForceMobile(true);
        }}
        className="text-xs"
      >
        <svg 
          className="w-4 h-4 mr-1"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
        Mobile
      </Button>
      
      <Button 
        variant={!isMobile ? "default" : "outline"} 
        size="sm"
        onClick={() => {
          setForceDesktop(true);
        }}
        className="text-xs"
      >
        <svg 
          className="w-4 h-4 mr-1"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        Desktop
      </Button>
    </div>
  );
}