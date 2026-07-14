'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function MarketStatSection() {
  return (
    <section className="bg-surface">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 pt-0 pb-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#0F8563] via-primary to-primary-dark rounded-[28px] px-8 py-14 text-center text-white"
        >
          <div className="text-white/75 text-[13px] font-semibold mb-3.5">
            L&apos;ÉPARGNE INFORMELLE EN AFRIQUE DE L&apos;OUEST
          </div>
          <div className="font-heading text-5xl md:text-[56px] font-extrabold mb-3">
            200 Milliards $
          </div>
          <p className="text-white/85 text-[15px] max-w-[520px] mx-auto leading-relaxed">
            estimés en circulation dans les tontines et caisses de solidarité
            informelles — largement invisibles du système financier officiel.
            Venega rend cette épargne aussi fiable et traçable qu&apos;une banque,
            sans lui retirer sa chaleur humaine.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
