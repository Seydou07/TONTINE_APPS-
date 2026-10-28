'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompact, formatXOF } from '@/lib/format';

export function VolumeChart({ data }: { data: { month: string; volume: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#DDE3E0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5B6B65' }} axisLine={{ stroke: '#DDE3E0' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: '#5B6B65' }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => formatCompact(v)}
          />
          <Tooltip
            cursor={{ fill: '#E7F1EC' }}
            contentStyle={{ fontSize: 13, borderRadius: 6, border: '1px solid #DDE3E0', color: '#12261E' }}
            formatter={(v: number) => [formatXOF(v), 'Volume']}
          />
          <Bar dataKey="volume" fill="#0B6E4F" radius={[3, 3, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
