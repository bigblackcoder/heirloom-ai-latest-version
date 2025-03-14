import React from 'react';
import { cn } from '../lib/utils';

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
  // Text color based on theme
  const textColorClass = theme === 'light' ? 'text-gray-900' : 'text-white';
  const subtextColorClass = theme === 'light' ? 'text-gray-500' : 'text-gray-300';
  
  // Logo fill color based on theme
  const logoFillColor = theme === 'light' ? '#1e3c0d' : '#ffffff';
  
  // SVG logo
  const HLogoSvg = (
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
        fill={logoFillColor}
      />
    </svg>
  );

  // Complete logo component with text
  const CompleteLogo = (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {HLogoSvg}
      </div>
      <div className="ml-3">
        <h2 className={`text-2xl font-bold ${textColorClass}`}>Heirloom</h2>
        <p className={subtextColorClass}>Identity Platform</p>
      </div>
    </div>
  );

  return (
    <div className={cn("flex items-center", className)}>
      {variant === 'complete' ? (
        // Complete logo with text
        CompleteLogo
      ) : variant === 'icon' ? (
        // Small icon logo
        <div className="relative flex items-center justify-center">
          {HLogoSvg}
        </div>
      ) : (
        // Full logo with emblem and text
        <div className="flex items-center">
          <div className="relative flex items-center justify-center">
            {HLogoSvg}
          </div>
          {withText && (
            <div className="ml-4">
              <h2 className={`text-2xl font-bold ${textColorClass}`}>Heirloom</h2>
              <p className={subtextColorClass}>Identity Platform</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HeirloomLogo;