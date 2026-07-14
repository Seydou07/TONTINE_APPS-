'use client';

import React from 'react';
import { BarChart3, Download, TrendingUp, Users, Coins, Circle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const monthlyData = [
  { month: 'Jan', tontine: 1200000, solidarite: 300000 },
  { month: 'Fév', tontine: 1800000, solidarite: 450000 },
  { month: 'Mar', tontine: 2400000, solidarite: 600000 },
  { month: 'Avr', tontine: 2100000, solidarite: 500000 },
  { month: 'Mai', tontine: 3200000, solidarite: 800000 },
  { month: 'Jun', tontine: 2800000, solidarite: 700000 },
];

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-gray-400">Analyses et statistiques de la plateforme</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Download size={15} />
          Rapport PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Tondance mensuelle</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barGap={4}>
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
          <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Résumé</h3>
          <div className="space-y-3">
            {[
              { label: 'Utilisateurs totaux', value: '189', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Cercles actifs', value: '4', icon: Circle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Volume total', value: '13.5M XOF', icon: Coins, color: 'text-violet-500', bg: 'bg-violet-50' },
              { label: 'Croissance mensuelle', value: '+12%', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
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
          <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Activité récente</h3>
          <div className="space-y-2">
            {[
              { text: 'Nouveau cercle créé', time: 'Il y a 2h', dot: 'bg-emerald-400' },
              { text: '5 KYC approuvés', time: 'Il y a 4h', dot: 'bg-blue-400' },
              { text: 'Transaction de 25K XOF', time: 'Il y a 6h', dot: 'bg-violet-400' },
              { text: 'Nouveau membre ajouté', time: 'Il y a 8h', dot: 'bg-amber-400' },
              { text: 'Demande solidarité validée', time: 'Il y a 12h', dot: 'bg-emerald-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                <span className="text-[13px] text-gray-700 flex-1">{item.text}</span>
                <span className="text-[11px] text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
