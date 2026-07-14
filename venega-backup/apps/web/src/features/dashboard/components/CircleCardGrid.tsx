'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Coins, Calendar } from 'lucide-react';
import { mockCircles } from '@venega/types/mocks';
import { CircleType } from '@venega/types';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

export default function CircleCardGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-text-main">Mes cercles</h2>
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium">
          Voir tout
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCircles.map((circle, index) => (
          <motion.div
            key={circle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 + index * 0.05 }}
            className="card-elevated overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    circle.type === CircleType.TONTINE_ONLY ? 'bg-primary-tint'
                    : circle.type === CircleType.SOLIDARITY_ONLY ? 'bg-purple-tint'
                    : 'bg-accent-tint'
                  }`}>
                    {circle.type === CircleType.TONTINE_ONLY ? (
                      <Coins size={24} className="text-primary" />
                    ) : circle.type === CircleType.SOLIDARITY_ONLY ? (
                      <Users size={24} className="text-purple" />
                    ) : (
                      <Users size={24} className="text-accent" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-text-main">{circle.name}</h3>
                    <span className={`badge ${
                      circle.type === CircleType.TONTINE_ONLY ? 'badge-success'
                      : circle.type === CircleType.SOLIDARITY_ONLY ? 'badge-purple'
                      : 'badge-warning'
                    }`}>
                      {circle.type === CircleType.TONTINE_ONLY ? 'Tontine'
                      : circle.type === CircleType.SOLIDARITY_ONLY ? 'Solidarité'
                      : 'Hybride'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {circle.type !== CircleType.SOLIDARITY_ONLY && (
                  <div>
                    <p className="text-text-muted text-sm mb-1">Cotisation</p>
                    <p className="font-heading font-semibold text-text-main">{formatXOF(circle.tontineAmount)}</p>
                  </div>
                )}
                {circle.type !== CircleType.TONTINE_ONLY && (
                  <div>
                    <p className="text-text-muted text-sm mb-1">Solidarité</p>
                    <p className="font-heading font-semibold text-text-main">{formatXOF(circle.solidarityAmount)}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{circle.memberCount} membres</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{circle.frequency === 'MONTHLY' ? 'Mensuel' : 'Hebdomadaire'}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border bg-bg/50 px-6 py-4">
              <Link href={`/circles/${circle.id}`} className="flex items-center justify-between text-primary font-medium hover:text-primary-dark transition-colors">
                Voir le détail
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
