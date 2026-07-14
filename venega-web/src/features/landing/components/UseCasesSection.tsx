'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Briefcase, Users, Heart, Zap, PiggyBank, Clock, ShieldCheck } from 'lucide-react';

const useCases = [
  { icon: Home, title: 'Familles', description: 'Fonds de solidarité familiale et collectes spéciales', bg: 'bg-primary-tint', color: 'text-primary' },
  { icon: Briefcase, title: 'Bureau & collègues', description: 'Groupe de collègues qui cotisent ensemble', bg: 'bg-accent-tint', color: 'text-accent-dark' },
  { icon: Users, title: 'Associations religieuses', description: 'Collecte des contributions et des dons', bg: 'bg-[#EFE6F4]', color: 'text-[#7A4E9C]' },
  { icon: Heart, title: 'Funérailles', description: 'Fonds familial pour cérémonies et dons', bg: 'bg-[#E3EEF7]', color: 'text-[#2B7FB0]' },
  { icon: Zap, title: 'Entrepreneuriat', description: "Mettre de l'argent ensemble pour un projet", bg: 'bg-primary-tint', color: 'text-primary' },
  { icon: PiggyBank, title: "Clubs d'épargne", description: "Amis ou voisins qui épargnent à plusieurs", bg: 'bg-accent-tint', color: 'text-accent-dark' },
  { icon: Clock, title: 'Quartier / Zone', description: 'Caisse de solidarité de voisinage', bg: 'bg-[#EFE6F4]', color: 'text-[#7A4E9C]' },
  { icon: ShieldCheck, title: 'Événements de vie', description: 'Mariage, naissance, nouvelle maison', bg: 'bg-[#E3EEF7]', color: 'text-[#2B7FB0]' },
];

export default function UseCasesSection() {
  return (
    <section className="bg-surface">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-16 md:py-[70px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-[640px] mx-auto mb-11"
        >
          <div className="text-primary font-bold text-xs uppercase tracking-wide mb-2.5">Pour qui ?</div>
          <h2 className="font-heading text-[32px] mb-3">Une seule appli, toutes vos cagnottes</h2>
          <p className="text-text-muted text-[15px] leading-relaxed">
            Familles, bureaux, associations : Venega s&apos;adapte à chaque groupe qui met de l&apos;argent en commun.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {useCases.map((uc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="bg-white border border-border rounded-[18px] p-5 pt-6 text-center hover:-translate-y-[3px] hover:shadow-[0_14px_26px_-14px_rgba(11,110,79,.22)] transition-all duration-150"
            >
              <div className={`w-11 h-11 rounded-[13px] ${uc.bg} ${uc.color} flex items-center justify-center mx-auto mb-3`}>
                <uc.icon size={22} />
              </div>
              <h4 className="font-heading text-[13.5px] font-bold mb-1.5">{uc.title}</h4>
              <p className="text-text-muted text-[11.5px] leading-[1.4]">{uc.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
