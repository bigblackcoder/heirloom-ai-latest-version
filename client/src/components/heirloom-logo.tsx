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
  
  // Render SVG logo based on theme
  const renderLogo = () => {
    if (theme === 'outline') {
      // Green outline logo
      return (
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 512 512" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M413.65,98.35h-53.96c-29.82,0-53.96,24.15-53.96,53.96v53.96H206.28v-53.96
            c0-29.82-24.15-53.96-53.96-53.96h-53.96c-29.82,0-53.96,24.15-53.96,53.96v53.96c0,29.82,24.15,53.96,53.96,53.96h53.96
            v53.96c0,29.82,24.15,53.96,53.96,53.96h53.96v53.96c0,29.82,24.15,53.96,53.96,53.96h53.96c29.82,0,53.96-24.15,53.96-53.96
            v-53.96c0-29.82-24.15-53.96-53.96-53.96h-53.96v-53.96h102.16c29.82,0,53.96-24.15,53.96-53.96v-53.96
            C467.61,122.5,443.47,98.35,413.65,98.35z"
            stroke="#1e3c0d"
            strokeWidth="15"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (theme === 'light') {
      // Dark logo (for light backgrounds)
      return (
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 44 44" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M35.75,8.25h-4.667c-2.578,0-4.666,2.088-4.666,4.667v4.666H17.583v-4.666c0-2.578-2.088-4.667-4.666-4.667H8.25
            c-2.578,0-4.667,2.088-4.667,4.667v4.666c0,2.578,2.088,4.667,4.667,4.667h4.667v4.667c0,2.578,2.088,4.666,4.666,4.666h4.667
            v4.667c0,2.578,2.088,4.667,4.667,4.667h4.667c2.578,0,4.666-2.088,4.666-4.667v-4.667c0-2.578-2.088-4.666-4.666-4.666h-4.667
            v-4.667h8.834c2.578,0,4.666-2.088,4.666-4.667v-4.666C40.417,10.338,38.328,8.25,35.75,8.25z"
            fill="#1e3c0d"
          />
        </svg>
      );
    } else {
      // White logo (for dark backgrounds)
      return (
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 44 44" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M35.75,8.25h-4.667c-2.578,0-4.666,2.088-4.666,4.667v4.666H17.583v-4.666c0-2.578-2.088-4.667-4.666-4.667H8.25
            c-2.578,0-4.667,2.088-4.667,4.667v4.666c0,2.578,2.088,4.667,4.667,4.667h4.667v4.667c0,2.578,2.088,4.666,4.666,4.666h4.667
            v4.667c0,2.578,2.088,4.667,4.667,4.667h4.667c2.578,0,4.666-2.088,4.666-4.667v-4.667c0-2.578-2.088-4.666-4.666-4.666h-4.667
            v-4.667h8.834c2.578,0,4.666-2.088,4.666-4.667v-4.666C40.417,10.338,38.328,8.25,35.75,8.25z"
            fill="#ffffff"
          />
        </svg>
      );
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      {variant === 'complete' ? (
        // Complete logo with text included in the image
        <div className="relative flex items-center justify-center">
          {renderLogo()}
        </div>
      ) : variant === 'icon' ? (
        // Small icon logo
        <div className="relative flex items-center justify-center">
          {renderLogo()}
        </div>
      ) : (
        // Full logo with emblem
        <div className="relative flex items-center justify-center">
          {renderLogo()}
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