import React from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'green' | 'amber' | 'red' | 'neutral' | 'solid';

const TONES: Record<BadgeTone, string> = {
  green: 'bg-brand-tint text-brand border-brand-line',
  amber: 'bg-accent-tint text-accent-ink border-accent-line',
  red: 'bg-danger-tint text-danger border-danger-line',
  neutral: 'bg-canvas text-ink-muted border-line',
  solid: 'bg-brand-dark text-white border-brand-dark',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Petite pastille de compteur pour la navigation et les onglets. */
export function CountPill({ value, tone = 'amber' }: { value: number; tone?: 'amber' | 'red' | 'neutral' }) {
  if (value <= 0) return null;
  const cls =
    tone === 'red' ? 'bg-danger text-white' : tone === 'neutral' ? 'bg-line text-ink-soft' : 'bg-accent text-ink';
  return (
    <span className={cn('inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold leading-5', cls)}>
      {value}
    </span>
  );
}
