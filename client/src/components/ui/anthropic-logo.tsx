import React from 'react';

interface AnthropicLogoProps {
  className?: string;
  color?: string;
}

export const AnthropicLogo: React.FC<AnthropicLogoProps> = ({ 
  className = "w-6 h-6", 
  color = "#FFFFFF" 
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 85L40 15H55L82 85H67L60 65H35L28 85H18ZM40 50H55L50 35L47.5 25L45 35L40 50Z"
        fill={color}
      />
    </svg>
  );
};

export default AnthropicLogo;