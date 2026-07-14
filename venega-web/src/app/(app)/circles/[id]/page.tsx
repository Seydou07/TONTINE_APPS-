'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Coins, Calendar, Code, Copy } from 'lucide-react';
import { mockCircles, mockMemberships, mockUsers } from '../../../../packages/types/src/mock-data';
import { CircleType } from '../../../../packages/types/src';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

export default function CircleDetailPage() {
  const params = useParams();
  const circleId = params.id as string;
  const circle = mockCircles.find((c) => c.id === circleId);

  if (!circle) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted text-lg">Cercle introuvable.</p>
        <Link href="/circles" className="text-primary hover:text-primary-dark mt-4 inline-block font-medium">
          Retour aux cercles
        </Link>
      </div>
    );
  }

  const members = mockMemberships
    .filter((m) => m.circleId === circleId)
    .map((m) => {
      const user = mockUsers.find((u) => u.id === m.userId);
      return { ...m, user };
    })
    .filter((m) => m.user);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href="/circles" className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors mb-4">
          <ArrowLeft size={20} />
          Retour aux cercles
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-main">{circle.name}</h1>
            <span className={`badge mt-2 ${
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
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-tint flex items-center justify-center">
              <Coins size={20} className="text-primary" />
            </div>
            <span className="text-text-muted text-sm">Cotisation</span>
          </div>
          <p className="text-2xl font-heading font-bold text-text-main">{formatXOF(circle.tontineAmount)}</p>
          <p className="text-sm text-text-muted mt-1">{circle.frequency === 'MONTHLY' ? 'Mensuel' : 'Hebdomadaire'}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-tint flex items-center justify-center">
              <Users size={20} className="text-accent" />
            </div>
            <span className="text-text-muted text-sm">Membres</span>
          </div>
          <p className="text-2xl font-heading font-bold text-text-main">{circle.memberCount}</p>
          <p className="text-sm text-text-muted mt-1">par tour</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-tint flex items-center justify-center">
              <Code size={20} className="text-purple" />
            </div>
            <span className="text-text-muted text-sm">Code d'invitation</span>
          </div>
          <p className="text-2xl font-heading font-bold text-text-main">{circle.inviteCode}</p>
          <button className="text-sm text-primary hover:text-primary-dark mt-1 flex items-center gap-1">
            <Copy size={14} /> Copier
          </button>
        </motion.div>
      </div>

      {members.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="text-xl font-heading font-bold text-text-main mb-4">Membres</h2>
          <div className="card overflow-hidden">
            <div className="divide-y divide-border">
              {members.map((member) => (
                <div key={member.userId} className="px-6 py-4 flex items-center justify-between hover:bg-bg/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                      {member.user!.avatarUrl && (
                        <img src={member.user!.avatarUrl} alt={member.user!.firstName} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-text-main">{member.user!.firstName} {member.user!.lastName}</p>
                      <p className="text-sm text-text-muted">{member.user!.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      member.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700'
                      : member.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                      {member.paymentStatus === 'PAID' ? 'Payé' : member.paymentStatus === 'PENDING' ? 'En attente' : 'En retard'}
                    </span>
                    <span className="text-xs text-text-muted">#{member.turnOrder || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {members.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-center py-12">
          <p className="text-text-muted">Aucun membre trouvé pour ce cercle.</p>
        </motion.div>
      )}
    </div>
  );
}
