'use client';

import { Fragment, type ReactNode } from 'react';
import { Calendar, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatDueIn } from '../store';

/*
 * Briques communes des écrans Tontine et Caisse de solidarité (copie de
 * venega-mobile/src/features/circles/components/CircleOverview.tsx) : onglets,
 * carte de synthèse verte, carte « Prochaine cotisation », carte d'action du
 * fondateur, en-tête de section et bouton « Filtrer ».
 */

/* ── Onglets ── */

export function CircleTabBar({ children, label = 'Sections du cercle' }: { children: ReactNode; label?: string }) {
  return (
    <div className="border-b border-line bg-white">
      <div role="tablist" aria-label={label} className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-3 sm:px-5">
        {children}
      </div>
    </div>
  );
}

export function CircleTab({
  label,
  active,
  badge,
  onClick,
}: {
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex h-11 shrink-0 items-center gap-1.5 border-b-2 px-2.5 text-[15px] transition-colors ${
        active ? 'border-primary font-semibold text-primary' : 'border-transparent font-medium text-muted hover:text-ink'
      }`}
    >
      {label}
      {!!badge && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── Carte de synthèse (verte) ── */

export type SummaryStat = {
  label: string;
  value: string;
  /** Petit avatar avant la valeur (ex. bénéficiaire du tour). */
  person?: { name: string; uri?: string | null };
};

export function OverviewSummaryCard({
  label,
  amount,
  negative = false,
  stats,
  progress,
  dueInDays,
}: {
  label: string;
  amount: string;
  negative?: boolean;
  stats: SummaryStat[];
  /** Jours avant la prochaine cotisation (getNextContribution), en pastille ambre. */
  dueInDays?: number;
  /** Entre 0 et 1 : fine barre de progression sous les statistiques. */
  progress?: number;
}) {
  return (
    <section className="rounded-[24px] bg-primary-dark p-5 text-white">
      {dueInDays !== undefined && (
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-semibold text-amber">
          <Calendar size={13} aria-hidden />
          Prochaine cotisation {formatDueIn(dueInDays)}
        </p>
      )}
      <p className="text-[13px] text-white/75">{label}</p>
      <p className={`mt-1 text-[28px] font-bold leading-tight ${negative ? 'text-danger-tint' : 'text-white'}`}>{amount}</p>
      <div className="mt-4 flex items-center border-t border-white/20 pt-3.5">
        {stats.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && <span aria-hidden className="mx-4 h-8 w-px bg-white/20" />}
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-white/75">{s.label}</p>
              <p className="mt-1 flex min-h-[24px] items-center gap-2">
                {s.person && <Avatar name={s.person.name} uri={s.person.uri} size={24} highlighted />}
                <span className="truncate text-[15px] font-semibold text-white">{s.value}</span>
              </p>
            </div>
          </Fragment>
        ))}
      </div>
      {progress !== undefined && (
        <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-amber"
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          />
        </div>
      )}
    </section>
  );
}

/* ── Cartes blanches ── */

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary-tint text-primary">
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}

/** Carte « Prochaine cotisation » + bouton Payer. */
export function DueCard({ amount, daysLeft, onPay }: { amount: string; daysLeft?: number | null; onPay: () => void }) {
  const when = daysLeft != null ? ` · ${formatDueIn(daysLeft)}` : '';
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-line bg-white p-3.5">
      <IconTile icon={Calendar} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-muted">Prochaine cotisation{when}</p>
        <p className="mt-0.5 text-[17px] font-bold text-ink">{amount}</p>
      </div>
      <Button size="sm" onClick={onPay}>
        Payer
      </Button>
    </div>
  );
}

/** Carte d'action du fondateur (icône, titre, sous-titre, bouton). */
export function ActionCard({
  icon,
  title,
  sub,
  actionLabel,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-line bg-white p-3.5">
      <IconTile icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        <p className="mt-px text-[13px] text-muted">{sub}</p>
      </div>
      <Button size="sm" onClick={onClick}>
        {actionLabel}
      </Button>
    </div>
  );
}

/** En-tête de section (« Historique »…) avec action à droite. */
export function OverviewSectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-6 flex min-h-[36px] items-center justify-between gap-3 px-1">
      <h2 className="text-[17px] font-bold text-ink">{title}</h2>
      {right}
    </div>
  );
}

/** Bouton « Filtrer » de l'historique. */
export function HistoryFilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Filtrer par mois"
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold ${
        active ? 'border-primary bg-primary-tint text-primary' : 'border-line bg-white text-muted hover:bg-fill'
      }`}
    >
      <SlidersHorizontal size={14} aria-hidden />
      {label}
    </button>
  );
}

/** Pile des cartes du haut de l'aperçu. */
export function OverviewStack({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}
