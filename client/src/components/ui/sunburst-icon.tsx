import React from 'react';

interface SunburstIconProps {
  className?: string;
  color?: string;
}

export const SunburstIcon: React.FC<SunburstIconProps> = ({ 
  className = "w-6 h-6", 
  color = "#E57B52" 
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 15L55 5L60 25M50 15L45 5L40 25M50 15L30 10L25 30M50 15L70 10L75 30M50 85L55 95L60 75M50 85L45 95L40 75M50 85L30 90L25 70M50 85L70 90L75 70M15 50L5 45L25 40M15 50L5 55L25 60M15 50L10 30L30 25M15 50L10 70L30 75M85 50L95 45L75 40M85 50L95 55L75 60M85 50L90 30L70 25M85 50L90 70L70 75"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SunburstIcon;