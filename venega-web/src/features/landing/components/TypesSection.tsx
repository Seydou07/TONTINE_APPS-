'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Bike, Heart, ShieldCheck } from 'lucide-react';

const types = [
  {
    icon: CreditCard,
    title: 'Tontine Argent',
    description: 'Cagnotte classique versée au bénéficiaire du tour',
    gradient: 'from-[#0F8563] to-primary-dark',
  },
  {
    icon: Bike,
    title: 'Tontine Moto',
    description: "Cotisation groupée pour l'achat d'une moto",
    gradient: 'from-[#E7B559] to-accent-dark',
  },
  {
    icon: Heart,
    title: 'Tontine Vivres',
    description: 'Paniers de vivres distribués à chaque tour',
    gradient: 'from-[#A879CC] to-[#7A4E9C]',
  },
  {
    icon: ShieldCheck,
    title: 'Tontine Pagne',
    description: 'Cotisation pour des pagnes lors des grandes occasions',
    gradient: 'from-[#2B7FB0] to-[#1B5A80]',
  },
];

export default function TypesSection() {
  return (
    <section className="bg-surface">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-16 md:py-[70px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-[640px] mx-auto mb-11"
        >
          <div className="text-primary font-bold text-xs uppercase tracking-wide mb-2.5">Polyvalence</div>
          <h2 className="font-heading text-[32px] mb-3">Toutes les tontines que vous connaissez</h2>
          <p className="text-text-muted text-[15px] leading-relaxed">
            Venega s&apos;adapte à vos traditions, pas l&apos;inverse.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {types.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${type.gradient} rounded-[20px] p-6 pt-7 text-center text-white relative overflow-hidden`}
            >
              <div className="w-[46px] h-[46px] rounded-[13px] bg-white/18 flex items-center justify-center mx-auto mb-3.5">
                <type.icon size={20} />
              </div>
              <h4 className="font-heading text-[14.5px] font-bold mb-1.5">{type.title}</h4>
              <p className="text-white/80 text-[12px] leading-[1.5]">{type.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
