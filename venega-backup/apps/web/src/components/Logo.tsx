import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F8563"/>
          <stop offset="100%" stopColor="#063C2C"/>
        </linearGradient>
      </defs>
      
      {/* Blade 1: Gold (Top) */}
      <path
        d="M24 4 C29 6, 33 10, 34 16 C35 22, 32 28, 28 31 L24 26 L20 31 C16 28, 13 22, 14 16 C15 10, 19 6, 24 4 Z"
        fill="#D9A441"
        transform="rotate(0 24 24)"
      />
      
      {/* Blade 2: Emerald Green */}
      <path
        d="M24 4 C29 6, 33 10, 34 16 C35 22, 32 28, 28 31 L24 26 L20 31 C16 28, 13 22, 14 16 C15 10, 19 6, 24 4 Z"
        fill="url(#emeraldGradient)"
        transform="rotate(51.4 24 24)"
      />
      
      {/* Blade 3: Emerald Green */}
      <path
        d="M24 4 C29 6, 33 10, 34 16 C35 22, 32 28, 28 31 L24 26 L20 31 C16 28, 13 22, 14 16 C15 10, 19 6, 24 4 Z"
        fill="url(#emeraldGradient)"
        transform="rotate(102.8 24 24)"
      />
      
      {/* Blade 4: Emerald Green */}
      <path
        d="M24 4 C29 6, 33 10, 34 16 C35 22, 32 28, 28 31 L24 26 L20 31 C16 28, 13 22, 14 16 C15 10, 19 6, 24 4 Z"
        fill="url(#emeraldGradient)"
        transform="rotate(154.2 24 24)"
      />
      
      {/* Blade 5: Emerald Green */}
      <path
        d="M24 4 C29 6, 33 10, 34 16 C35 22, 32 28, 28 31 L24 26 L20 31 C16 28, 13 22, 14 16 C15 10, 19 6, 24 4 Z"
        fill="url(#emeraldGradient)"
        transform="rotate(205.6 24 24)"
      />
      
      {/* Blade 6: Emerald Green */}
      <path
        d="M24 4 C29 6, 33 10, 34 16 C35 22, 32 28, 28 31 L24 26 L20 31 C16 28, 13 22, 14 16 C15 10, 19 6, 24 4 Z"
        fill="url(#emeraldGradient)"
        transform="rotate(257 24 24)"
      />
      
      {/* Blade 7: Emerald Green */}
      <path
        d="M24 4 C29 6, 33 10, 34 16 C35 22, 32 28, 28 31 L24 26 L20 31 C16 28, 13 22, 14 16 C15 10, 19 6, 24 4 Z"
        fill="url(#emeraldGradient)"
        transform="rotate(308.4 24 24)"
      />
      
      {/* Center Negative Space */}
      <circle cx="24" cy="24" r="6" fill="white"/>
    </svg>
  );
}
