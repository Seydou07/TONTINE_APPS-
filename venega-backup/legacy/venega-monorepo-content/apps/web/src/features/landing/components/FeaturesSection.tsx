'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Coins, Shield, MessageCircle, Smartphone, Zap } from 'lucide-react';

const features = [
  { icon: Users, title: 'Gestion des cercles', description: 'Créez des cercles de tontine, de solidarité ou hybrides. Invitez des membres via lien ou QR code.' },
  { icon: Coins, title: 'Mobile Money intégré', description: 'Paiements et versements automatisés via Orange Money et Moov Money grâce à CinetPay.' },
  { icon: Shield, title: 'Transparence totale', description: 'Grand livre immuable. Chaque membre voit exactement qui a payé et qui a reçu.' },
  { icon: MessageCircle, title: 'Messagerie intégrée', description: "Discutez avec votre communauté directement dans l'application, groupe par groupe." },
  { icon: Smartphone, title: 'Mobile-first', description: 'Interface optimisée pour mobile, accessible à tous, y compris aux utilisateurs moins tech.' },
  { icon: Zap, title: 'Rappels automatiques', description: 'Notifications push et SMS pour rappeler les échéances de cotisation à vos membres.' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="pt-20 pb-0 bg-surface">
      <div className="section">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-text-main mb-4">
            Tout ce dont vous avez besoin pour votre communauté
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Venega regroupe toutes les fonctionnalités essentielles pour gérer votre
            tontine et votre caisse de solidarité en toute sérénité.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-elevated p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-tint flex items-center justify-center mb-6">
                <feature.icon className="text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold text-text-main mb-3">{feature.title}</h3>
              <p className="text-text-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
