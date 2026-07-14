'use client';

import React, { useState, useMemo } from 'react';
import { mockTransactions, mockCircles, mockMemberships, mockUsers } from '@venega/types/mocks';
import { Search, ArrowUpRight, ArrowDownLeft, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const fmt = (n: number) => { if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`; if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`; return n.toLocaleString('fr-FR'); };
const fmtFull = (n: number) => `${n.toLocaleString('fr-FR')} XOF`;
const typeBadge: Record<string, string> = { TONTINE_ONLY: 'bg-emerald-50 text-emerald-600', SOLIDARITY_ONLY: 'bg-violet-50 text-violet-600', HYBRID: 'bg-amber-50 text-amber-600' };
const typeLabel: Record<string, string> = { TONTINE_ONLY: 'Tontine', SOLIDARITY_ONLY: 'Solidarité', HYBRID: 'Hybride' };

export default function TransactionsPage() {
  const [search, setSearch] = useState('');

  const circlesWithStats = useMemo(() => {
    return mockCircles.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase())).map((c) => {
      const txs = mockTransactions.filter((t) => t.circleId === c.id);
      const members = mockMemberships.filter((m) => m.circleId === c.id);
      const totalVolume = txs.reduce((s, t) => s + t.amount, 0);
      const lastTx = txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const paidCount = members.filter((m) => m.paymentStatus === 'PAID').length;
      return { ...c, txs, members, totalVolume, lastTx, paidCount };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
  }, [search]);

  const totalVolume = circlesWithStats.reduce((s, c) => s + c.totalVolume, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[11px] text-gray-400">Volume total</p>
          <p className="text-[18px] font-bold text-gray-900">{fmtFull(totalVolume)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[11px] text-gray-400">Cercles actifs</p>
          <p className="text-[18px] font-bold text-gray-900">{mockCircles.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[11px] text-gray-400">Transactions</p>
          <p className="text-[18px] font-bold text-gray-900">{mockTransactions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center justify-between gap-3">
        <div className="relative max-w-[280px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher un cercle..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
        </div>
      </div>

      <div className="space-y-3">
        {circlesWithStats.map((c) => (
          <Link key={c.id} href={`/circles/${c.id}`}
            className="block bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Users size={18} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-900">{c.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${typeBadge[c.type]}`}>{typeLabel[c.type]}</span>
                      <span className="text-[11px] text-gray-400">{c.frequency === 'MONTHLY' ? 'Mensuel' : 'Hebdo'}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Volume</p>
                  <p className="text-[14px] font-bold text-gray-900">{fmt(c.totalVolume)} XOF</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cotisation</p>
                  <p className="text-[14px] font-bold text-gray-900">{fmt(c.tontineAmount)} XOF</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Payés</p>
                  <p className="text-[14px] font-bold text-emerald-600">{c.paidCount}/{c.memberCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Transactions</p>
                  <p className="text-[14px] font-bold text-gray-900">{c.txs.length}</p>
                </div>
              </div>

              {c.lastTx && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${c.lastTx.type === 'PAYOUT' ? 'bg-violet-50' : 'bg-emerald-50'}`}>
                      {c.lastTx.type === 'PAYOUT' ? <ArrowDownLeft size={11} className="text-violet-500" /> : <ArrowUpRight size={11} className="text-emerald-500" />}
                    </div>
                    <span className="text-[12px] text-gray-500">{c.lastTx.memberName} — {c.lastTx.type === 'PAYOUT' ? 'Versement' : 'Cotisation'}</span>
                  </div>
                  <span className="text-[12px] font-medium text-gray-700">{fmtFull(c.lastTx.amount)}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
