import React from 'react';
import { cn } from '../lib/utils';

interface HeirloomLogoProps {
  className?: string;
  variant?: 'icon' | 'full' | 'complete';
  withText?: boolean;
  theme?: 'light' | 'dark' | 'outline';
}

export function HeirloomLogo({ 
  className = "w-10 h-10", 
  variant = 'icon',
  withText = false,
  theme = 'dark'
}: HeirloomLogoProps) {
  
  // Use the heirloom_white.png for all logo variations as requested
  const logoSrc = "/attached_assets/heirloom_white.png";

  return (
    <div className={cn("flex items-center", className)}>
      {variant === 'complete' ? (
        // Complete logo with text included in the image
        <div className="relative flex items-center justify-center">
          <img 
            src={logoSrc} 
            alt="Heirloom Identity Platform" 
            className="w-full h-full object-contain"
          />
        </div>
      ) : variant === 'icon' ? (
        // Small icon logo
        <div className="relative flex items-center justify-center">
          <img 
            src={logoSrc} 
            alt="Heirloom Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        // Full logo with emblem
        <div className="relative flex items-center justify-center">
          <img 
            src={logoSrc} 
            alt="Heirloom Logo" 
            className="w-full h-full object-contain"
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