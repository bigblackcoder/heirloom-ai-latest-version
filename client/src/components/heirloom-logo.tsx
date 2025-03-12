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
      {variant === 'icon' ? (
        <img 
          src="/images/heirloom-icon.svg" 
          alt="Heirloom Logo" 
          className="shrink-0 w-11 h-11"
        />
      ) : (
        <svg 
          className="shrink-0"
          width="44" 
          height="44" 
          viewBox="0 0 44 44" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22 44C34.1503 44 44 34.1503 44 22C44 9.84974 34.1503 0 22 0C9.84974 0 0 9.84974 0 22C0 34.1503 9.84974 44 22 44Z" fill="#235B3C"/>
          <path d="M25.4244 18.1333H18.5756L17.6978 21.4667H26.3022L25.4244 18.1333ZM19.8889 30.8L22 22L24.1111 30.8H19.8889ZM18.5778 33H25.4222L28.2222 15.9333C28.3778 15.2667 27.8778 14.6667 27.2 14.6667H16.8C16.1222 14.6667 15.6222 15.2667 15.7778 15.9333L18.5778 33Z" fill="white"/>
        </svg>
      )}

      {withText && (
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-[#235B3C]">Heirloom</h2>
          <p className="text-gray-600">Identity Platform</p>
        </div>
      )}
    </div>
  );
}

export default HeirloomLogo;