'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { mockCircles, mockCycles, mockTransactions, TransactionStatus, TransactionType } from '@venega/types';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { HeroBand, HeroTitle, PageBody } from '@/components/ui/HeroBand';
import { card, select } from '@/components/ui/classes';
import { EmptyState } from '@/components/ui/misc';
import { formatDate, formatDateTime, formatFcfa } from '@/lib/format';

const TYPE_LABELS: Record<string, string> = {
  TONTINE_CONTRIBUTION: 'Cotisation tontine',
  SOLIDARITY_CONTRIBUTION: 'Cotisation solidarité',
  PAYOUT: 'Cagnotte reçue',
  ASSISTANCE_DISBURSEMENT: 'Aide reçue',
  JOINING_FEE: 'Frais de rachat',
  DEPOSIT: 'Dépôt de garantie',
};

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  [TransactionStatus.COMPLETED]: { label: 'Terminé', tone: 'green' },
  [TransactionStatus.PENDING]: { label: 'En attente', tone: 'amber' },
  [TransactionStatus.FAILED]: { label: 'Échoué', tone: 'danger' },
};

const OVERLAP = 32;

export function ActivityView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCircle, setFilterCircle] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Toutes les transactions de l'utilisateur (démo : u1) — en production, filtrées par la session.
  const enriched = mockTransactions.map((tx) => {
    const circle = mockCircles.find((c) => c.id === tx.circleId);
    const cycle = mockCycles.find((c) => c.id === tx.cycleId);
    const month = new Date(tx.createdAt).getMonth();
    const turnNumber = cycle ? cycle.currentTurn - (6 - month) : null;
    return { ...tx, circleName: circle?.name ?? 'Cercle inconnu', circleInviteCode: circle?.inviteCode, turnNumber };
  });

  const filtered = enriched.filter((tx) => {
    if (filterCircle !== 'all' && tx.circleId !== filterCircle) return false;
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    return true;
  });

  const grouped = filtered.reduce(
    (acc, tx) => {
      if (!acc[tx.circleId]) acc[tx.circleId] = { name: tx.circleName, inviteCode: tx.circleInviteCode, transactions: [] };
      acc[tx.circleId]!.transactions.push(tx);
      return acc;
    },
    {} as Record<string, { name: string; inviteCode?: string; transactions: typeof enriched }>,
  );

  const totalPaid = filtered
    .filter((t) => t.status === TransactionStatus.COMPLETED && t.type !== TransactionType.PAYOUT)
    .reduce((s, t) => s + t.amount, 0);
  const totalReceived = filtered
    .filter((t) => t.status === TransactionStatus.COMPLETED && t.type === TransactionType.PAYOUT)
    .reduce((s, t) => s + t.amount, 0);
  const pendingCount = filtered.filter((t) => t.status === TransactionStatus.PENDING).length;

  return (
    <>
      <HeroBand overlap={OVERLAP}>
        <HeroTitle title="Historique" subtitle="Toutes vos transactions, par cercle et par tour" />
        <dl className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { label: 'Total versé', value: formatFcfa(totalPaid) },
            { label: 'Total reçu', value: formatFcfa(totalReceived) },
            { label: 'En attente', value: String(pendingCount) },
          ].map((s) => (
            <div key={s.label} className="rounded-[14px] bg-white/10 p-3">
              <dt className="text-[12px] text-white/75">{s.label}</dt>
              <dd className="mt-0.5 text-[15px] font-bold text-white sm:text-[17px]">{s.value}</dd>
            </div>
          ))}
        </dl>
      </HeroBand>

      <PageBody overlap={OVERLAP}>
        <div className={`${card} grid gap-2.5 p-3 sm:grid-cols-3`}>
          <FilterSelect label="Cercle" value={filterCircle} onChange={setFilterCircle}>
            <option value="all">Tous les cercles</option>
            {mockCircles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Type" value={filterType} onChange={setFilterType}>
            <option value="all">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Statut" value={filterStatus} onChange={setFilterStatus}>
            <option value="all">Tous les statuts</option>
            <option value={TransactionStatus.COMPLETED}>Terminé</option>
            <option value={TransactionStatus.PENDING}>En attente</option>
            <option value={TransactionStatus.FAILED}>Échoué</option>
          </FilterSelect>
        </div>

        {Object.keys(grouped).length === 0 && (
          <EmptyState icon={FileText} title="Aucune transaction" text="Aucune transaction ne correspond à ces filtres." />
        )}

        {Object.entries(grouped).map(([circleId, group]) => (
          <section key={circleId} className={`${card} overflow-hidden`}>
            <Link
              href={`/circles/${circleId}`}
              className="flex items-center gap-3 border-b border-line px-4 py-3.5 hover:bg-fill"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-ink">{group.name}</p>
                <p className="text-[13px] text-muted">
                  {group.transactions.length} transaction{group.transactions.length > 1 ? 's' : ''}
                  {group.inviteCode ? ` · ${group.inviteCode}` : ''}
                </p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden />
            </Link>

            <ul className="divide-y divide-line">
              {[...group.transactions]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((tx) => {
                  const open = expandedId === tx.id;
                  const incoming =
                    tx.type === TransactionType.PAYOUT || tx.type === TransactionType.ASSISTANCE_DISBURSEMENT;
                  const status = STATUS[tx.status] ?? { label: tx.status, tone: 'neutral' as BadgeTone };
                  return (
                    <li key={tx.id}>
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setExpandedId(open ? null : tx.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-fill"
                      >
                        <span
                          aria-hidden
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
                            incoming ? 'bg-primary-tint text-primary-dark' : 'bg-fill text-ink-soft'
                          }`}
                        >
                          {incoming ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-ink">{TYPE_LABELS[tx.type] ?? tx.type}</p>
                          <p className="truncate text-[13px] text-muted">
                            {tx.memberName} · {formatDate(tx.createdAt)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-[15px] font-bold ${incoming ? 'text-primary' : 'text-ink'}`}>
                            {incoming ? '+' : ''}
                            {formatFcfa(tx.amount)}
                          </p>
                          <Badge tone={status.tone} className="mt-0.5">
                            {status.label}
                          </Badge>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-subtle transition-transform ${open ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </button>

                      {open && (
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line bg-fill px-4 py-3 text-[14px] sm:grid-cols-4">
                          <Detail label="Référence">
                            <span className="font-mono text-[12px]">{tx.providerReference || '—'}</span>
                          </Detail>
                          <Detail label="Tour">{tx.turnNumber ? `Tour ${tx.turnNumber}` : '—'}</Detail>
                          <Detail label="Date et heure">{formatDateTime(tx.createdAt)}</Detail>
                          <Detail label="Membre">{tx.memberName}</Detail>
                          <Detail label="Montant">{formatFcfa(tx.amount)}</Detail>
                          <Detail label="Statut">{status.label}</Detail>
                        </dl>
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </PageBody>
    </>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-muted">{label}</dt>
      <dd className="truncate font-semibold text-ink">{children}</dd>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={select}>
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </label>
  );
}
