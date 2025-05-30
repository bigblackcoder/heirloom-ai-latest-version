import React from 'react';
import { cn } from '../lib/utils';
// Use public asset path for better reliability
// import HeirloomLogoImage from '../assets/images/logo-heirloom.png';

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
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative flex items-center justify-center w-full h-full">
        <img 
          src="/images/logo-heirloom.png" 
          alt="Heirloom Logo" 
          className="w-full h-full object-contain"
        />
      </div>

      {withText && variant !== 'complete' && (
        <div className="ml-4">
          <h2 className={cn(
            "text-2xl font-bold",
            theme === 'dark' ? "text-white" : "text-[#254f16]"
          )}>
            Heirloom
          </h2>
          <p className={theme === 'dark' ? "text-gray-300" : "text-gray-600"}>
            Identity Platform
          </p>
        </div>
      )}
    </div>
  );
}

export default HeirloomLogo;