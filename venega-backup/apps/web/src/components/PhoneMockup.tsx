'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PhoneMockup() {
  return (
    <motion.div
      className="relative w-full max-w-[320px] lg:max-w-[380px]"
      initial={{ opacity: 0, y: 40, rotate: -8 }}
      animate={{ opacity: 1, y: 0, rotate: 3 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3
      }}
    >
      {/* Floating shadow behind phone */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[80px] bg-primary/20 blur-3xl rounded-full" />
      
      {/* Phone Frame */}
      <div className="bg-[#111827] rounded-[3rem] p-3 shadow-2xl relative border border-white/10">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#111827] rounded-full z-20" />
        
        {/* Screen */}
        <div className="bg-gradient-to-br from-bg to-primary-tint/30 rounded-[2.5rem] overflow-hidden relative h-[600px]">
          {/* App Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-5 pt-10">
            <div className="flex justify-between items-center mb-4">
              <div className="text-white/80 text-sm font-medium">Bonjour, Aminata 👋</div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                <Image 
                  src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80" 
                  alt="Profil"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-white/70 text-xs font-medium uppercase tracking-wider">Total cotisé ce mois</div>
              <div className="text-white text-3xl font-heading font-extrabold">185 000 F</div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full"
              />
            </div>
          </div>

          {/* Cards Section */}
          <div className="p-4 space-y-3 mt-2">
            {/* Tontine 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-tint to-primary flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                    <span className="text-primary-dark font-bold text-xs">T</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-heading font-bold text-text">Tontine Bureau</div>
                  <div className="text-xs text-text-muted">Tour 3/8 • 25 000 F/sem</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-muted">Prochain</div>
                  <div className="font-bold text-primary-dark">+50 000</div>
                </div>
              </div>
            </motion.div>

            {/* Tontine 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-tint to-accent flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                    <span className="text-accent-dark font-bold text-xs">M</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-heading font-bold text-text">Tontine Moto</div>
                  <div className="text-xs text-text-muted">Tour 2/6 • En nature</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-muted">À payer</div>
                  <div className="font-bold text-accent-dark">15 000</div>
                </div>
              </div>
            </motion.div>

            {/* Caisse de Solidarité */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="bg-gradient-to-br from-purple-tint to-purple/10 rounded-2xl p-4 border border-purple/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple to-purple-tint flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                    <span className="text-purple font-bold text-xs">❤️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-heading font-bold text-text">Caisse Solidarité</div>
                  <div className="text-xs text-text-muted">640 000 / 1 000 000 F</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-muted">Disponible</div>
                  <div className="font-bold text-purple">640k</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom nav hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-border rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
