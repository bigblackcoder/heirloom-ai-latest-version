import React from 'react';
import { cn } from '../lib/utils';

interface HeirloomLogoProps {
  className?: string;
  variant?: 'icon' | 'full';
  withText?: boolean;
}

export function HeirloomLogo({ 
  className = "w-10 h-10", 
  variant = 'icon',
  withText = false
}: HeirloomLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <svg 
        className="shrink-0"
        width="44" 
        height="44" 
        viewBox="0 0 160 160" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded square background */}
        <rect 
          x="0" 
          y="0" 
          width="160" 
          height="160" 
          rx="56" 
          fill="#C9E9A0" 
        />
        {/* Inner lighter area */}
        <rect 
          x="40" 
          y="40" 
          width="80" 
          height="80" 
          rx="20" 
          fill="#DBF4B7" 
        />
        {/* Stylized document/capsule icon */}
        <path 
          d="M65 60H95M65 100H95M65 60V100M95 60V100"
          stroke="#23340E" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M70 75H90M70 85H90" 
          stroke="#23340E" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <rect 
          x="62" 
          y="68" 
          width="12" 
          height="12" 
          rx="2" 
          stroke="#23340E" 
          strokeWidth="4" 
          fill="none" 
        />
        <rect 
          x="86" 
          y="68" 
          width="12" 
          height="12" 
          rx="2" 
          stroke="#23340E" 
          strokeWidth="4" 
          fill="none" 
        />
        <rect 
          x="62" 
          y="82" 
          width="12" 
          height="12" 
          rx="2" 
          stroke="#23340E" 
          strokeWidth="4" 
          fill="none" 
        />
        <rect 
          x="86" 
          y="82" 
          width="12" 
          height="12" 
          rx="2" 
          stroke="#23340E" 
          strokeWidth="4" 
          fill="none" 
        />
      </svg>

      {withText && (
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-white">Heirloom</h2>
          <p className="text-gray-300">Identity Platform</p>
        </div>
      )}
    </div>
  );
}

export default HeirloomLogo;