'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ShieldCheck } from 'lucide-react';

const partners = [
  { name: 'Orange Money', icon: Smartphone },
  { name: 'Moov Money', icon: Smartphone },
  { name: 'Sécurisé par CinetPay', icon: ShieldCheck },
];

export default function PartnersSection() {
  return (
    <section className="bg-surface">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 pt-5 pb-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <div className="text-primary font-bold text-xs uppercase tracking-wide mb-2.5">Paiement</div>
          <h2 className="font-heading text-[22px]">
            Intégré à vos moyens de paiement habituels
          </h2>
        </motion.div>

        <div className="flex items-center justify-center gap-5 flex-wrap pb-5">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-border bg-white text-text-muted font-bold text-sm"
            >
              <partner.icon size={18} />
              {partner.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
