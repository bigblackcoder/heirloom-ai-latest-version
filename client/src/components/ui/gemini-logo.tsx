import React from 'react';

interface GeminiLogoProps {
  className?: string;
  color?: string;
}

export const GeminiLogo: React.FC<GeminiLogoProps> = ({ 
  className = "w-6 h-6", 
  color = "#1C69FF" 
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" fill="#F9F5F2" />
      <path
        d="M22 16C22 12.13 19.31 9 16 9C13 9 10 11.13 10 16C10 20.87 13 23 16 23C18.31 23 20 21.87 20 20.26C20 19.49 19.37 19 18.5 19H16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default GeminiLogo;