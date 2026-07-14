'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="section">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6">
              Prêt à commencer votre tontine digitale ?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Rejoignez des milliers de Burkinabè qui font confiance à Venega pour
              gérer leur tontine et leur caisse de solidarité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-accent text-lg px-10 py-4">
                Créer un compte gratuit
                <ArrowRight size={20} />
              </Link>
              <Link href="/login" className="btn-outline border-white text-white hover:bg-white/10">
                Se connecter
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
