import React from 'react';
import { cn } from '../lib/utils';

// Import logo images directly
import whiteLogo from '../assets/heirloom-white-logo.png';
import darkLogo from '../assets/heirloom-dark-logo.png';

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
  // Use the appropriate logo based on theme
  const logoPath = theme === 'light' ? darkLogo : whiteLogo;
  
  // All variants use the same logo file for now, but we could have different sizes/crops in the future
  const logoIconPath = logoPath;
  const logoFullPath = logoPath;
  const logoCompletePath = logoPath;

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