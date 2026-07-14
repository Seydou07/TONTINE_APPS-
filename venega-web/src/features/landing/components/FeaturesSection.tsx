'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Bike, Heart, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Tontine rotative',
    description: "Cotisez à votre rythme, suivez l'ordre de passage et le prochain bénéficiaire en un coup d'œil.",
    bg: 'bg-primary-tint',
    color: 'text-primary',
  },
  {
    icon: Bike,
    title: 'Tontine en nature',
    description: 'Moto, vivres, pagne : cotisez pour un achat groupé, avec justificatif transparent pour tous.',
    bg: 'bg-accent-tint',
    color: 'text-accent-dark',
  },
  {
    icon: Heart,
    title: 'Caisse de solidarité',
    description: "Un fonds d'entraide avec vote des membres et double validation avant tout décaissement.",
    bg: 'bg-[#EFE6F4]',
    color: 'text-[#7A4E9C]',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité & KYC',
    description: "Identité vérifiée, argent qui ne transite jamais par un compte personnel, historique immuable.",
    bg: 'bg-[#E3EEF7]',
    color: 'text-[#2B7FB0]',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-surface">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-16 md:py-[70px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-[640px] mx-auto mb-11"
        >
          <div className="text-primary font-bold text-xs uppercase tracking-wide mb-2.5">Fonctionnalités</div>
          <h2 className="font-heading text-[32px] mb-3">Tout ce qu&apos;il faut pour une tontine sereine</h2>
          <p className="text-text-muted text-[15px] leading-relaxed">
            Chaque outil traditionnel, retranscrit fidèlement — en plus transparent et plus sûr.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-border rounded-[20px] p-6 pt-7 hover:-translate-y-1 hover:shadow-[0_20px_34px_-18px_rgba(11,110,79,.25)] transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-[14px] ${feature.bg} ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon size={20} />
              </div>
              <h3 className="font-heading text-[15.5px] font-bold mb-2">{feature.title}</h3>
              <p className="text-text-muted text-[13px] leading-[1.55]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
