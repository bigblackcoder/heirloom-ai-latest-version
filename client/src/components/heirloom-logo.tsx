import React from 'react';
import { cn } from '../lib/utils';

// Import logo images directly
import iconLogo from '../assets/heirloom-icon.png';
import fullLogo from '../assets/heirloom-full.png';
import transparentLogo from '../assets/heirloom-transparent.png';

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
  // Use imported logo assets
  const logoIconPath = iconLogo;               // Green "H" logo
  const logoFullPath = transparentLogo;        // Transparent white "H" logo
  const logoCompletePath = transparentLogo;    // Using transparent logo for complete variant too

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
        // Small icon logo - green version on transparent background
        <div className="relative flex items-center justify-center">
          <img 
            src={logoIconPath} 
            alt="Heirloom Logo" 
            className="shrink-0 w-full h-full object-contain"
          />
        </div>
      ) : (
        // Full logo with emblem - transparent white version
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
          <h2 className="text-2xl font-bold text-[#235B3C]">Heirloom</h2>
          <p className="text-gray-600">Identity Platform</p>
        </div>
      )}
    </div>
  );
}

export default HeirloomLogo;