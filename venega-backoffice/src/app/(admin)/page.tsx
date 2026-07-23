'use client';

import React, { useState, useMemo } from 'react';
import { mockAdminStats, mockUsers, mockCircles, mockTransactions, mockSolidarityRequests } from '@venega/types/mocks';
import { Users, Circle, TrendingUp, Clock, ArrowUpRight, ArrowDownLeft, HandHeart, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TransactionStatus } from '@venega/types';
import Modal, { DetailRow } from '@/components/Modal';
import { getAuditLogs } from '@/lib/admin-store';

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const volumeData = [
  { month: 'Jan', volume: 1200000 }, { month: 'Fév', volume: 1800000 },
  { month: 'Mar', volume: 2400000 }, { month: 'Avr', volume: 2100000 },
  { month: 'Mai', volume: 3200000 }, { month: 'Jun', volume: 2800000 },
  { month: 'Jul', volume: 3500000 }, { month: 'Aoû', volume: 3300000 },
  { month: 'Sep', volume: 3900000 }, { month: 'Oct', volume: 4200000 },
  { month: 'Nov', volume: 4500000 }, { month: 'Déc', volume: 5000000 },
];

const usersData = [
  { month: 'Jan', users: 45 }, { month: 'Fév', users: 78 },
  { month: 'Mar', users: 112 }, { month: 'Avr', users: 98 },
  { month: 'Mai', users: 156 }, { month: 'Jun', users: 189 },
  { month: 'Jul', users: 210 }, { month: 'Aoû', users: 235 },
  { month: 'Sep', users: 260 }, { month: 'Oct', users: 290 },
  { month: 'Nov', users: 320 }, { month: 'Déc', users: 350 },
];

