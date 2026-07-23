'use client';

import React, { useState, useMemo } from 'react';
import { Shield, Eye, AlertTriangle, CheckCircle2, Clock, ArrowRight, Search, Filter, X, Download } from 'lucide-react';
import { getAuditLogs } from '@/lib/admin-store';

const typeIcon: Record<string, { color: string; bg: string }> = {
  success: { color: 'text-emerald-500', bg: 'bg-emerald-50' },
  warning: { color: 'text-amber-500', bg: 'bg-amber-50' },
  danger: { color: 'text-red-500', bg: 'bg-red-50' },
  info: { color: 'text-blue-500', bg: 'bg-blue-50' },
};

const defaultType = { color: 'text-blue-500', bg: 'bg-blue-50' };

const targetTypeIcons: Record<string, string> = {
  user: 'Utilisateur',
  circle: 'Cercle',
  transaction: 'Transaction',
  kyc: 'KYC',
  solidarity: 'Solidarité',
  system: 'Système',
};

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTargetType, setFilterTargetType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const logs = getAuditLogs();

  const filtered = useMemo(() => {
    let list = logs;
    if (filterType !== 'all') list = list.filter((l) => l.type === filterType);
    if (filterTargetType !== 'all') list = list.filter((l) => l.targetType === filterTargetType);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.adminName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [logs, search, filterType, filterTargetType]);

  const exportCSV = () => {
    const headers = ['Date', 'Action', 'Admin', 'Cible', 'Type', 'Détails'];
    const rows = filtered.map((l) => [
      new Date(l.timestamp).toLocaleString('fr-FR'),
      l.action,
      l.adminName,
      l.target,
      targetTypeIcons[l.targetType] || l.targetType,
      l.details || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `venega-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFilters = (filterType !== 'all' ? 1 : 0) + (filterTargetType !== 'all' ? 1 : 0);

  // Group by date
  const grouped = filtered.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-gray-400">Historique des actions administratives ({filtered.length} entrées)</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Download size={15} />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center justify-between gap-3">
        <div className="relative max-w-[280px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher une action..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] transition-colors ${activeFilters > 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100'}`}>
            <Filter size={14} /> Filtres {activeFilters > 0 && `(${activeFilters})`}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
          <span className="text-[12px] font-medium text-gray-500">Filtrer :</span>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-medium text-gray-600 focus:outline-none focus:border-emerald-400 cursor-pointer">
            <option value="all">Sévérité : Toutes</option>
            <option value="success">Succès</option>
            <option value="warning">Avertissement</option>
            <option value="danger">Danger</option>
            <option value="info">Info</option>
          </select>
          <select value={filterTargetType} onChange={(e) => setFilterTargetType(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-medium text-gray-600 focus:outline-none focus:border-emerald-400 cursor-pointer">
            <option value="all">Cible : Toutes</option>
            <option value="user">Utilisateur</option>
            <option value="circle">Cercle</option>
            <option value="transaction">Transaction</option>
            <option value="kyc">KYC</option>
            <option value="solidarity">Solidarité</option>
            <option value="system">Système</option>
          </select>
          {activeFilters > 0 && (
            <button onClick={() => { setFilterType('all'); setFilterTargetType('all'); }}
              className="flex items-center gap-1 px-2 py-1 text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors">
              <X size={12} /> Effacer
            </button>
          )}
        </div>
      )}

      {Object.entries(grouped).map(([date, entries]) => (
        <div key={date}>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{date}</p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {entries.map((log) => {
                const t = typeIcon[log.type] ?? defaultType;
                const time = new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={log.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center shrink-0`}>
                      <Shield size={15} className={t.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900">{log.action}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {log.adminName} <ArrowRight size={10} className="inline mx-1" /> {log.target}
                      </p>
                      {log.details && <p className="text-[11px] text-gray-400 mt-0.5 italic">{log.details}</p>}
                    </div>
                    <span className="text-[12px] font-medium text-gray-400 shrink-0">{time}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${t.bg} ${t.color} shrink-0`}>
                      {targetTypeIcons[log.targetType]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Shield size={24} className="text-gray-300 mx-auto mb-3" />
          <p className="text-[13px] text-gray-400">Aucune entrée d'audit pour ces filtres</p>
        </div>
      )}
    </div>
  );
}
