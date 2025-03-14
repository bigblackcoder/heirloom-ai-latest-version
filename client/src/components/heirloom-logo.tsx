import React from 'react';
import { cn } from '../lib/utils';

// Logo paths for different variants
const logoIconGreen = '/images/heirloom-icon.png'; // Green logo on transparent
const logoIconWhite = '/images/heirloom-full.png'; // White logo on black

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
  // Determine which logo to use based on theme
  const logoSrc = theme === 'light' ? logoIconGreen : logoIconWhite;
  
  // Text color based on theme
  const textColorClass = theme === 'light' ? 'text-gray-900' : 'text-white';
  const subtextColorClass = theme === 'light' ? 'text-gray-500' : 'text-gray-300';

  return (
    <div className={cn("flex items-center", className)}>
      {variant === 'complete' ? (
        // Complete logo with text included in the image
        <div className="flex items-center">
          <img 
            src={logoSrc} 
            alt="Heirloom Identity Platform" 
            className="h-auto w-auto object-contain"
          />
          <div className="ml-4">
            <h2 className={`text-2xl font-bold ${textColorClass}`}>Heirloom</h2>
            <p className={subtextColorClass}>Identity Platform</p>
          </div>
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
        // Full logo with emblem and text
        <div className="flex items-center">
          <img 
            src={logoSrc} 
            alt="Heirloom Logo" 
            className="w-10 h-10 object-contain"
          />
          {withText && (
            <div className="ml-4">
              <h2 className={`text-2xl font-bold ${textColorClass}`}>Heirloom</h2>
              <p className={subtextColorClass}>Identity Platform</p>
            </div>
          )}
        </div>
      )}

      {withText && variant !== 'complete' && variant !== 'full' && (
        <div className="ml-4">
          <h2 className={`text-2xl font-bold ${textColorClass}`}>Heirloom</h2>
          <p className={subtextColorClass}>Identity Platform</p>
        </div>
      )}
    </div>
  );
}

export default HeirloomLogo;