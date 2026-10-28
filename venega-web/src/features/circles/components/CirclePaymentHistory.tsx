'use client';

import { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { mockTransactions, TransactionStatus, TransactionType, type Transaction } from '@venega/types';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { card } from '@/components/ui/classes';
import { SectionHeader } from '@/components/ui/misc';
import { formatFcfa } from '@/lib/format';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const STATUS: Record<TransactionStatus, { label: string; tone: BadgeTone }> = {
  [TransactionStatus.COMPLETED]: { label: 'Validé', tone: 'green' },
  [TransactionStatus.PENDING]: { label: 'En attente', tone: 'amber' },
  [TransactionStatus.FAILED]: { label: 'Échoué', tone: 'danger' },
};

function Group({ title, items, payout = false }: { title: string; items: Transaction[]; payout?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className={`px-4 py-3 ${payout ? 'bg-primary-tint/50' : ''}`}>
      <p className={`mb-2 text-[12px] font-semibold ${payout ? 'text-primary-dark' : 'text-muted'}`}>{title}</p>
      <ul className="space-y-2">
        {items.map((tx) => (
          <li key={tx.id} className="flex items-center justify-between gap-3 text-[14px]">
            <span className="min-w-0 truncate text-ink">{tx.memberName}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="font-semibold text-ink">{formatFcfa(tx.amount)}</span>
              {!payout && <Badge tone={STATUS[tx.status].tone}>{STATUS[tx.status].label}</Badge>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Historique des paiements du cercle, groupé par mois (visible par tous les membres). */
export function CirclePaymentHistory({ circleId }: { circleId: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const groups = mockTransactions
    .filter((t) => t.circleId === circleId)
    .reduce<Record<string, Transaction[]>>((acc, t) => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[key]) acc[key] = [];
      acc[key]!.push(t);
      return acc;
    }, {});

  const entries = Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  if (entries.length === 0) return null;

  return (
    <section>
      <SectionHeader title="Historique des paiements" subtitle="Visible par tous les membres" />
      <div className="space-y-2.5">
        {entries.map(([key, txs]) => {
          const [year, month] = key.split('-');
          const monthIndex = parseInt(month || '1', 10) - 1;
          const turnNumber = monthIndex + 1 - 5;
          const contributions = txs.filter((t) => t.type === TransactionType.TONTINE_CONTRIBUTION);
          const solidarity = txs.filter((t) => t.type === TransactionType.SOLIDARITY_CONTRIBUTION);
          const payouts = txs.filter((t) => t.type === TransactionType.PAYOUT);
          const open = expanded === key;
          const total = contributions.reduce((s, t) => s + t.amount, 0);

          return (
            <div key={key} className={`${card} overflow-hidden`}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setExpanded(open ? null : key)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-fill"
              >
                <CalendarDays size={18} className="shrink-0 text-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-ink">
                    {MONTHS[monthIndex]} {year}
                  </p>
                  <p className="text-[13px] text-muted">
                    Tour {turnNumber > 0 ? turnNumber : '—'} · {contributions.length} cotisation
                    {contributions.length > 1 ? 's' : ''}
                  </p>
                </div>
                <span className="shrink-0 text-[14px] font-bold text-primary-dark">{formatFcfa(total)}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-subtle transition-transform ${open ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {open && (
                <div className="divide-y divide-line border-t border-line">
                  <Group title="Cotisations tontine" items={contributions} />
                  <Group title="Cotisations solidarité" items={solidarity} />
                  <Group title="Versement au bénéficiaire" items={payouts} payout />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
