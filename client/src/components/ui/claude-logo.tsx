import React from 'react';
import claudeImage from '../../claude-color.png';

interface ClaudeLogoProps {
  className?: string;
  color?: string; // kept for backward compatibility
}

export const ClaudeLogo: React.FC<ClaudeLogoProps> = ({ 
  className = "w-6 h-6"
}) => {
  return (
    <img 
      src={claudeImage} 
      alt="Claude Logo" 
      className={className}
    />
  );
};

export default ClaudeLogo;