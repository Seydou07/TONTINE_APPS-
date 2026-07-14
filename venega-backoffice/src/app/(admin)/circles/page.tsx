'use client';

import React, { useState } from 'react';
import { mockCircles } from '@venega/types/mocks';
import { Search } from 'lucide-react';
import CircleCard from '@/features/circles/components/CircleCard';

export default function CirclesPage() {
  const [search, setSearch] = useState('');
  const circles = mockCircles.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center justify-between gap-3">
        <div className="relative max-w-[280px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un cercle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {circles.map((circle) => (
          <CircleCard key={circle.id} circle={circle} />
        ))}
      </div>
    </div>
  );
}
