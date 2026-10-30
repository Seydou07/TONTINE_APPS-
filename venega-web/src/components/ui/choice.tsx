'use client';

import type { ReactNode } from 'react';
import { Minus, Plus, type LucideIcon } from 'lucide-react';

/*
 * Contrôles de choix, mêmes rôles que venega-mobile/src/components/ui/Choice.tsx :
 * Chip, OptionCard, Segmented, NumberStepper, SettingRow (Toggle est dans Toggle.tsx).
 */

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Puce de sélection (fréquence, montant, seuil…). */
export function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`h-10 rounded-full border px-4 text-[15px] font-medium transition-colors ${focusRing} ${
        selected ? 'border-primary bg-primary text-white' : 'border-line-strong bg-white text-ink hover:bg-fill'
      }`}
    >
      {label}
    </button>
  );
}

/** Rangée de puces (groupe radio). */
export function ChipGroup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {children}
    </div>
  );
}

/** Carte d'option avec bouton radio. */
export function OptionCard({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
  badge,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3.5 rounded-[20px] border bg-white p-4 text-left transition-colors ${focusRing} ${
        selected ? 'border-primary bg-[#F7FBF9] ring-1 ring-primary' : 'border-line hover:bg-fill'
      }`}
    >
      {Icon && (
        <span
          aria-hidden
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${
            selected ? 'bg-primary text-white' : 'bg-primary-tint text-primary'
          }`}
        >
          <Icon size={22} strokeWidth={1.8} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold text-ink">{title}</span>
          {badge && (
            <span className="rounded-full bg-amber-tint px-2 py-0.5 text-[12px] font-semibold text-amber-dark">
              {badge}
            </span>
          )}
        </span>
        {description && <span className="mt-0.5 block text-[13px] text-muted">{description}</span>}
      </span>
      <span
        aria-hidden
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary' : 'border-line-strong'
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
    </button>
  );
}

/** Choix segmenté (deux ou trois options courtes). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (key: T) => void;
  label?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-[14px] bg-fill p-1">
      {options.map(({ key, label: text, icon: Icon }) => {
        const selected = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(key)}
            className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[11px] text-[14px] font-semibold transition-colors ${focusRing} ${
              selected ? 'bg-white text-primary-dark shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            {Icon && <Icon size={17} aria-hidden />}
            {text}
          </button>
        );
      })}
    </div>
  );
}

/** Compteur − / +. */
export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  const btn = `flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-fill disabled:opacity-40 ${focusRing}`;
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} aria-label="Diminuer">
        <Minus size={18} aria-hidden />
      </button>
      <span className="min-w-[2ch] text-center text-[17px] font-bold text-ink" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} aria-label="Augmenter">
        <Plus size={18} aria-hidden />
      </button>
    </div>
  );
}

/** Ligne de réglage : libellé + description à gauche, contrôle à droite. */
export function SettingRow({
  title,
  description,
  children,
  last = false,
  id,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  last?: boolean;
  /** Identifiant du titre, à passer au contrôle (`labelledBy`). */
  id?: string;
}) {
  return (
    <div className={`flex items-center gap-3 py-3.5 ${last ? '' : 'border-b border-line'}`}>
      <div className="min-w-0 flex-1">
        <p id={id} className="text-[15px] font-semibold text-ink">
          {title}
        </p>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
