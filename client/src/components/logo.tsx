import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <img src="/images/logo-heirloom.png" alt="Heirloom Logo" className={className} />
  );
}