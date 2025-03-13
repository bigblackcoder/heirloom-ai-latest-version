import React from 'react';
import anthropicImage from '../../anthropic.png';

interface AnthropicLogoProps {
  className?: string;
  color?: string; // kept for backward compatibility
}

export const AnthropicLogo: React.FC<AnthropicLogoProps> = ({ 
  className = "w-6 h-6"
}) => {
  return (
    <img 
      src={anthropicImage} 
      alt="Anthropic Logo" 
      className={className}
    />
  );
};

export default AnthropicLogo;