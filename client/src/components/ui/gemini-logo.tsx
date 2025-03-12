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
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="18" fill="#F9F5F2" />
      <path
        d="M26 20C26 15.5 23 13 20 13C17 13 14 15 14 20C14 25 17 27 20 27C23 27 24.5 25 24.5 22H20"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  );
};

export default GeminiLogo;