'use client';

import React, { useState } from 'react';
import { mockUsers } from '@venega/types/mocks';
import { Search, CheckCircle, XCircle, Clock, Eye, FileText, User, Calendar, Image } from 'lucide-react';
import Modal, { DetailRow } from '@/components/Modal';

const statusColors: Record<string, string> = { VERIFIED: 'bg-emerald-50 text-emerald-600', PENDING: 'bg-amber-50 text-amber-600', NOT_SUBMITTED: 'bg-gray-100 text-gray-500' };
const statusLabel: Record<string, string> = { VERIFIED: 'Vérifié', PENDING: 'En attente', NOT_SUBMITTED: 'Non soumis' };

const mockKycData: Record<string, { documentType: string; idDocumentUrl: string; selfieUrl: string; submittedAt: string }> = {
  u4: { documentType: 'CNIB', idDocumentUrl: '/docs/u4_cnib.jpg', selfieUrl: '/docs/u4_selfie.jpg', submittedAt: '2026-07-10T14:30:00Z' },
  u1: { documentType: 'CNIB', idDocumentUrl: '/docs/u1_cnib.jpg', selfieUrl: '/docs/u1_selfie.jpg', submittedAt: '2026-01-20T09:00:00Z' },
  u2: { documentType: 'PASSPORT', idDocumentUrl: '/docs/u2_passport.jpg', selfieUrl: '/docs/u2_selfie.jpg', submittedAt: '2026-01-25T11:00:00Z' },
  u3: { documentType: 'CNIB', idDocumentUrl: '/docs/u3_cnib.jpg', selfieUrl: '/docs/u3_selfie.jpg', submittedAt: '2026-02-05T08:30:00Z' },
  u5: { documentType: 'CNIB', idDocumentUrl: '/docs/u5_cnib.jpg', selfieUrl: '/docs/u5_selfie.jpg', submittedAt: '2026-02-18T10:00:00Z' },
};

