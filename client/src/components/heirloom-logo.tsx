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
  // Paths to logo image files
  const logoIconPath = "/images/heirloom-icon.png";    // Green "H" logo
  const logoFullPath = "/images/heirloom-full.png";    // White "H" logo
  const logoCompletePath = "/images/heirloom-complete.png";  // White "H" logo (same as full for now)

  return (
    <div className={cn("flex items-center", className)}>
      {variant === 'complete' ? (
        // Complete logo with text included in the image
        <div className="relative bg-[#235B3C] rounded-lg p-1">
          <img 
            src={logoCompletePath} 
            alt="Heirloom Identity Platform" 
            className="shrink-0 h-auto w-auto"
          />
        </div>
      ) : variant === 'icon' ? (
        // Small icon logo - green version on transparent background
        <div className="relative flex items-center justify-center">
          <img 
            src={logoIconPath} 
            alt="Heirloom Logo" 
            className="shrink-0 w-full h-full object-contain"
          />
        </div>
      ) : (
        // Full logo with emblem - white version on green background
        <div className="relative bg-[#235B3C] rounded-lg p-1">
          <img 
            src={logoFullPath} 
            alt="Heirloom Logo" 
            className="shrink-0 w-full h-full object-contain"
          />
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