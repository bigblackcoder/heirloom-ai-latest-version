import React from 'react';
import { cn } from '../lib/utils';

interface HeirloomLogoProps {
  className?: string;
  variant?: 'icon' | 'full' | 'complete';
  withText?: boolean;
  theme?: 'light' | 'dark';
}

export function HeirloomLogo({ 
  className = "w-10 h-10", 
  variant = 'icon',
  withText = false,
  theme = 'light'
}: HeirloomLogoProps) {
  // Logo colors based on theme
  const logoColor = theme === 'light' 
    ? 'bg-white border-green-800/10 text-green-800' 
    : 'bg-green-800 border-white/10 text-white';
  
  // Text color based on theme
  const textColorClass = theme === 'light' ? 'text-gray-900' : 'text-white';
  const subtextColorClass = theme === 'light' ? 'text-gray-500' : 'text-gray-300';

  return (
    <div className={cn("flex items-center", className)}>
      {variant === 'complete' ? (
        // Complete logo with text included in the image
        <div className="flex flex-col items-start">
          <div className={`relative w-10 h-10 rounded-full ${logoColor} flex items-center justify-center border`}>
            <div className="absolute w-5 h-5 rounded-full bg-green-100 top-1 left-1"></div>
            <div className="w-3 h-3 rotate-45 rounded-sm bg-green-800"></div>
          </div>
          <div className="ml-4">
            <h2 className={`text-2xl font-bold ${textColorClass}`}>Heirloom</h2>
            <p className={subtextColorClass}>Identity Platform</p>
          </div>
        </div>
      ) : variant === 'icon' ? (
        // Small icon logo
        <div className={`relative w-full h-full max-w-[40px] max-h-[40px] rounded-full ${logoColor} flex items-center justify-center border`}>
          <div className="absolute w-1/2 h-1/2 rounded-full bg-green-100 top-1 left-1"></div>
          <div className="w-1/3 h-1/3 rotate-45 rounded-sm bg-green-800"></div>
        </div>
      ) : (
        // Full logo with emblem
        <div className={`relative w-10 h-10 rounded-full ${logoColor} flex items-center justify-center border`}>
          <div className="absolute w-5 h-5 rounded-full bg-green-100 top-1 left-1"></div>
          <div className="w-3 h-3 rotate-45 rounded-sm bg-green-800"></div>
        </div>
      )}

      {withText && variant !== 'complete' && (
        <div className="ml-4">
          <h2 className={`text-2xl font-bold ${textColorClass}`}>Heirloom</h2>
          <p className={subtextColorClass}>Identity Platform</p>
        </div>
      )}
    </div>
  );
}

export default HeirloomLogo;