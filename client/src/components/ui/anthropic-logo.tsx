import React from 'react';

interface AnthropicLogoProps {
  className?: string;
  color?: string;
}

export const AnthropicLogo: React.FC<AnthropicLogoProps> = ({ 
  className = "w-6 h-6", 
  color = "#5C44E4" 
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="18" fill="#F9F5F2" />
      <rect x="13" y="13" width="14" height="14" rx="4" fill={color} />
      <path
        d="M21.5 23.5L23 18.5H20.5L19 23.5H21.5ZM17 23.5L18.5 18.5H16L14.5 23.5H17Z"
        fill="white"
      />
      <path
        d="M22 23.5L23.5 18.5H26L24.5 23.5H22Z"
        fill="white"
      />
    </svg>
  );
};

export default AnthropicLogo;