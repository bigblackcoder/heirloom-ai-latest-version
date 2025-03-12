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
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 h-auto w-auto">
          <path d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z" fill="#235B3C"/>
          <path d="M11.25 14.625L18 21.375L24.75 14.625" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : variant === 'icon' ? (
        // Small icon logo
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 w-11 h-11">
          <path d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z" fill="#235B3C"/>
          <path d="M11.25 14.625L18 21.375L24.75 14.625" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        // Full logo with emblem
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 w-11 h-11">
          <path d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z" fill="#235B3C"/>
          <path d="M11.25 14.625L18 21.375L24.75 14.625" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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