'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher…',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn('relative block w-full sm:w-72', className)}>
      <span className="sr-only">{placeholder}</span>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-9 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-ink"
          aria-label="Effacer la recherche"
        >
          <X size={14} />
        </button>
      )}
    </label>
  );
}

export interface FilterOption<V extends string> {
  value: V;
  label: string;
  count?: number;
}

/** Filtres en onglets segmentés, défilables sur petit écran. */
export function FilterTabs<V extends string>({
  options,
  value,
  onChange,
}: {
  options: FilterOption<V>[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1" role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors',
              active ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink-soft hover:border-brand-line hover:text-brand',
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn('rounded px-1 text-xs', active ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted')}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-sm text-ink-muted">
      <span>
        {formatNumber(from)}–{formatNumber(to)} sur {formatNumber(total)}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2 text-ink-soft hover:bg-brand-tint disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Précédent
        </button>
        <span className="px-2 text-ink">
          {page} / {pages}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2 text-ink-soft hover:bg-brand-tint disabled:opacity-40"
        >
          Suivant <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/** Barre d'outils standard au-dessus d'une liste. */
export function ListToolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 border-b border-line px-4 py-3 lg:flex-row lg:items-center lg:justify-between">{children}</div>;
}
