'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const steps = [
  { step: 1, title: 'Créez votre compte', description: 'Inscrivez-vous avec votre numéro de téléphone, validez via OTP et configurez votre profil.', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80' },
  { step: 2, title: 'Créez ou rejoignez un cercle', description: "Créez votre cercle en définissant les règles, ou rejoignez un cercle existant via un lien d'invitation.", image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
  { step: 3, title: 'Commencez à cotiser et à épargner', description: "Payez vos cotisations via Mobile Money et suivez en temps réel l'évolution de votre tontine.", image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="pt-0 pb-0 md:pt-0 md:pb-0">
      <div className="section">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-text-main mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Trois étapes simples pour commencer votre aventure avec Venega.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className="mb-6 relative overflow-hidden rounded-3xl">
                <Image src={item.image} alt={item.title} width={400} height={300} className="w-full h-56 object-cover" />
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                  <span className="text-white font-heading font-bold text-xl">{item.step}</span>
                </div>
              </div>
              <h3 className="text-xl font-heading font-bold text-text-main mb-3">{item.title}</h3>
              <p className="text-text-muted">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
