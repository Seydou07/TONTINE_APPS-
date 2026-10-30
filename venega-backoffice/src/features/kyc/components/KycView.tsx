'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Check, Clock, X } from 'lucide-react';
import { FilterTabs, PageHeader, StatCard } from '@/components/ui';
import { getKycStats } from '../api';
import { KycDecisionHistory } from './KycDecisionHistory';
import { KycQueue } from './KycQueue';

export function KycView() {
  const sp = useSearchParams();
  const [tab, setTab] = useState<'queue' | 'history'>('queue');
  const stats = useQuery({ queryKey: ['kyc', 'stats'], queryFn: getKycStats });
  const s = stats.data;

  return (
    <>
      <PageHeader title="Validation KYC" description="Vérifiez la CNIB (recto / verso) et le selfie de chaque compte avant de l’autoriser à cotiser ou collecter. Les dossiers les plus anciens et ceux avec des points d’attention passent en premier." />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="À vérifier" value={s?.pending ?? '—'} icon={<Clock size={16} />} tone="amber" />
        <StatCard label="Avec points d’attention" value={s?.flagged ?? '—'} icon={<AlertTriangle size={16} />} tone={s?.flagged ? 'red' : 'default'} />
        <StatCard label="Validés (7 j)" value={s?.verifiedLast7d ?? '—'} icon={<Check size={16} />} />
        <StatCard label="Refusés (7 j)" value={s?.rejectedLast7d ?? '—'} icon={<X size={16} />} />
      </div>

      <div className="mb-3">
        <FilterTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'queue', label: 'Dossiers' },
            { value: 'history', label: 'Historique des décisions' },
          ]}
        />
      </div>

      {tab === 'queue' ? <KycQueue pendingCount={s?.pending} initialQ={sp.get('q') ?? ''} /> : <KycDecisionHistory />}
    </>
  );
}
