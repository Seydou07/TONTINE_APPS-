'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2 } from 'lucide-react';

const securityItems = [
  'Cryptage AES-256 des données sensibles',
  'Authentification à deux facteurs (OTP)',
  'Intégration sécurisée avec CinetPay',
  'Conformité aux réglementations locales',
  'Sauvegardes automatiques régulières',
];

export default function SecuritySection() {
  return (
    <section id="security" className="pt-4 pb-16 md:pt-6 md:pb-20 bg-primary-dark text-white">
      <div className="section">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-semibold mb-6">
              <Shield size={16} />
              Sécurité bank-grade
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6">
              Votre argent et vos données sont protégés
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Nous prenons la sécurité très au sérieux. Toutes vos transactions sont
              cryptées et vos données stockées de manière sécurisée.
            </p>

            <div className="space-y-4">
              {securityItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={14} className="text-primary-dark" />
                  </div>
                  <span className="text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80"
                alt="Sécurité et protection des données"
                width={500}
                height={400}
                className="rounded-3xl shadow-2xl object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
