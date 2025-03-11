import React from 'react';

export function HeirloomLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      width="44" 
      height="44" 
      viewBox="0 0 44 44" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rounded square background */}
      <rect 
        x="1" 
        y="1" 
        width="42" 
        height="42" 
        rx="12" 
        fill="#B8D98B" 
        stroke="#B8D98B" 
      />

      {/* Stylized H design */}
      <path 
        d="M16 14H28M16 30H28M16 14V30M28 14V30M18 19H26M18 25H26" 
        stroke="#23340E" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <rect 
        x="14" 
        y="17" 
        width="4" 
        height="4" 
        rx="0.5" 
        stroke="#23340E" 
        strokeWidth="1.5" 
        fill="none" 
      />
      <rect 
        x="26" 
        y="17" 
        width="4" 
        height="4" 
        rx="0.5" 
        stroke="#23340E" 
        strokeWidth="1.5" 
        fill="none" 
      />
      <rect 
        x="14" 
        y="23" 
        width="4" 
        height="4" 
        rx="0.5" 
        stroke="#23340E" 
        strokeWidth="1.5" 
        fill="none" 
      />
      <rect 
        x="26" 
        y="23" 
        width="4" 
        height="4" 
        rx="0.5" 
        stroke="#23340E" 
        strokeWidth="1.5" 
        fill="none" 
      />
    </svg>
  );
}

export default HeirloomLogo;