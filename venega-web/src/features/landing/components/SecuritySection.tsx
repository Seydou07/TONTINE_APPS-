'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, Clock } from 'lucide-react';

const securityItems = [
  {
    icon: ShieldCheck,
    title: "L'argent ne transite jamais par un compte personnel",
    description: 'Chaque cotisation va vers un compte de collecte dédié au cercle, jamais dans le portefeuille du Président.',
  },
  {
    icon: Check,
    title: 'Double validation obligatoire',
    description: "Tout décaissement de la caisse de solidarité exige l'accord du Président ET du Trésorier.",
  },
  {
    icon: Clock,
    title: 'Historique immuable',
    description: 'Chaque mouvement est horodaté et visible par tous les membres du cercle, en temps réel.',
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="bg-surface">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-16 md:py-[70px]">
        <div className="bg-primary-tint rounded-[28px] p-10 md:p-14 flex flex-col lg:flex-row items-center gap-14">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="text-primary font-bold text-xs uppercase tracking-wide mb-2.5">
              Sécurité &amp; confiance
            </div>
            <h2 className="font-heading text-[26px] font-bold mb-5">
              La confiance, garantie par le système
            </h2>

            <div className="space-y-5">
              {securityItems.map((item, index) => (
                <div key={index} className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-[10px] bg-white text-primary flex items-center justify-center flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,.06)]">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-heading text-[14.5px] font-bold mb-1">{item.title}</h4>
                    <p className="text-text-muted text-[12.5px] leading-[1.5]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 hidden lg:block"
          >
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="95" fill="none" stroke="#0B6E4F" strokeWidth="2" opacity=".3" />
              <circle cx="110" cy="110" r="70" fill="#fff" />
              <path
                d="M110 65l6 3v15c0 12-6 19-6 19s-6-7-6-19V68z"
                fill="none"
                stroke="#0B6E4F"
                strokeWidth="3.5"
                transform="scale(1.6) translate(-42,-42)"
              />
              <path
                d="M95 108l10 10 20-20"
                stroke="#0B6E4F"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
