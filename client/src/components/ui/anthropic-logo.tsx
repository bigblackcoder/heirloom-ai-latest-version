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
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" fill="#F9F5F2" />
      <rect x="8" y="8" width="16" height="16" rx="4" fill={color} />
      <path
        d="M16 21C14.3431 21 13 19.6569 13 18V14C13 12.3431 14.3431 11 16 11C17.6569 11 19 12.3431 19 14V18C19 19.6569 17.6569 21 16 21Z"
        fill="white"
      />
    </svg>
  );
};

export default AnthropicLogo;