'use client';

import React, { useState, useMemo } from 'react';
import { mockUsers, mockMemberships, mockCircles } from '@venega/types/mocks';
import { Search, Download, Filter, ChevronDown, X } from 'lucide-react';
import Modal, { DetailRow } from '@/components/Modal';
import { exportUsersCSV } from '@/lib/admin-store';

const statusColors: Record<string, string> = {
  VERIFIED: 'bg-emerald-50 text-emerald-600',
  PENDING: 'bg-amber-50 text-amber-600',
  NOT_SUBMITTED: 'bg-gray-100 text-gray-500',
  REJECTED: 'bg-red-50 text-red-500',
};
const statusLabels: Record<string, string> = {
  VERIFIED: 'Vérifié', PENDING: 'En attente', NOT_SUBMITTED: 'Non soumis', REJECTED: 'Rejeté',
};
const roleLabels: Record<string, string> = { PRESIDENT: 'Président', TREASURER: 'Trésorier', SECRETARY: 'Secrétaire', MEMBER: 'Membre' };
const roleColors: Record<string, string> = { PRESIDENT: 'text-amber-600 bg-amber-50', TREASURER: 'text-blue-600 bg-blue-50', SECRETARY: 'text-violet-600 bg-violet-50', MEMBER: 'text-gray-500 bg-gray-100' };

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'in_circle' | 'presidents' | 'no_circle'>('all');
  const [selected, setSelected] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterKyc, setFilterKyc] = useState<string>('all');
  const [filterCircle, setFilterCircle] = useState<string>('all');

  const getMemberInfo = (userId: string) => {
    return mockMemberships.filter((m) => m.userId === userId).map((m) => {
      const circle = mockCircles.find((c) => c.id === m.circleId);
      return { ...m, circleName: circle?.name || m.circleId };
    });
  };

  const tabs = [
    { key: 'all' as const, label: 'Tous', count: mockUsers.length },
    { key: 'in_circle' as const, label: 'Dans un cercle', count: new Set(mockMemberships.map((m) => m.userId)).size },
    { key: 'presidents' as const, label: 'Présidents', count: mockMemberships.filter((m) => m.role === 'PRESIDENT').length },
    { key: 'no_circle' as const, label: 'Sans cercle', count: mockUsers.filter((u) => !mockMemberships.some((m) => m.userId === u.id)).length },
  ];

  const filtered = useMemo(() => {
    let list = mockUsers;
    if (tab === 'in_circle') list = mockUsers.filter((u) => mockMemberships.some((m) => m.userId === u.id));
    else if (tab === 'presidents') list = mockUsers.filter((u) => mockMemberships.some((m) => m.userId === u.id && m.role === 'PRESIDENT'));
    else if (tab === 'no_circle') list = mockUsers.filter((u) => !mockMemberships.some((m) => m.userId === u.id));
    if (filterKyc !== 'all') list = list.filter((u) => u.kycStatus === filterKyc);
    if (filterCircle !== 'all') list = list.filter((u) => mockMemberships.some((m) => m.userId === u.id && m.circleId === filterCircle));
    return list.filter((u) => !search || `${u.firstName} ${u.lastName} ${u.phoneNumber}`.toLowerCase().includes(search.toLowerCase()));
  }, [tab, search, filterKyc, filterCircle]);

  const activeFilters = (filterKyc !== 'all' ? 1 : 0) + (filterCircle !== 'all' ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center justify-between gap-3">
        <div className="relative max-w-[280px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher un utilisateur..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] transition-colors ${activeFilters > 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100'}`}>
            <Filter size={14} /> Filtres {activeFilters > 0 && `(${activeFilters})`}
          </button>
          <button onClick={() => exportUsersCSV(filtered)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Exporter CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
          <span className="text-[12px] font-medium text-gray-500">Filtrer par :</span>
          <select value={filterKyc} onChange={(e) => setFilterKyc(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-medium text-gray-600 focus:outline-none focus:border-emerald-400 cursor-pointer">
            <option value="all">KYC : Tous</option>
            <option value="VERIFIED">Vérifié</option>
            <option value="PENDING">En attente</option>
            <option value="NOT_SUBMITTED">Non soumis</option>
          </select>
          <select value={filterCircle} onChange={(e) => setFilterCircle(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[12px] font-medium text-gray-600 focus:outline-none focus:border-emerald-400 cursor-pointer">
            <option value="all">Cercle : Tous</option>
            {mockCircles.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {activeFilters > 0 && (
            <button onClick={() => { setFilterKyc('all'); setFilterCircle('all'); }}
              className="flex items-center gap-1 px-2 py-1 text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors">
              <X size={12} /> Effacer
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
        <div className="flex bg-gray-50 rounded-xl p-0.5 border border-gray-100">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {['Utilisateur', 'Téléphone', 'Rôle / Cercle', 'KYC', 'Score', 'Inscrit le'].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((u) => {
              const memberships = getMemberInfo(u.id);
              return (
                <tr key={u.id} onClick={() => setSelected(u)} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                        <p className="text-[11px] text-gray-400">{u.displayName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-gray-600">{u.phoneNumber}</td>
                  <td className="px-5 py-3">
                    {memberships.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {memberships.map((m) => (
                          <span key={m.circleId} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColors[m.role] || 'text-gray-500 bg-gray-100'}`}>
                            {roleLabels[m.role] || m.role}
                            <span className="text-gray-400 font-normal">|</span>
                            <span className="font-normal">{m.circleName}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[12px] text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[u.kycStatus] || 'bg-gray-100 text-gray-500'}`}>
                      {statusLabels[u.kycStatus] || u.kycStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${u.reputationScore}%` }} />
                      </div>
                      <span className="text-[12px] text-gray-500 font-medium">{u.reputationScore}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-[13px] text-gray-400">Aucun utilisateur trouvé</p>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Détail utilisateur" subtitle={selected?.id} width="max-w-2xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold">
                {selected.firstName?.[0]}{selected.lastName?.[0]}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-gray-900">{selected.firstName} {selected.lastName}</p>
                <p className="text-[13px] text-gray-400">{selected.phoneNumber}</p>
              </div>
            </div>
            <div className="space-y-1">
              <DetailRow label="ID" value={selected.id} mono />
              <DetailRow label="Nom d'affichage" value={selected.displayName} />
              <DetailRow label="Téléphone" value={selected.phoneNumber} />
              <DetailRow label="KYC" value={<span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[selected.kycStatus]}`}>{statusLabels[selected.kycStatus]}</span>} />
              <DetailRow label="Score réputation" value={`${selected.reputationScore}/100`} />
              <DetailRow label="Inscrit le" value={new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} />
            </div>
            {getMemberInfo(selected.id).length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">Cercles</p>
                <div className="space-y-1">
                  {getMemberInfo(selected.id).map((m) => (
                    <div key={m.circleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-[13px] font-medium text-gray-900">{m.circleName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColors[m.role]}`}>{roleLabels[m.role]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
