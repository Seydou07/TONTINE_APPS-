'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { mockCircleStats } from '@venega/types';
import { CircleType } from '@venega/types';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

const stats = [
  { label: 'Total collecté', value: formatXOF(mockCircleStats.totalCollected), icon: Coins, color: 'text-primary', bgColor: 'bg-primary-tint' },
  { label: 'Membres actifs', value: mockCircleStats.memberCount.toString(), icon: Users, color: 'text-accent', bgColor: 'bg-accent-tint' },
  { label: 'Payé ce mois', value: mockCircleStats.paidCount.toString(), icon: CheckCircle2, color: 'text-success', bgColor: 'bg-primary-tint' },
  { label: 'En retard', value: mockCircleStats.lateCount.toString(), icon: AlertCircle, color: 'text-danger', bgColor: 'bg-danger-tint' },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 + index * 0.05 }}
          className="card-elevated p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon size={24} className={stat.color} />
            </div>
          </div>
          <p className="text-text-muted text-sm mb-1">{stat.label}</p>
          <p className="text-2xl font-heading font-bold text-text-main">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
