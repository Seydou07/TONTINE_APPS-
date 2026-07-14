'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Coins } from 'lucide-react';
import { mockTransactions } from '../../../../packages/types/src/mock-data';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

export default function RecentTransactions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-text-main">Transactions récentes</h2>
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium">
          Voir tout
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="card-elevated divide-y divide-border">
        {mockTransactions.slice(0, 5).map((transaction) => (
          <div key={transaction.id} className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type.includes('CONTRIBUTION') ? 'bg-primary-tint'
                : transaction.type === 'PAYOUT' ? 'bg-accent-tint'
                : 'bg-purple-tint'
              }`}>
                <Coins size={20} className={
                  transaction.type.includes('CONTRIBUTION') ? 'text-primary'
                  : transaction.type === 'PAYOUT' ? 'text-accent'
                  : 'text-purple'
                } />
              </div>
              <div>
                <p className="font-medium text-text-main">{transaction.memberName}</p>
                <p className="text-sm text-text-muted">
                  {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-heading font-semibold ${
                transaction.type.includes('CONTRIBUTION') ? 'text-text-main' : 'text-primary'
              }`}>
                {transaction.type.includes('CONTRIBUTION') ? '+' : '-'} {formatXOF(transaction.amount)}
              </p>
              <span className={`badge text-xs ${
                transaction.status === 'COMPLETED' ? 'badge-success'
                : transaction.status === 'PENDING' ? 'badge-warning'
                : 'badge-danger'
              }`}>
                {transaction.status === 'COMPLETED' ? 'Validé'
                : transaction.status === 'PENDING' ? 'En attente'
                : 'Échoué'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
