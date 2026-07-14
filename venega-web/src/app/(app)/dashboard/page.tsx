'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { mockCurrentUser } from '../../../packages/types/src/mock-data';
import StatsCards from '@/features/dashboard/components/StatsCards';
import CircleCardGrid from '@/features/dashboard/components/CircleCardGrid';
import RecentTransactions from '@/features/dashboard/components/RecentTransactions';
import NotificationsList from '@/features/dashboard/components/NotificationsList';

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
              Bonjour, {mockCurrentUser.firstName} 👋
            </h1>
            <p className="text-text-muted mt-1">Voici l'état de vos cercles aujourd'hui</p>
          </div>
          <Link href="/dashboard" className="btn-primary">
            <Plus size={20} />
            Créer un cercle
          </Link>
        </div>
      </motion.div>

      {/* Photo Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative h-64 rounded-2xl overflow-hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
          alt="Community"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
        <div className="absolute inset-0 flex items-center p-8">
          <div className="max-w-md text-white">
            <h2 className="text-2xl font-heading font-bold mb-2">
              Gérez vos économies avec transparence
            </h2>
            <p className="text-white/80">
              Venega vous aide à organiser vos tontines et vos caisses de solidarité simplement
            </p>
          </div>
        </div>
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
