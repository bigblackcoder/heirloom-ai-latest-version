import React from 'react';

interface AnthropicLogoProps {
  className?: string;
  color?: string; // kept for backward compatibility
}

export const AnthropicLogo: React.FC<AnthropicLogoProps> = ({ 
  className = "w-6 h-6"
}) => {
  return (
    <img 
      src="/images/anthropic.png" 
      alt="Anthropic Logo" 
      className={className}
    />
  );
};

export default AnthropicLogo;