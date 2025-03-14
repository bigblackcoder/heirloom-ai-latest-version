import React from 'react';
import { cn } from '../lib/utils';

// Logo paths for different variants
const logoIcon = '/images/heirloom-icon.png';
const logoFull = '/images/heirloom-full.png';
const logoComplete = '/images/heirloom-complete.png';

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
  // Set logo paths based on variant
  const logoIconPath = logoIcon;
  const logoFullPath = logoFull;
  const logoCompletePath = logoComplete;

  // Text color based on theme
  const textColorClass = theme === 'light' ? 'text-gray-900' : 'text-white';
  const subtextColorClass = theme === 'light' ? 'text-gray-500' : 'text-gray-300';

  return (
    <div className={cn("flex items-center", className)}>
      {variant === 'complete' ? (
        // Complete logo with text included in the image
        <div className="relative flex items-center justify-center">
          <img 
            src={logoCompletePath} 
            alt="Heirloom Identity Platform" 
            className="shrink-0 h-auto w-auto"
          />
        </div>
      ) : variant === 'icon' ? (
        // Small icon logo
        <div className="relative flex items-center justify-center">
          <img 
            src={logoIconPath} 
            alt="Heirloom Logo" 
            className="shrink-0 w-full h-full object-contain"
          />
        </div>
      ) : (
        // Full logo with emblem
        <div className="relative flex items-center justify-center">
          <img 
            src={logoFullPath} 
            alt="Heirloom Logo" 
            className="shrink-0 w-full h-full object-contain"
          />
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