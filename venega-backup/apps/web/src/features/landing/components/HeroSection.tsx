'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Coins, Users, Zap } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/5 via-transparent to-accent/5" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="section relative z-10">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-tint text-primary-dark rounded-full text-sm font-semibold mb-6">
              <Zap size={16} />
              Nouvelle génération de tontine
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-main mb-6 leading-tight">
              Gérez votre <span className="text-primary">tontine</span> et votre{' '}
              <span className="text-accent">caisse de solidarité</span> en toute transparence
            </h1>

            <p className="text-lg text-text-muted mb-8 leading-relaxed max-w-lg">
              Venega digitalise la pratique traditionnelle de la tontine rotative et de
              la caisse de solidarité. Cotisez, épargnez et entraidez-vous via Orange
              Money ou Moov Money, avec une traçabilité absolue.
            </p>

            <div className="flex flex-nowrap gap-4">
              <Link href="/register" className="btn-primary text-lg px-8 py-4 whitespace-nowrap">
                Créer mon compte gratuitement
                <ArrowRight size={20} />
              </Link>
              <Link href="#how-it-works" className="btn-outline text-lg px-8 py-4 whitespace-nowrap">
                Voir comment ça marche
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 flex-wrap">
              {['100% sécurisé', 'Intégration CinetPay', 'Support francophone'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-text-muted">
                  <CheckCircle2 size={20} className="text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:pl-16"
          >
            <div className="relative z-10 -mt-8 translate-x-8">
              <Image
                src="/section.png"
                alt="Groupe de personnes souriantes utilisant Venega"
                width={600}
                height={450}
                className="rounded-3xl shadow-lg object-cover"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute left-0 top-1/4 bg-white p-4 rounded-2xl shadow-lg border border-border translate-x-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-tint flex items-center justify-center">
                  <Coins size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-text-muted text-sm">Versement</p>
                  <p className="font-heading font-bold text-xl text-primary">100.000 F</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute right-4 bottom-1/4 bg-white p-4 rounded-2xl shadow-lg border border-border translate-x-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-tint flex items-center justify-center">
                  <Users size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-text-muted text-sm">Membres</p>
                  <p className="font-heading font-bold text-xl text-accent-dark">+12</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
