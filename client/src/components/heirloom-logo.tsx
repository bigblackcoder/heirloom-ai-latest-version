import React from 'react';

export function HeirloomLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="/images/heirloom-logo.svg" 
      alt="Heirloom Logo" 
      className={className}
    />
  );
}

export default HeirloomLogo;