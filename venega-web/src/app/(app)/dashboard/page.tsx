'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, UserPlus, Users, Activity } from 'lucide-react';
import { mockCurrentUser } from '@venega/types';
import StatsCards from '@/features/dashboard/components/StatsCards';
import CircleCardGrid from '@/features/dashboard/components/CircleCardGrid';
import RecentTransactions from '@/features/dashboard/components/RecentTransactions';
import NotificationsList from '@/features/dashboard/components/NotificationsList';

const quickActions = [
  { label: 'Créer', icon: Plus, color: 'text-primary-dark', href: '/circles/create' },
  { label: 'Rejoindre', icon: UserPlus, color: 'text-accent-dark', href: '/circles/join' },
  { label: 'Cercles', icon: Users, color: 'text-purple', href: '/circles' },
  { label: 'Activité', icon: Activity, color: 'text-info', href: '/activity' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-main">
              Bonjour, {mockCurrentUser.firstName}
            </h1>
            <p className="text-text-muted mt-1">Voici l'état de vos cercles aujourd'hui</p>
          </div>
        </div>
      </motion.div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
          >
            <Link
              href={action.href}
              className="flex flex-col items-center justify-center gap-2 p-5 bg-surface border border-border rounded-2xl hover:border-primary/30 hover:-translate-y-0.5 transition-all"
            >
              <action.icon size={22} className={action.color} />
              <span className="text-sm font-medium text-text-main">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Cards */}
      <StatsCards />

      {/* My Circles */}
      <CircleCardGrid />

      {/* Recent Transactions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentTransactions />
        <NotificationsList />
      </div>
    </div>
  );
}
