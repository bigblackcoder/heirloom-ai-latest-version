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
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative flex items-center justify-center w-full h-full">
        <img 
          src="/attached_assets/logo-heirloom.png" 
          alt="Heirloom Logo" 
          className="w-full h-full object-contain"
        />
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