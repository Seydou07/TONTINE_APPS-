'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0F8563] via-primary to-primary-dark">
      <div className="absolute -top-20 left-[10%] w-[280px] h-[280px] rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-[1180px] mx-auto px-6 md:px-12 py-16 md:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Texte */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 max-w-[560px]"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/14 text-white rounded-full text-xs font-bold mb-5">
            <span className="text-sm">🇧🇫</span>
            Fait pour le Burkina Faso · Orange Money &amp; Moov Money
          </div>

          <h1 className="font-heading text-3xl md:text-[44px] font-extrabold text-white leading-[1.15] mb-5">
            Vos tontines,{' '}
            <span className="text-accent">en toute transparence</span>
          </h1>

          <p className="text-base text-white/82 leading-relaxed mb-8">
            Venega digitalise la tontine et la caisse de solidarité : cotisez,
            suivez les tours et gérez votre fonds d&apos;entraide depuis votre
            téléphone ou votre ordinateur, sans jamais perdre confiance.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold rounded-full px-7 py-3.5 text-[15px] transition-colors"
            >
              Créer mon compte gratuitement
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-white/50 text-white hover:bg-white/10 font-semibold rounded-full px-7 py-3.5 text-[15px] transition-colors"
            >
              Voir comment ça marche
            </Link>
          </div>

          <div className="flex gap-4 mb-8">
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

          <div className="flex gap-8">
            <div>
              <div className="font-heading text-2xl font-extrabold text-white">2 400+</div>
              <div className="text-[11.5px] text-white/70 font-semibold">Membres actifs</div>
            </div>
            <div>
              <div className="font-heading text-2xl font-extrabold text-white">340+</div>
              <div className="text-[11.5px] text-white/70 font-semibold">Cercles gérés</div>
            </div>
            <div>
              <div className="font-heading text-2xl font-extrabold text-white">98%</div>
              <div className="text-[11.5px] text-white/70 font-semibold">Cotisations à temps</div>
            </div>
          </div>
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-shrink-0 w-[300px]"
        >
          <div className="w-[280px] bg-[#0B0D0B] rounded-[38px] p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,.5)] rotate-[3deg]">
            <div className="bg-[#FAF7F1] rounded-[26px] p-4 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0F8563] to-primary-dark rounded-2xl p-4 mb-3">
                <div className="text-white/70 text-[9px] font-bold">TOTAL COTISÉ CE MOIS</div>
                <div className="text-white font-heading text-xl font-extrabold mt-1">18 500 F CFA</div>
                <div className="h-[5px] bg-white/25 rounded-full mt-2.5 overflow-hidden">
                  <div className="h-full w-[64%] bg-accent rounded-full" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 flex items-center gap-2.5 mb-2 shadow-[0_4px_10px_rgba(0,0,0,.05)]">
                <div className="w-7 h-7 rounded-lg bg-primary-tint flex-shrink-0" />
                <div>
                  <div className="text-[10.5px] font-bold text-text-main">Tontine Bureau</div>
                  <div className="text-[8.5px] text-text-muted">Tour 3/8 · 1 000 F/semaine</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 flex items-center gap-2.5 mb-2 shadow-[0_4px_10px_rgba(0,0,0,.05)]">
                <div className="w-7 h-7 rounded-lg bg-accent-tint flex-shrink-0" />
                <div>
                  <div className="text-[10.5px] font-bold text-text-main">Tontine Moto</div>
                  <div className="text-[8.5px] text-text-muted">Tour 2/6 · en nature</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 flex items-center gap-2.5 shadow-[0_4px_10px_rgba(0,0,0,.05)]">
                <div className="w-7 h-7 rounded-lg bg-[#EFE6F4] flex-shrink-0" />
                <div>
                  <div className="text-[10.5px] font-bold text-text-main">Caisse de Solidarité</div>
                  <div className="text-[8.5px] text-text-muted">64 000 / 100 000 F</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
