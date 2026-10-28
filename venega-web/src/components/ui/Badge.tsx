import type { ReactNode } from 'react';

export type BadgeTone = 'green' | 'amber' | 'neutral' | 'danger' | 'onDark';

const TONES: Record<BadgeTone, { box: string; dot: string }> = {
  green: { box: 'bg-primary-tint text-primary-dark', dot: 'bg-primary' },
  amber: { box: 'bg-amber-tint text-amber-dark', dot: 'bg-amber' },
  neutral: { box: 'bg-fill text-muted', dot: 'bg-muted' },
  danger: { box: 'bg-danger-tint text-danger', dot: 'bg-danger' },
  onDark: { box: 'bg-white/10 text-white', dot: 'bg-amber' },
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/** Pastille de statut (« Payé », « En attente », « Tontine »…). */
export function Badge({ tone = 'neutral', dot = false, children, className = '' }: BadgeProps) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${t.box} ${className}`}
    >
      {dot && <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />}
      {children}
    </span>
  );
}
