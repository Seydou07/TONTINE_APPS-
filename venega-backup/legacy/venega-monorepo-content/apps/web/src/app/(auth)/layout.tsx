'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-dark relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-light/40 rounded-full blur-3xl" />
        
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
            alt="Groupe de personnes travaillant ensemble"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent/40" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
              <Logo className="w-10 h-10" />
            </div>
            <span className="font-heading font-extrabold text-3xl text-white tracking-tight">Venega</span>
          </Link>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              Bienvenue dans la nouvelle ère de la tontine
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-md">
              Rejoignez des milliers de Burkinabè qui font confiance à Venega pour gérer
              leur épargne et leur caisse de solidarité en toute transparence.
            </p>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <p className="text-white/90 italic mb-4">
              “Venega a complètement simplifié la gestion de notre tontine familiale.
              Plus de litiges, tout est clair et sécurisé.”
            </p>
            <div className="flex items-center gap-3">
              <Image
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80"
                alt="Aminata Ouédraogo"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-accent"
              />
              <div>
                <p className="font-heading font-semibold text-white">
                  Aminata Ouédraogo
                </p>
                <p className="text-white/70 text-sm">Présidente de tontine</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Link href="/" className="flex items-center gap-3">
              <Logo className="w-10 h-10" />
              <span className="font-heading font-extrabold text-2xl text-primary-dark tracking-tight">Venega</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
