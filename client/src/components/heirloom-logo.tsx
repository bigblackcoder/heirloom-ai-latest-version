import React from 'react';
import { cn } from '../lib/utils';

// Import logo images directly
import whiteLogo from '../assets/heirloom-white-logo.svg';

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
  // Use the same SVG white logo for all variants
  const logoIconPath = whiteLogo;              // White "H" SVG logo
  const logoFullPath = whiteLogo;              // White "H" SVG logo
  const logoCompletePath = whiteLogo;          // White "H" SVG logo

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
        // Small icon logo - white version
        <div className="relative flex items-center justify-center">
          <img 
            src={logoIconPath} 
            alt="Heirloom Logo" 
            className="shrink-0 w-full h-full object-contain"
          />
        </div>
      ) : (
        // Full logo with emblem - white version
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
          <h2 className="text-2xl font-bold text-white">Heirloom</h2>
          <p className="text-gray-300">Identity Platform</p>
        </div>
      )}
    </div>
  );
}

export default HeirloomLogo;