export default function AdminDashboard() {
  const stats = mockAdminStats;
  const [txModal, setTxModal] = useState<any>(null);

  const alerts = useMemo(() => {
    const pendingKyc = mockUsers.filter((u) => u.kycStatus === 'PENDING').length;
    const lowReputation = mockUsers.filter((u) => u.reputationScore < 20).length;
    const pendingTx = mockTransactions.filter((t) => t.status === TransactionStatus.PENDING).length;
    const pendingRequests = mockSolidarityRequests.filter((r) => r.status === 'VOTING').length;
    const recentAudit = getAuditLogs().slice(0, 1).length;
    return { pendingKyc, lowReputation, pendingTx, pendingRequests, recentAudit };
  }, []);

  const statCards = [
    { label: 'Utilisateurs', value: fmt(stats.totalUsers), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', change: '+12%', up: true },
    { label: 'Cercles actifs', value: fmt(stats.activeCircles), icon: Circle, color: 'text-emerald-500', bg: 'bg-emerald-50', change: '+8%', up: true },
    { label: 'Volume XOF', value: `${fmt(stats.totalVolumeXOF)}`, icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50', change: '+23%', up: true },
    { label: 'Attente KYC', value: alerts.pendingKyc.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', change: alerts.pendingKyc > 0 ? 'À traiter' : 'Tout ok', up: alerts.pendingKyc === 0 },
  ];

  const circleTypes = [
    { name: 'Tontine', value: mockCircles.filter((c) => c.type === 'TONTINE_ONLY').length || 2, color: '#10b981' },
    { name: 'Solidarité', value: mockCircles.filter((c) => c.type === 'SOLIDARITY_ONLY').length || 1, color: '#8b5cf6' },
    { name: 'Hybride', value: mockCircles.filter((c) => c.type === 'HYBRID').length || 1, color: '#f59e0b' },
  ];

  const recentTx = mockTransactions.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${s.up ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{s.value}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-gray-900">Volume des transactions</h3>
            <span className="text-[11px] text-gray-400">12 derniers mois</span>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} formatter={(v: number) => [`${v.toLocaleString('fr-FR')} XOF`, 'Volume']} />
                <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-gray-900">Nouveaux utilisateurs</h3>
            <span className="text-[11px] text-gray-400">12 derniers mois</span>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #f3f4f6' }} />
                <Bar dataKey="users" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle row - Pie + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Répartition cercles</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={circleTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                  {circleTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #f3f4f6' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {circleTypes.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[11px] text-gray-500">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-gray-900">Alertes</h3>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
              <Shield size={12} className="text-amber-500" />
              <span className="text-[11px] font-medium text-amber-700">
                {alerts.pendingKyc + alerts.pendingTx + alerts.pendingRequests}
              </span>
            </div>
          </div>
          <div className="space-y-2.5">
            {alerts.pendingKyc > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-amber-800">{alerts.pendingKyc} KYC en attente</p>
                  <p className="text-[11px] text-amber-600/70 mt-0.5">Vérification requise</p>
                </div>
              </div>
            )}
            {alerts.pendingRequests > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50">
                <HandHeart size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-blue-800">{alerts.pendingRequests} demandes de solidarité en vote</p>
                  <p className="text-[11px] text-blue-600/70 mt-0.5">En attente de validation par les membres</p>
                </div>
              </div>
            )}
            {alerts.pendingTx > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50">
                <Clock size={16} className="text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-violet-800">{alerts.pendingTx} transactions en attente</p>
                  <p className="text-[11px] text-violet-600/70 mt-0.5">Paiements non confirmés</p>
                </div>
              </div>
            )}
            {alerts.lowReputation > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-red-800">{alerts.lowReputation} utilisateur(s) score bas</p>
                  <p className="text-[11px] text-red-600/70 mt-0.5">Score fiabilité &lt; 20 — risque d&apos;exclusion</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] font-medium text-emerald-800">{stats.transactionsToday} transactions aujourd&apos;hui</p>
                <p className="text-[11px] text-emerald-600/70 mt-0.5">Activité normale</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row - Transactions récentes */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Transactions récentes</h3>
          <div className="space-y-2.5">
            {recentTx.map((tx) => (
              <button key={tx.id} onClick={() => setTxModal(tx)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'TONTINE_CONTRIBUTION' ? 'bg-emerald-50' : tx.type === 'SOLIDARITY_CONTRIBUTION' ? 'bg-blue-50' : 'bg-violet-50'}`}>
                  {tx.type === 'PAYOUT' ? <ArrowDownLeft size={14} className="text-violet-500" /> : <ArrowUpRight size={14} className="text-emerald-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-800 truncate">{tx.memberName}</p>
                  <p className="text-[11px] text-gray-400">{tx.type === 'TONTINE_CONTRIBUTION' ? 'Cotisation' : tx.type === 'SOLIDARITY_CONTRIBUTION' ? 'Solidarité' : 'Versement'}</p>
                </div>
                <span className={`text-[13px] font-semibold ${tx.type === 'PAYOUT' ? 'text-violet-600' : 'text-emerald-600'}`}>
                  {tx.type === 'PAYOUT' ? '-' : '+'}{fmt(tx.amount)} XOF
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction detail modal */}
      <Modal open={!!txModal} onClose={() => setTxModal(null)} title="Détail de la transaction" subtitle={txModal?.id}>
        {txModal && (
          <div className="space-y-1">
            <DetailRow label="ID" value={txModal.id} mono />
            <DetailRow label="Membre" value={txModal.memberName} />
            <DetailRow label="Type" value={txModal.type === 'TONTINE_CONTRIBUTION' ? 'Cotisation tontine' : txModal.type === 'SOLIDARITY_CONTRIBUTION' ? 'Cotisation solidarité' : txModal.type === 'PAYOUT' ? 'Versement' : txModal.type} />
            <DetailRow label="Montant" value={`${txModal.amount.toLocaleString('fr-FR')} XOF`} />
            <DetailRow label="Statut" value={txModal.status} />
            <DetailRow label="Date" value={new Date(txModal.createdAt).toLocaleString('fr-FR')} />
            <DetailRow label="Cercle" value={txModal.circleId} />
            <DetailRow label="Cycle" value={txModal.cycleId} />
          </div>
        )}
      </Modal>
    </div>
  );
}
