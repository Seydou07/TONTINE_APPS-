'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface KycStatsCardsProps {
  pendingCount: number;
  verifiedCount: number;
  notSubmittedCount: number;
}

export default function KycStatsCards({
  pendingCount,
  verifiedCount,
  notSubmittedCount,
}: KycStatsCardsProps) {
  const stats = [
    {
      label: 'En attente',
      value: pendingCount,
      color: 'bg-amber-50',
      icon: Clock,
      iconColor: 'text-amber-500',
    },
    {
      label: 'Vérifié',
      value: verifiedCount,
      color: 'bg-emerald-50',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Non soumis',
      value: notSubmittedCount,
      color: 'bg-gray-50',
      icon: XCircle,
      iconColor: 'text-gray-400',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
            <stat.icon size={18} className={stat.iconColor} />
          </div>
          <div>
            <p className="text-[11px] text-gray-400">{stat.label}</p>
            <p className="text-[18px] font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
