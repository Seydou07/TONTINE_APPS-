'use client';

import React, { useState } from 'react';
import { mockCircles } from '@venega/types/mocks';
import { Search, Users, Code, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const fmt = (n: number) => { if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`; if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`; return n.toString(); };
const typeBadge: Record<string, string> = { TONTINE_ONLY: 'bg-emerald-50 text-emerald-600', SOLIDARITY_ONLY: 'bg-violet-50 text-violet-600', HYBRID: 'bg-amber-50 text-amber-600' };
const typeLabel: Record<string, string> = { TONTINE_ONLY: 'Tontine rotative', SOLIDARITY_ONLY: 'Caisse solidarité', HYBRID: 'Tontine + Solidarité' };

export default function CirclesPage() {
  const [search, setSearch] = useState('');
  const circles = mockCircles.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center justify-between gap-3">
        <div className="relative max-w-[280px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher un cercle..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {circles.map((c) => (
          <Link key={c.id} href={`/circles/${c.id}`}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow block">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Users size={18} className="text-emerald-500" /></div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 leading-tight">{c.name}</p>
                  <span className={`inline-flex px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium ${typeBadge[c.type]}`}>{typeLabel[c.type]}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div><p className="text-[11px] text-gray-400">Membres</p><p className="text-[15px] font-bold text-gray-900">{c.memberCount}</p></div>
              <div><p className="text-[11px] text-gray-400">Cotisation</p><p className="text-[15px] font-bold text-gray-900">{fmt(c.tontineAmount)} XOF</p></div>
              <div><p className="text-[11px] text-gray-400">Fréquence</p><p className="text-[13px] font-semibold text-gray-900">{c.frequency === 'MONTHLY' ? 'Mensuel' : 'Hebdo'}</p></div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400"><Code size={12} />{c.inviteCode}</div>
              <span className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium">Voir détails <ExternalLink size={12} /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
