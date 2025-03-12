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
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 10L10 50L50 90L90 50L50 10Z"
        fill={color}
      />
    </svg>
  );
};

export default GeminiLogo;