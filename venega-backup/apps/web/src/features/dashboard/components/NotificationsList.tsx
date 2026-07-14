'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bell } from 'lucide-react';
import { mockNotifications } from '@venega/types/mocks';

export default function NotificationsList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-text-main">Notifications</h2>
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium">
          Voir tout
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="card-elevated divide-y divide-border">
        {mockNotifications.map((notification) => (
          <div key={notification.id} className={`p-6 ${!notification.read ? 'bg-primary-tint/30' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notification.type === 'PAYMENT_RECEIVED' ? 'bg-primary-tint'
                : notification.type === 'PAYMENT_REMINDER' ? 'bg-accent-tint'
                : 'bg-purple-tint'
              }`}>
                <Bell size={20} className={
                  notification.type === 'PAYMENT_RECEIVED' ? 'text-primary'
                  : notification.type === 'PAYMENT_REMINDER' ? 'text-accent'
                  : 'text-purple'
                } />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-main">{notification.title}</p>
                <p className="text-sm text-text-muted mt-1">{notification.body}</p>
                <p className="text-xs text-text-muted mt-2">
                  {new Date(notification.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
