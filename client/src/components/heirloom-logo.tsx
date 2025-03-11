import React from 'react';

export function HeirloomLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      width="100" 
      height="100" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rounded square background */}
      <rect 
        x="5" 
        y="5" 
        width="90" 
        height="90" 
        rx="24" 
        fill="#B8D98B" 
        stroke="#B8D98B" 
      />

      {/* Stylized H design */}
      <path 
        d="M35 30H65M35 70H65M35 30V70M65 30V70M40 43H60M40 57H60" 
        stroke="#23340E" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <rect 
        x="30" 
        y="38" 
        width="10" 
        height="10" 
        rx="1" 
        stroke="#23340E" 
        strokeWidth="3" 
        fill="none" 
      />
      <rect 
        x="60" 
        y="38" 
        width="10" 
        height="10" 
        rx="1" 
        stroke="#23340E" 
        strokeWidth="3" 
        fill="none" 
      />
      <rect 
        x="30" 
        y="52" 
        width="10" 
        height="10" 
        rx="1" 
        stroke="#23340E" 
        strokeWidth="3" 
        fill="none" 
      />
      <rect 
        x="60" 
        y="52" 
        width="10" 
        height="10" 
        rx="1" 
        stroke="#23340E" 
        strokeWidth="3" 
        fill="none" 
      />
    </svg>
  );
}

export default HeirloomLogo;