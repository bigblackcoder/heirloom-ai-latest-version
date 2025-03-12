import React from 'react';
import { cn } from '../lib/utils';

interface HeirloomLogoProps {
  className?: string;
  variant?: 'icon' | 'full' | 'complete';
  withText?: boolean;
}

export function HeirloomLogo({ 
  className = "w-10 h-10", 
  variant = 'icon',
  withText = false
}: HeirloomLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {variant === 'complete' ? (
        // Complete logo with text included in the image
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#235B3C]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ) : variant === 'icon' ? (
        // Small icon logo
        <div className="relative flex items-center justify-center rounded-full bg-[#235B3C] w-full h-full">
          <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ) : (
        // Full logo with emblem
        <div className="relative flex items-center justify-center rounded-full bg-[#235B3C] w-full h-full">
          <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {withText && variant !== 'complete' && (
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-[#235B3C]">Heirloom</h2>
          <p className="text-gray-600">Identity Platform</p>
        </div>
      )}
    </div>
  );
}

export default HeirloomLogo;