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
        <img 
          src="/images/heirloom-logo-full.jpeg" 
          alt="Heirloom Identity Platform" 
          className="shrink-0 h-auto w-auto"
        />
      ) : variant === 'icon' ? (
        // Small icon logo
        <img 
          src="/images/heirloom-icon-alt.jpeg" 
          alt="Heirloom Logo" 
          className="shrink-0 w-11 h-11 rounded-full"
        />
      ) : (
        // Full logo with emblem
        <img 
          src="/images/heirloom-icon.svg" 
          alt="Heirloom Logo" 
          className="shrink-0 w-11 h-11"
        />
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