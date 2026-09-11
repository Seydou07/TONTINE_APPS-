import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'w-8 h-8' }: LogoProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Image src="/venega-icon.png" alt="Venega" fill className="object-contain" priority />
    </span>
  );
}
