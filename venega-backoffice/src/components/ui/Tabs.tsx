'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export interface TabItem<V extends string> {
  value: V;
  label: string;
  count?: number;
  /** Compteur en rouge (problème à traiter) */
  alert?: boolean;
}

/** Onglets de section d'une fiche (soulignés), défilables sur petit écran. */
export function Tabs<V extends string>({ items, value, onChange }: { items: TabItem<V>[]; value: V; onChange: (v: V) => void }) {
  return (
    <div className="-mx-1 mb-4 flex gap-1 overflow-x-auto border-b border-line px-1" role="tablist">
      {items.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              '-mb-px inline-flex h-10 shrink-0 items-center gap-1.5 border-b-2 px-3 text-base font-medium transition-colors',
              active ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-brand',
            )}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={cn(
                  'rounded px-1.5 text-xs font-semibold leading-5',
                  t.alert ? 'bg-danger text-white' : active ? 'bg-brand-tint text-brand' : 'bg-canvas text-ink-muted',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
