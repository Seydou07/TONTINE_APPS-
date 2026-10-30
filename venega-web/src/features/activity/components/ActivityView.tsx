'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Building2, CheckCircle2, Clock, FileText, type LucideIcon } from 'lucide-react';
import { TransactionStatus, TransactionType } from '@venega/types';
import { HeroBand, HeroTitle } from '@/components/ui/HeroBand';
import { Chip, ChipGroup } from '@/components/ui/choice';
import { TransactionDetailSheet } from '@/components/ui/DetailSheets';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { getActivity, type ActivityItem } from '../api';

/** Hauteur dont la carte Entrées / Sorties chevauche le bandeau vert. */
const SUMMARY_OVERLAP = 40;

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const formatFullDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
  ' à ' +
  formatTime(dateStr);

const formatDateHeader = (dateStr: string) => {
  const d = new Date(dateStr);
  if (d.toDateString() === new Date().toDateString()) return "Aujourd'hui";
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

type Meta = { label: string; icon: LucideIcon; credit: boolean; doneLabel: string };

const typeMeta: Record<string, Meta> = {
  TONTINE_CONTRIBUTION: { label: 'Cotisation', icon: ArrowUpRight, credit: true, doneLabel: 'Payé' },
  SOLIDARITY_CONTRIBUTION: { label: 'Cotisation solidarité', icon: ArrowUpRight, credit: true, doneLabel: 'Payé' },
  PAYOUT: { label: 'Cagnotte reçue', icon: ArrowDownLeft, credit: false, doneLabel: 'Versée' },
  FEE_PAYMENT: { label: 'Frais de gestion', icon: Building2, credit: false, doneLabel: 'Payé' },
  JOINING_FEE: { label: "Frais d'adhésion", icon: CheckCircle2, credit: true, doneLabel: 'Payé' },
  SOLIDARITY_DISBURSEMENT: { label: 'Aide solidarité versée', icon: ArrowDownLeft, credit: false, doneLabel: 'Décaissée' },
};

const metaOf = (type: string): Meta => typeMeta[type] ?? typeMeta.TONTINE_CONTRIBUTION!;

const monthLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

type Selected = ActivityItem & { label: string; statusLabel: string };

/** Onglet Historique (ActivityScreen mobile). */
export function ActivityView() {
  useDemoStore();
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [selectedTx, setSelectedTx] = useState<Selected | null>(null);

  const allTx = getActivity();
  const monthsWithActivity = [...new Set(allTx.map((tx) => new Date(tx.createdAt).getMonth()))].sort((a, b) => a - b);
  const filtered = allTx.filter((tx) => monthFilter === null || new Date(tx.createdAt).getMonth() === monthFilter);

  // Regroupement par jour, dans l'ordre chronologique inverse.
  const groups: { dateLabel: string; items: ActivityItem[] }[] = [];
  [...filtered]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((tx) => {
      const label = formatDateHeader(tx.createdAt);
      const group = groups.find((g) => g.dateLabel === label);
      if (group) group.items.push(tx);
      else groups.push({ dateLabel: label, items: [tx] });
    });

  const totalIn = filtered.filter((tx) => metaOf(tx.type).credit).reduce((s, tx) => s + tx.amount, 0);
  const totalOut = filtered.filter((tx) => !metaOf(tx.type).credit).reduce((s, tx) => s + tx.amount, 0);

  return (
    <div className="pb-8">
      <HeroBand overlap={SUMMARY_OVERLAP} width="narrow">
        <HeroTitle title="Historique" subtitle="Toutes vos cotisations et cagnottes" />
      </HeroBand>

      <div className="mx-auto max-w-2xl px-4 sm:px-6" style={{ marginTop: -SUMMARY_OVERLAP }}>
        {/* Entrées / sorties de la période */}
        <div className="flex items-center rounded-[20px] border border-line bg-white py-4">
          <div className="min-w-0 flex-1 px-4">
            <p className="text-[13px] text-muted">Entrées</p>
            <p className="mt-0.5 truncate text-[17px] font-bold text-primary">+{formatFcfa(totalIn)}</p>
          </div>
          <span aria-hidden className="h-9 w-px bg-line" />
          <div className="min-w-0 flex-1 px-4">
            <p className="text-[13px] text-muted">Sorties</p>
            <p className="mt-0.5 truncate text-[17px] font-bold text-ink">−{formatFcfa(totalOut)}</p>
          </div>
        </div>

        {monthsWithActivity.length > 1 && (
          <div className="mt-4">
            <ChipGroup label="Filtrer par mois">
              <Chip label="Tout" selected={monthFilter === null} onClick={() => setMonthFilter(null)} />
              {[...monthsWithActivity].reverse().map((mIdx) => (
                <Chip
                  key={mIdx}
                  label={`${monthLabels[mIdx]} 2026`}
                  selected={monthFilter === mIdx}
                  onClick={() => setMonthFilter(mIdx)}
                />
              ))}
            </ChipGroup>
          </div>
        )}

        {groups.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fill text-subtle">
              <FileText size={24} strokeWidth={1.6} aria-hidden />
            </span>
            <p className="mt-3 text-[17px] font-bold text-ink">Aucune transaction</p>
            <p className="mt-1 text-[14px] text-muted">Les cotisations et versements de vos cercles apparaîtront ici.</p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.dateLabel} className="mt-5">
              <h2 className="mb-2 px-1 text-[13px] font-semibold text-muted">{group.dateLabel}</h2>
              <ul className="overflow-hidden rounded-[20px] border border-line bg-white">
                {group.items.map((tx, i) => {
                  const meta = metaOf(tx.type);
                  const Icon = meta.icon;
                  const pending = tx.status === TransactionStatus.PENDING;
                  const failed = tx.status === TransactionStatus.FAILED;
                  const statusLabel = pending ? 'En attente' : failed ? 'Échouée' : meta.doneLabel;
                  const label =
                    tx.type === TransactionType.PAYOUT && tx.memberName
                      ? `Cagnotte versée à ${tx.memberName}`
                      : tx.type === 'SOLIDARITY_DISBURSEMENT' && tx.memberName
                      ? `Aide versée à ${tx.memberName}`
                      : tx.memberName && !tx.memberName.includes('(')
                      ? `${meta.label} de ${tx.memberName}`
                      : meta.label;
                  return (
                    <li key={tx.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedTx({ ...tx, label, statusLabel })}
                        className="flex w-full items-center gap-3 pl-3.5 text-left hover:bg-fill"
                      >
                        <span
                          aria-hidden
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            pending
                              ? 'bg-amber-tint text-amber-dark'
                              : meta.credit
                              ? 'bg-primary-tint text-primary'
                              : 'bg-danger-tint text-danger'
                          }`}
                        >
                          {pending ? <Clock size={18} /> : <Icon size={18} strokeWidth={2} />}
                        </span>
                        <span
                          className={`flex min-w-0 flex-1 items-center gap-3 py-3.5 pr-3.5 ${
                            i < group.items.length - 1 ? 'border-b border-line' : ''
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold text-ink">{label}</span>
                            <span className="mt-0.5 block truncate text-[13px] text-muted">
                              {tx.circleName} · {formatTime(tx.createdAt)}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className={`block text-[15px] font-bold ${meta.credit ? 'text-primary' : 'text-ink'}`}>
                              {meta.credit ? '+' : '−'}
                              {formatFcfa(tx.amount)}
                            </span>
                            {(pending || failed) && (
                              <span className={`block text-[12px] font-semibold ${pending ? 'text-amber-dark' : 'text-danger'}`}>
                                {statusLabel}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>

      {selectedTx && (
        <TransactionDetailSheet
          open
          onClose={() => setSelectedTx(null)}
          isCredit={
            selectedTx.type === TransactionType.TONTINE_CONTRIBUTION ||
            selectedTx.type === TransactionType.SOLIDARITY_CONTRIBUTION
          }
          name={selectedTx.label}
          amount={formatFcfa(selectedTx.amount)}
          fields={[
            { label: 'Type', value: selectedTx.label },
            { label: 'Cercle', value: selectedTx.circleName || '—' },
            ...(selectedTx.providerReference ? [{ label: 'Référence', value: selectedTx.providerReference }] : []),
            { label: 'Statut', value: selectedTx.statusLabel },
            { label: 'Date', value: formatFullDate(selectedTx.createdAt) },
          ]}
        />
      )}
    </div>
  );
}
