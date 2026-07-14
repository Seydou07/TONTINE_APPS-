'use client';

import React, { useState } from 'react';
import { mockSolidarityRequests, mockCircles, mockUsers, mockMemberships } from '../../../../packages/types/src/mock-data';
import { HandHeart, CheckCircle, XCircle, Eye, ArrowUpRight } from 'lucide-react';
import Modal, { DetailRow } from '@/components/Modal';

const fmt = (n: number) => `${n.toLocaleString('fr-FR')} XOF`;
const statusColors: Record<string, string> = { APPROVED: 'bg-emerald-50 text-emerald-600', VOTING: 'bg-amber-50 text-amber-600', REJECTED: 'bg-red-50 text-red-500' };
const statusLabel: Record<string, string> = { APPROVED: 'Approuvé', VOTING: 'En vote', REJECTED: 'Rejeté' };
const eventLabel: Record<string, string> = { HOSPITALISATION: 'Hospitalisation', MARIAGE: 'Mariage', DECES: 'Décès', NAISSANCE: 'Naissance', AUTRE: 'Autre' };

export default function SolidarityPage() {
  const [selected, setSelected] = useState<any>(null);

  const approved = mockSolidarityRequests.filter((r) => r.status === 'APPROVED');
  const voting = mockSolidarityRequests.filter((r) => r.status === 'VOTING');
  const totalRequested = mockSolidarityRequests.reduce((s, r) => s + r.amountRequested, 0);
  const totalApproved = approved.reduce((s, r) => s + r.amountApproved, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total demandé', value: fmt(totalRequested), color: 'bg-blue-50', iconColor: 'text-blue-500' },
          { label: 'Approuvé', value: fmt(totalApproved), color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
          { label: 'En vote', value: voting.length.toString(), color: 'bg-amber-50', iconColor: 'text-amber-500' },
          { label: 'Fonds solidarité', value: fmt(approved.reduce((s, r) => s + r.amountApproved, 0)), color: 'bg-violet-50', iconColor: 'text-violet-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <HandHeart size={18} className={s.iconColor} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400">{s.label}</p>
                <p className="text-[16px] font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50">
          <p className="text-[13px] font-semibold text-gray-900">Demandes de solidarité</p>
        </div>
        <div className="divide-y divide-gray-50">
          {mockSolidarityRequests.map((r) => {
            const circle = mockCircles.find((c) => c.id === r.circleId);
            return (
              <button key={r.id} onClick={() => setSelected(r)}
                className="w-full px-5 py-4 hover:bg-gray-50/50 transition-colors text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                      <ArrowUpRight size={16} className="text-violet-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-gray-900">{r.requesterName}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[r.status]}`}>{statusLabel[r.status]}</span>
                      </div>
                      <p className="text-[12px] text-gray-400 mt-0.5 max-w-md truncate">{r.reason}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">{fmt(r.amountRequested)}</p>
                      <p className="text-[11px] text-gray-400">{circle?.name || r.circleId}</p>
                    </div>
                    <Eye size={15} className="text-gray-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Demande de solidarité" subtitle={selected?.id} width="max-w-2xl">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                <HandHeart size={20} className="text-violet-500" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-gray-900">{selected.requesterName}</p>
                <p className="text-[12px] text-gray-400">{eventLabel[selected.eventType] || selected.eventType}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${statusColors[selected.status]}`}>{statusLabel[selected.status]}</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[11px] text-gray-400 mb-1">Motif</p>
              <p className="text-[13px] text-gray-700 leading-relaxed">{selected.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-50"><p className="text-[11px] text-gray-400">Montant demandé</p><p className="text-[16px] font-bold text-gray-900">{fmt(selected.amountRequested)}</p></div>
              <div className="p-3 rounded-xl bg-gray-50"><p className="text-[11px] text-gray-400">Montant approuvé</p><p className="text-[16px] font-bold text-gray-900">{selected.amountApproved > 0 ? fmt(selected.amountApproved) : '—'}</p></div>
            </div>

            <div className="space-y-1">
              <DetailRow label="ID" value={selected.id} mono />
              <DetailRow label="Cercle" value={(() => { const c = mockCircles.find((x) => x.id === selected.circleId); return c ? c.name : selected.circleId; })()} />
              <DetailRow label="Cycle" value={selected.cycleId} />
              <DetailRow label="Créé le" value={new Date(selected.createdAt).toLocaleString('fr-FR')} />
            </div>

            {selected.votes?.length > 0 && (
              <div>
                <h4 className="text-[13px] font-semibold text-gray-900 mb-2">Votes des membres ({selected.votes.length})</h4>
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                  {selected.votes.map((v: any, i: number) => (
                    <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                      <span className="text-[13px] text-gray-700">{v.memberName}</span>
                      <div className="flex items-center gap-2">
                        {v.approved ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-400" />}
                        <span className="text-[11px] text-gray-400">{new Date(v.votedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-2 italic">Les votes sont effectués par les membres du cercle. L&apos;administrateur intervient uniquement en cas de problème.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
