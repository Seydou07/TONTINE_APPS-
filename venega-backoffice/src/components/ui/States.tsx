import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { initials } from '@/lib/format';
import { Spinner } from './Button';

export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-12 text-base text-ink-muted">
      <Spinner className="text-brand" /> {label}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <Inbox size={28} className="text-ink-muted" strokeWidth={1.5} />
      <p className="mt-2 text-base font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
  return (
    <div className="m-4 flex items-start gap-2 rounded-md border border-danger-line bg-danger-tint px-3 py-2 text-sm text-danger">
      <AlertCircle size={16} className="mt-0.5 shrink-0" /> {message}
    </div>
  );
}

/** Barre de progression collecte / objectif (vert, ambre une fois l'objectif atteint). */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-canvas ${className ?? ''}`} aria-hidden>
      <div className={`h-full rounded-full ${v >= 100 ? 'bg-accent' : 'bg-brand'}`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-tint font-semibold text-brand"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