export default function KycPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'pending' | 'verified' | 'not_submitted'>('pending');
  const [selected, setSelected] = useState<any>(null);

  const pending = mockUsers.filter((u) => u.kycStatus === 'PENDING');
  const verified = mockUsers.filter((u) => u.kycStatus === 'VERIFIED');
  const notSubmitted = mockUsers.filter((u) => u.kycStatus === 'NOT_SUBMITTED');

  const filtered = (tab === 'pending' ? pending : tab === 'verified' ? verified : notSubmitted)
    .filter((u) => !search || `${u.firstName} ${u.lastName} ${u.phoneNumber}`.toLowerCase().includes(search.toLowerCase()));

  const tabs = [
    { key: 'pending' as const, label: 'En attente', count: pending.length },
    { key: 'verified' as const, label: 'Vérifié', count: verified.length },
    { key: 'not_submitted' as const, label: 'Non soumis', count: notSubmitted.length },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'En attente', value: pending.length, color: 'bg-amber-50', icon: Clock, iconColor: 'text-amber-500' },
          { label: 'Vérifié', value: verified.length, color: 'bg-emerald-50', icon: CheckCircle, iconColor: 'text-emerald-500' },
          { label: 'Non soumis', value: notSubmitted.length, color: 'bg-gray-50', icon: XCircle, iconColor: 'text-gray-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon size={18} className={s.iconColor} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">{s.label}</p>
              <p className="text-[18px] font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center justify-between gap-3">
        <div className="relative max-w-[280px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher un utilisateur..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
        </div>
        <div className="flex bg-gray-50 rounded-xl p-0.5 border border-gray-100">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      {tab === 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((u) => {
            const kyc = mockKycData[u.id];
            return (
              <div key={u.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                      <p className="text-[11px] text-gray-400">{u.phoneNumber}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600">En attente</span>
                  </div>
                  {kyc && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[12px] text-gray-500">
                        <FileText size={13} className="text-gray-400" />
                        <span>Document : <span className="font-medium text-gray-700">{kyc.documentType === 'CNIB' ? 'Carte Nationale' : 'Passeport'}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-500">
                        <Calendar size={13} className="text-gray-400" />
                        <span>Soumis le {new Date(kyc.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  )}
                  {!kyc && <p className="text-[12px] text-gray-400 italic">Documents non disponibles</p>}
                </div>
                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button onClick={() => setSelected(u)}
                    className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-[12px] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                    <Eye size={13} /> Voir documents
                  </button>
                  <button className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[12px] font-medium hover:bg-emerald-600 transition-colors">
                    Approuver
                  </button>
                  <button className="py-2 px-3 bg-white border border-red-200 text-red-500 rounded-xl text-[12px] font-medium hover:bg-red-50 transition-colors">
                    Rejeter
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="col-span-2 text-center py-8 text-[13px] text-gray-400">Aucune demande en attente</p>}
        </div>
      )}

      {tab === 'verified' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['Utilisateur', 'Téléphone', 'Document', 'Vérifié le', ''].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const kyc = mockKycData[u.id];
                return (
                  <tr key={u.id} onClick={() => setSelected(u)} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <p className="text-[13px] font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-gray-600">{u.phoneNumber}</td>
                    <td className="px-5 py-3">
                      <span className="text-[12px] text-gray-500">{kyc ? (kyc.documentType === 'CNIB' ? 'Carte Nationale' : 'Passeport') : '—'}</span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><Eye size={15} className="text-gray-400" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-[13px] text-gray-400">Aucun utilisateur vérifié</p>}
        </div>
      )}

      {tab === 'not_submitted' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['Utilisateur', 'Téléphone', 'Inscrit le', ''].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} onClick={() => setSelected(u)} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-[11px] font-bold shrink-0">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <p className="text-[13px] font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-gray-600">{u.phoneNumber}</td>
                  <td className="px-5 py-3 text-[12px] text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><Eye size={15} className="text-gray-400" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-[13px] text-gray-400">Tous les utilisateurs ont soumis leur KYC</p>}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Vérification KYC" subtitle={selected?.id} width="max-w-2xl">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold">
                {selected.firstName?.[0]}{selected.lastName?.[0]}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-gray-900">{selected.firstName} {selected.lastName}</p>
                <p className="text-[13px] text-gray-400">{selected.phoneNumber}</p>
              </div>
              <span className={`ml-auto inline-flex px-3 py-1 rounded-full text-[12px] font-medium ${statusColors[selected.kycStatus]}`}>{statusLabel[selected.kycStatus]}</span>
            </div>
            <div className="space-y-1">
              <DetailRow label="ID" value={selected.id} mono />
              <DetailRow label="Téléphone" value={selected.phoneNumber} />
              <DetailRow label="Date de naissance" value={selected.dateOfBirth || '—'} />
              <DetailRow label="Score réputation" value={`${selected.reputationScore}/100`} />
              <DetailRow label="Inscrit le" value={new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} />
            </div>
            {(() => {
              const kyc = mockKycData[selected.id];
              if (!kyc) return null;
              return (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-[12px] font-semibold text-gray-700 mb-3 uppercase tracking-wider">Documents soumis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <FileText size={16} className="text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-gray-900">{kyc.documentType === 'CNIB' ? "Carte Nationale d'Identité" : 'Passeport'}</p>
                        <p className="text-[11px] text-gray-400">Piece d'identite</p>
                      </div>
                      <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                        <Image size={13} /> Voir
                      </button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <User size={16} className="text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-gray-900">Selfie de verification</p>
                        <p className="text-[11px] text-gray-400">Photo face</p>
                      </div>
                      <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                        <Image size={13} /> Voir
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">Soumis le {new Date(kyc.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              );
            })()}
            {selected.kycStatus === 'PENDING' && (
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-[13px] font-medium hover:bg-emerald-600 transition-colors">Approuver le KYC</button>
                <button className="flex-1 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-[13px] font-medium hover:bg-red-50 transition-colors">Rejeter</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
