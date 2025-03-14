import React from 'react';
import { cn } from '../lib/utils';

interface HeirloomLogoProps {
  className?: string;
  variant?: 'icon' | 'full' | 'complete';
  withText?: boolean;
  theme?: 'light' | 'dark' | 'outline';
}

// Create a simple SVG logo to avoid any path issues
const HLogoBrandIcon = () => (
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
      fill="#7c9861"
    />
  </svg>
);

export function HeirloomLogo({ 
  className = "w-10 h-10", 
  variant = 'icon',
  withText = false,
  theme = 'dark'
}: HeirloomLogoProps) {
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative flex items-center justify-center w-full h-full">
        <HLogoBrandIcon />
      </div>

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