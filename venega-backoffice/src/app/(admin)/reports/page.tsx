'use client';

import React, { useMemo } from 'react';
import { BarChart3, Download, TrendingUp, Users, Coins, Circle, HandHeart, Clock, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { mockAdminStats, mockTransactions, mockCircles, mockUsers, mockSolidarityRequests } from '@venega/types/mocks';
import { TransactionType, TransactionStatus } from '@venega/types';

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const fmtFull = (n: number) => `${n.toLocaleString('fr-FR')} XOF`;

export default function ReportsPage() {
  const stats = mockAdminStats;

  const reportData = useMemo(() => {
    // Compute monthly data from transactions
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyData = months.slice(0, 7).map((month, idx) => {
      const monthTxs = mockTransactions.filter((t) => {
        const d = new Date(t.createdAt);
        return d.getMonth() === idx;
      });
      const tontine = monthTxs.filter((t) => t.type === TransactionType.TONTINE_CONTRIBUTION).reduce((s, t) => s + t.amount, 0);
      const solidarite = monthTxs.filter((t) => t.type === TransactionType.SOLIDARITY_CONTRIBUTION).reduce((s, t) => s + t.amount, 0);
      return { month, tontine, solidarite };
    });

    // Active users this month
    const activeUsers = new Set(mockTransactions.filter((t) => {
      const d = new Date(t.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).map((t) => t.userId)).size;

    // Completed transactions
    const completedTx = mockTransactions.filter((t) => t.status === TransactionStatus.COMPLETED).length;
    const pendingTx = mockTransactions.filter((t) => t.status === TransactionStatus.PENDING).length;

    // Average reputation
    const avgReputation = Math.round(mockUsers.reduce((s, u) => s + u.reputationScore, 0) / mockUsers.length);

    return { monthlyData, activeUsers, completedTx, pendingTx, avgReputation };
  }, []);

  const exportPDF = () => {
    // In production, this would generate a real PDF
    alert('Rapport PDF — Fonctionnalité à connecter au backend');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-gray-400">Analyses et statistiques de la plateforme</p>
        </div>
        <button onClick={exportPDF}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Download size={15} />
          Rapport PDF
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Utilisateurs totaux', value: stats.totalUsers.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Cercles actifs', value: stats.activeCircles.toString(), icon: Circle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Volume total', value: `${fmt(stats.totalVolumeXOF)} XOF`, icon: Coins, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'Transactions complétées', value: reportData.completedTx.toString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
              <item.icon size={18} className={item.color} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">{item.label}</p>
              <p className="text-[16px] font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Tondance mensuelle</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData.monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${fmt(v)}`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                formatter={(v: number) => [`${v.toLocaleString('fr-FR')} XOF`]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="tontine" name="Tontine" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="solidarite" name="Solidarité" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Détails plateforme</h3>
          <div className="space-y-3">
            {[
              { label: 'Utilisateurs inscrits', value: stats.totalUsers.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Cercles au total', value: stats.totalCircles.toString(), icon: Circle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Transactions en attente', value: reportData.pendingTx.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Score moyen réputation', value: `${reportData.avgReputation}/100`, icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50' },
              { label: 'Demandes d\'aide en cours', value: stats.pendingAidRequests.toString(), icon: HandHeart, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Transactions aujourd\'hui', value: stats.transactionsToday.toString(), icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <item.icon size={15} className={item.color} />
                </div>
                <span className="text-[13px] text-gray-600 flex-1">{item.label}</span>
                <span className="text-[14px] font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Répartition des cercles</h3>
          <div className="space-y-3">
            {[
              { label: 'Tontine rotative', count: mockCircles.filter((c) => c.type === 'TONTINE_ONLY').length, color: 'bg-emerald-500', pct: Math.round(mockCircles.filter((c) => c.type === 'TONTINE_ONLY').length / mockCircles.length * 100) },
              { label: 'Solidarité', count: mockCircles.filter((c) => c.type === 'SOLIDARITY_ONLY').length, color: 'bg-violet-500', pct: Math.round(mockCircles.filter((c) => c.type === 'SOLIDARITY_ONLY').length / mockCircles.length * 100) },
              { label: 'Hybride', count: mockCircles.filter((c) => c.type === 'HYBRID').length, color: 'bg-amber-500', pct: Math.round(mockCircles.filter((c) => c.type === 'HYBRID').length / mockCircles.length * 100) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] text-gray-600">{item.label}</span>
                  <span className="text-[13px] font-bold text-gray-900">{item.count} ({item.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-[13px] font-semibold text-gray-900 mb-3">Dernières transactions</h4>
            <div className="space-y-2">
              {mockTransactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-[12px] font-medium text-gray-700">{tx.memberName}</p>
                    <p className="text-[10px] text-gray-400">{tx.type === 'TONTINE_CONTRIBUTION' ? 'Cotisation' : tx.type === 'PAYOUT' ? 'Virement' : 'Solidarité'}</p>
                  </div>
                  <span className={`text-[12px] font-semibold ${tx.type === 'PAYOUT' ? 'text-violet-600' : 'text-emerald-600'}`}>
                    {tx.type === 'PAYOUT' ? '-' : '+'}{fmtFull(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
