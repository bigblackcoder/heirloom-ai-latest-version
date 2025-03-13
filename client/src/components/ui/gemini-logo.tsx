import React from 'react';
import geminiImage from '../../gemini-color.png';

interface GeminiLogoProps {
  className?: string;
  color?: string; // kept for backward compatibility
}

export const GeminiLogo: React.FC<GeminiLogoProps> = ({ 
  className = "w-6 h-6"
}) => {
  return (
    <img 
      src={geminiImage} 
      alt="Gemini Logo" 
      className={className}
    />
  );
};

export default GeminiLogo;