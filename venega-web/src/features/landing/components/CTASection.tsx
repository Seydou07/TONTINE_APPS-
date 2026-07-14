'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="bg-surface">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-0 pb-16 md:pb-[70px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#0F8563] via-primary to-primary-dark rounded-[28px] px-8 py-14 text-center text-white relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="font-heading text-[30px] font-bold mb-3.5">
              Prêt à digitaliser votre tontine ?
            </h2>
            <p className="text-white/80 text-[14.5px] mb-7 max-w-lg mx-auto">
              Créez votre compte en moins de deux minutes. Sur mobile, ou directement depuis votre navigateur.
            </p>

            <div className="flex justify-center gap-3 mb-4.5 flex-wrap">
              <div className="flex items-center gap-2.5 bg-black rounded-xl px-4 py-2.5 text-white cursor-pointer hover:-translate-y-0.5 transition-transform">
                <Smartphone size={20} />
                <div className="flex flex-col leading-tight">
                  <span className="text-[9px] opacity-80">Télécharger sur</span>
                  <span className="text-sm font-bold font-heading">App Store</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-black rounded-xl px-4 py-2.5 text-white cursor-pointer hover:-translate-y-0.5 transition-transform">
                <Smartphone size={20} />
                <div className="flex flex-col leading-tight">
                  <span className="text-[9px] opacity-80">Disponible sur</span>
                  <span className="text-sm font-bold font-heading">Google Play</span>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold rounded-full px-8 py-3.5 text-[15px] transition-colors"
            >
              Ou continuer sur navigateur →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
