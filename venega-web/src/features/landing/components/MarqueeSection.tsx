'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

const words = ['Local', 'Sûr', 'Simple', 'Sécurisé', 'Transparent', 'Communautaire'];

export default function MarqueeSection() {
  return (
    <div className="overflow-hidden bg-white border-y border-border py-5">
      <div className="flex gap-16 w-max animate-[marquee_22s_linear_infinite]">
        {[...words, ...words, ...words, ...words].map((word, i) => (
          <div key={i} className="flex items-center gap-2.5 text-text-muted font-bold text-sm whitespace-nowrap">
            <ShieldCheck size={18} className="text-primary" />
            {word}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
