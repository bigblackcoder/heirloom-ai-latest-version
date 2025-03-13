import React from 'react';

interface GeminiLogoProps {
  className?: string;
  color?: string; // kept for backward compatibility
}

export const GeminiLogo: React.FC<GeminiLogoProps> = ({ 
  className = "w-6 h-6"
}) => {
  return (
    <img 
      src="/images/gemini-color.png" 
      alt="Gemini Logo" 
      className={className}
    />
  );
};

export default GeminiLogo;