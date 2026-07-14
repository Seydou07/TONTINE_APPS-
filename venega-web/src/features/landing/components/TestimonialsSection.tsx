'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Fatoumata O.',
    role: 'Présidente, Tontine Bureau',
    avatar: 'https://i.pravatar.cc/150?img=45',
    text: "Avant, on se disputait toujours sur qui avait payé ou non. Avec Venega, tout le monde voit la même chose. Plus aucune tension dans le groupe.",
  },
  {
    name: 'Salif Z.',
    role: 'Membre, Zone 1',
    avatar: 'https://i.pravatar.cc/150?img=18',
    text: "La caisse de solidarité nous a vraiment sauvés quand mon oncle a été hospitalisé. La demande a été validée en deux jours, en toute transparence.",
  },
  {
    name: 'Adama P.',
    role: 'Trésorier, Tontine Moto',
    avatar: 'https://i.pravatar.cc/150?img=33',
    text: "On a monté une tontine moto entre collègues. Chaque mois quelqu'un reçoit sa moto, et tout est justifié avec preuve d'achat. Génial.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-surface">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-16 md:py-[70px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-[640px] mx-auto mb-11"
        >
          <div className="text-primary font-bold text-xs uppercase tracking-wide mb-2.5">Témoignages</div>
          <h2 className="font-heading text-[32px]">
            Ils gèrent déjà leur tontine avec Venega
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-border rounded-[20px] p-6"
            >
              <div className="text-accent text-[13px] mb-3">★★★★★</div>
              <p className="text-text text-[13.5px] leading-[1.6] mb-4">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="flex items-center gap-2.5">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={38}
                  height={38}
                  className="w-[38px] h-[38px] rounded-full object-cover"
                />
                <div>
                  <div className="text-[13px] font-bold">{testimonial.name}</div>
                  <div className="text-[11px] text-text-muted">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
