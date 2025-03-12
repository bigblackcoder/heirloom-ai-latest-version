import React from 'react';

interface ClaudeLogoProps {
  className?: string;
  color?: string;
}

export const ClaudeLogo: React.FC<ClaudeLogoProps> = ({ 
  className = "w-6 h-6", 
  color = "#D97757" 
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="18" fill="#F9F5F2" />
      <path
        d="M20.0001 12.5C17.6555 12.5 15.4443 13.5357 13.9692 15.2682C12.494 17.0007 11.8529 19.2935 12.2044 21.5121C12.5558 23.7308 13.8714 25.6767 15.8072 26.8842C17.743 28.0917 20.1121 28.4336 22.3143 27.8263"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27.5 22.5C27.5 19.0482 25.3088 16.1463 22.3142 15.1738"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 25L27.5 22.5L29.5 27.8263"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 25.0001L12.5001 22.5001L10.5001 27.8264"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 17.5C17.5 20.9518 19.6912 23.8537 22.6858 24.8262"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ClaudeLogo;