'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function DownloadBadges() {
  return (
    <div className="flex flex-wrap gap-3">
      {/* App Store Badge */}
      <motion.a
        href="#"
        whileHover={{ translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-[#0B0D0B] text-white rounded-xl px-4 py-2 cursor-pointer transition-colors hover:bg-black"
        onClick={(e) => {
          e.preventDefault();
          alert('Bientôt disponible sur l\'App Store');
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
          <path d="M16.4 1c.1 1-.3 2-1 2.8-.7.8-1.8 1.4-2.8 1.3-.1-1 .4-2 1-2.8.7-.8 1.9-1.4 2.8-1.3zM20 17.2c-.5 1.1-.8 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.4.9-3.7.9c-1.6 0-2.8-1.5-3.7-2.9C1.4 17.4.5 13 1.8 10c.6-1.5 1.8-2.5 3-2.5 1.4 0 2.3 1 3.5 1 1.1 0 1.8-1 3.7-1 1.1 0 2.3.3 3.2 1.6-2.8 1.5-2.3 5.5.8 6.6-.3.7-.4.9-1 1.5z" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] opacity-80">Télécharger sur</span>
          <span className="text-sm font-bold font-heading">App Store</span>
        </div>
      </motion.a>

      {/* Google Play Badge */}
      <motion.a
        href="#"
        whileHover={{ translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-[#0B0D0B] text-white rounded-xl px-4 py-2 cursor-pointer transition-colors hover:bg-black"
        onClick={(e) => {
          e.preventDefault();
          alert('Bientôt disponible sur Google Play');
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M3.6 2.3c-.4.3-.6.8-.6 1.4v16.6c0 .6.2 1.1.6 1.4l.1.1L13 12.6v-.2L3.7 2.2z" fill="#4285F4"/>
          <path d="M16.1 15.7l-3.1-3.1v-.2l3.1-3.1 3.7 2.1c1 .6 1 1.5 0 2.1z" fill="#FBBC05"/>
          <path d="M16.1 8.3L12.9 12l-9.3 9.3c.4.4 1 .4 1.7 0l10.8-3z" fill="#34A853"/>
          <path d="M16.1 15.7l-10.8 6c-.7.4-1.3.4-1.7 0l9.4-9.3z" fill="#EA4335"/>
        </svg>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] opacity-80">Disponible sur</span>
          <span className="text-sm font-bold font-heading">Google Play</span>
        </div>
      </motion.a>
    </div>
  );
}
