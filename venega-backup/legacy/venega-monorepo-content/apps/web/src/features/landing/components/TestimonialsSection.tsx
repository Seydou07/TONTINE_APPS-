'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Aminata Ouédraogo',
    role: 'Présidente de tontine',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80',
    text: "Venega a complètement transformé notre tontine. Plus de litiges, tout est transparent et nos paiements sont automatisés !",
  },
  {
    name: 'Ibrahim Sawadogo',
    role: 'Membre',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    text: "Très simple à utiliser, même pour moi qui ne suis pas très à l'aise avec les apps. Et le support est super réactif !",
  },
  {
    name: 'Fatimata Compaoré',
    role: 'Trésorière',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    text: "La caisse de solidarité est géniale. On peut aider les membres en difficulté en quelques clics, avec une traçabilité parfaite.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-surface">
      <div className="section">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-text-main mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Découvrez les retours de la communauté Venega au Burkina Faso.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-elevated p-8"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} className="text-accent fill-accent" />
                ))}
              </div>
              <p className="text-text-main mb-6 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-4">
                <Image src={testimonial.avatar} alt={testimonial.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-heading font-semibold text-text-main">{testimonial.name}</p>
                  <p className="text-text-muted text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
