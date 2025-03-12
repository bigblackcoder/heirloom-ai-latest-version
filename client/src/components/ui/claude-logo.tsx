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
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" fill="#F9F5F2" />
      <circle cx="16" cy="16" r="11" stroke={color} strokeWidth="2" />
      <path
        d="M16 7C13.8 7 11.7 7.8 10.1 9.3C8.5 10.8 7.6 12.9 7.6 15C7.6 17.1 8.5 19.2 10.1 20.7C11.7 22.2 13.8 23 16 23"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 7C18.2 7 20.3 7.8 21.9 9.3C23.5 10.8 24.4 12.9 24.4 15C24.4 17.1 23.5 19.2 21.9 20.7C20.3 22.2 18.2 23 16 23"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 12H22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 18H22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ClaudeLogo;