'use client';

import React from 'react';
import { Shield, Eye, AlertTriangle, CheckCircle2, Clock, User, ArrowRight } from 'lucide-react';

const auditLogs = [
  { id: 1, action: 'Utilisateur vérifié', user: 'Admin A.', target: 'Ibrahim Sawadogo', time: '14:32', type: 'success' },
  { id: 2, action: 'Cercle suspendu', user: 'Admin A.', target: 'Tontine Famille', time: '13:15', type: 'warning' },
  { id: 3, action: 'Transaction remboursée', user: 'Admin B.', target: 'Fatimata Compaoré', time: '11:42', type: 'info' },
  { id: 4, action: 'KYC rejeté', user: 'Admin A.', target: 'Adama Traoré', time: '10:08', type: 'danger' },
  { id: 5, action: 'Nouveau membre', user: 'Système', target: 'Rasmata Zongo', time: '09:30', type: 'success' },
  { id: 6, action: 'Cotisation reçue', user: 'Système', target: 'Moussa Kaboré', time: '08:55', type: 'success' },
  { id: 7, action: 'Paramètres modifiés', user: 'Admin A.', target: 'Config KYC', time: '08:12', type: 'warning' },
  { id: 8, action: 'Solde vérifié', user: 'Admin B.', target: 'Fonds solidarité', time: '07:45', type: 'info' },
];

const typeIcon: Record<string, { color: string; bg: string }> = {
  success: { color: 'text-emerald-500', bg: 'bg-emerald-50' },
  warning: { color: 'text-amber-500', bg: 'bg-amber-50' },
  danger: { color: 'text-red-500', bg: 'bg-red-50' },
  info: { color: 'text-blue-500', bg: 'bg-blue-50' },
};

const defaultType = { color: 'text-blue-500', bg: 'bg-blue-50' };

export default function AuditPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-gray-400">Historique des actions administratives</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Eye size={15} />
          Filtrer
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {auditLogs.map((log) => {
            const t = typeIcon[log.type] ?? defaultType;
            return (
              <div key={log.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center shrink-0`}>
                  <Shield size={15} className={t.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900">{log.action}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {log.user} <ArrowRight size={10} className="inline mx-1" /> {log.target}
                  </p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">{log.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
