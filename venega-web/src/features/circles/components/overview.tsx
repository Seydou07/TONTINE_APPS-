'use client';

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Calendar, ChevronLeft, ChevronRight, SlidersHorizontal, type LucideIcon } from 'lucide-react';
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

export function CircleTabBar({
  children,
  label = 'Sections du cercle',
  width = 'wide',
}: {
  children: ReactNode;
  label?: string;
  width?: 'narrow' | 'wide';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  // Sur un petit écran, les onglets défilent : une flèche indique qu'il en reste à droite (ou à gauche).
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setMore({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    // Garde l'onglet actif visible.
    el.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, children]);

  const scrollBy = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 120, behavior: 'smooth' });
  const arrow =
    'absolute top-0 z-[1] flex h-11 w-9 items-center justify-center bg-white text-primary shadow-[0_0_8px_8px_#fff]';

  return (
    <div className="sticky top-0 z-20 border-b border-line bg-white">
      <div className={`relative mx-auto ${width === 'wide' ? 'max-w-2xl lg:max-w-6xl lg:px-3' : 'max-w-2xl'}`}>
        {more.left && (
          <button type="button" aria-label="Onglets précédents" onClick={() => scrollBy(-1)} className={`${arrow} left-0`}>
            <ChevronLeft size={18} aria-hidden />
          </button>
        )}
        <div
          ref={ref}
          role="tablist"
          aria-label={label}
          className="flex gap-0.5 overflow-x-auto px-1.5 [scrollbar-width:none] sm:gap-1 sm:px-5 [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        {more.right && (
          <button type="button" aria-label="Onglets suivants" onClick={() => scrollBy(1)} className={`${arrow} right-0`}>
            <ChevronRight size={18} aria-hidden />
          </button>
        )}
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
      className={`flex h-11 shrink-0 items-center gap-1.5 border-b-2 px-2 text-[14px] transition-colors sm:px-3 sm:text-[15px] ${
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
export function OverviewSectionHeader({
  title,
  right,
  className = '',
}: {
  title: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-2.5 mt-6 flex min-h-[36px] items-center justify-between gap-3 px-1 ${className}`}>
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

/* ── Mise en page web (≥ 1024 px) ──
 * Sur téléphone et tablette, l'écran garde exactement la disposition mobile (une colonne).
 * Sur ordinateur : contenu large, deux colonnes, listes en grille.
 */

/** Corps d'un écran de cercle : colonne mobile, élargie sur ordinateur. */
export function CircleBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-2xl px-4 pb-10 pt-4 sm:px-6 lg:max-w-6xl lg:px-8 lg:pt-6 ${className}`}>{children}</div>;
}

/**
 * Deux colonnes sur ordinateur : `aside` à gauche (carte de synthèse, roue, actions), collée en haut
 * pendant le défilement ; `children` à droite (historique, liste). Une seule colonne sur téléphone.
 */
export function CircleColumns({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-[60px]">{aside}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Liste de lignes : un seul bloc blanc sur téléphone (comme le mobile), une grille de cartes sur
 * ordinateur. À combiner avec `gridRow` sur chaque ligne et `gridRowBody` sur le contenu bordé.
 */
export const gridList =
  'overflow-hidden rounded-[20px] border border-line bg-white lg:grid lg:grid-cols-2 lg:gap-3 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent';
export const gridRow = 'lg:overflow-hidden lg:rounded-[16px] lg:border lg:border-line lg:bg-white';
/** Supprime le filet de séparation des lignes quand elles deviennent des cartes. */
export const gridRowBody = 'lg:border-b-0';
