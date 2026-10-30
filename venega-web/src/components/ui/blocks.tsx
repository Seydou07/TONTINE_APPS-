import type { ReactNode } from 'react';
import { Check, type LucideIcon } from 'lucide-react';

/*
 * Briques des écrans d'action (mêmes rôles que
 * venega-mobile/src/features/circles/components/ActionScreenParts.tsx).
 */

type Tone = 'info' | 'warning' | 'danger' | 'primary' | 'neutral';

const TONES: Record<Tone, { box: string; fg: string }> = {
  // Pas de bleu : « info » reprend le vert clair du logo.
  info: { box: 'bg-primary-tint', fg: 'text-primary-dark' },
  warning: { box: 'bg-amber-tint', fg: 'text-amber-dark' },
  danger: { box: 'bg-danger-tint', fg: 'text-danger' },
  primary: { box: 'bg-primary-tint', fg: 'text-primary-dark' },
  neutral: { box: 'bg-fill', fg: 'text-ink-soft' },
};

/** Carte blanche à bord fin. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[20px] border border-line bg-white ${className}`}>{children}</div>;
}

/** Titre de section (17 px). */
export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-[17px] font-bold text-ink ${className}`}>{children}</h2>;
}

/** Encadré teinté : icône + titre facultatif + texte. */
export function Notice({
  icon: Icon,
  title,
  children,
  tone = 'info',
  className = '',
}: {
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div className={`flex items-start gap-2.5 rounded-[14px] p-3.5 ${t.box} ${className}`}>
      {Icon && <Icon size={18} className={`mt-px shrink-0 ${t.fg}`} aria-hidden />}
      <div className="min-w-0 flex-1">
        {title && <p className={`text-[14px] font-semibold ${t.fg}`}>{title}</p>}
        <div className="text-[13px] leading-relaxed text-ink-soft">{children}</div>
      </div>
    </div>
  );
}

/** Case à cocher avec libellé (confirmation). */
export function CheckRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-2 ${
          checked ? 'border-primary bg-primary' : 'border-line-strong bg-white'
        }`}
      >
        {checked && <Check size={14} strokeWidth={3} className="text-white" />}
      </span>
      <span className="text-[14px] text-ink">{label}</span>
    </button>
  );
}

/** Ligne libellé / valeur. */
export function KeyValue({
  label,
  value,
  strong = false,
  last = false,
  valueClassName = '',
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
  last?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 ${last ? '' : 'border-b border-line'}`}>
      <span className={`text-[14px] ${strong ? 'font-semibold text-ink' : 'text-muted'}`}>{label}</span>
      <span className={`min-w-0 text-right text-[15px] ${strong ? 'font-bold' : 'font-medium'} text-ink ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

/** État centré (succès, vide, bloqué) : pastille 56 px + titre + texte. */
export function CenteredState({
  icon: Icon,
  tone = 'primary',
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  tone?: Tone;
  title: string;
  text?: ReactNode;
  children?: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div className="flex flex-col items-center px-2 py-8 text-center">
      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${t.box} ${t.fg}`}>
        <Icon size={26} strokeWidth={1.8} aria-hidden />
      </span>
      <h2 className="mt-4 text-[17px] font-bold text-ink">{title}</h2>
      {text && <p className="mt-1.5 max-w-sm text-[14px] text-muted">{text}</p>}
      {children && <div className="mt-6 w-full max-w-sm space-y-2.5">{children}</div>}
    </div>
  );
}

/**
 * Pied d'écran collé en bas (boutons d'action), comme `ScreenFooter` mobile.
 * Sur les écrans sans onglets du bas, il reste visible pendant le défilement.
 */
export function ScreenFooter({ children }: { children: ReactNode }) {
  return (
    <div
      className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-line bg-white px-4 py-3 sm:-mx-6 sm:px-6"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

/** Contenu d'un écran secondaire (sous un PageHeader) : colonne étroite, marges 16 px. */
export function ScreenBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-2xl space-y-5 px-4 pb-8 pt-4 sm:px-6 ${className}`}>{children}</div>;
}
