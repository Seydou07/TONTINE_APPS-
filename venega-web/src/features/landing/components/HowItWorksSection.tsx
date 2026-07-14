'use client';

import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { step: 1, title: 'Créez ou rejoignez un cercle', description: "En tant que Président, ou via un lien d'invitation partagé sur WhatsApp." },
  { step: 2, title: 'Cotisez via Mobile Money', description: 'Orange Money ou Moov Money, en un clic, sans frais cachés.' },
  { step: 3, title: 'Suivez tout en direct', description: 'Qui a payé, qui reste, qui est le prochain bénéficiaire — visible par tous.' },
  { step: 4, title: 'Recevez votre tour', description: 'La cagnotte arrive directement sur votre Mobile Money, sans intermédiaire.' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-surface">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-16 md:py-[70px]">
        <div className="bg-white rounded-[28px] p-10 md:p-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="text-primary font-bold text-xs uppercase tracking-wide mb-2.5">Comment ça marche</div>
            <h2 className="font-heading text-[32px]">Quatre étapes, zéro complication</h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center relative"
              >
                <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#0C7A57] to-primary-dark text-white font-heading font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-[0_10px_20px_-8px_rgba(11,110,79,.4)]">
                  {item.step}
                </div>
                <h4 className="font-heading text-[14.5px] font-bold mb-2">{item.title}</h4>
                <p className="text-text-muted text-[12.5px] leading-[1.5]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
