'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CircleDot, CreditCard, HandHeart, Headphones, Search, User, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/ui/Button';
import { globalSearch, type SearchKind } from '../api';

const ICON: Record<SearchKind, React.ElementType> = { user: User, circle: CircleDot, payment: CreditCard, fundraiser: HandHeart, ticket: Headphones };
const GROUP: Record<SearchKind, string> = { user: 'Utilisateurs', circle: 'Cercles', payment: 'Paiements', ticket: 'Tickets', fundraiser: 'Cagnottes' };

/** Bouton de la barre du haut + fenêtre de recherche (Ctrl+K / Cmd+K, ou « / »). */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-canvas px-3 text-left text-base text-ink-muted hover:border-brand-line sm:max-w-md"
      >
        <Search size={16} className="shrink-0" />
        <span className="flex-1 truncate">Téléphone, nom, cercle, code, référence…</span>
        <kbd className="hidden rounded border border-line bg-white px-1.5 text-xs font-medium text-ink-soft sm:inline">Ctrl K</kbd>
      </button>
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setQ(text.trim()), 150);
    return () => clearTimeout(t);
  }, [text]);

  const query = useQuery({ queryKey: ['search', q], queryFn: () => globalSearch(q), enabled: q.length >= 2 });
  const results = q.length >= 2 ? query.data ?? [] : [];

  useEffect(() => setActive(0), [q]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]!.href);
    }
  };

  let lastKind: SearchKind | null = null;

  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center p-2 pt-[8vh] sm:p-4 sm:pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Recherche" className="relative flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-white">
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search size={18} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="70 12 34 56, Ouédraogo, CRC-…, VP-…, OM2410…, T-1003"
            className="h-14 min-w-0 flex-1 bg-transparent text-lg text-ink placeholder:text-ink-muted focus:outline-none"
            aria-label="Rechercher"
            autoComplete="off"
          />
          {query.isFetching && <Spinner className="text-brand" />}
          <button type="button" onClick={onClose} className="rounded p-1 text-ink-muted hover:text-ink" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto">
          {q.length < 2 ? (
            <div className="space-y-1 px-4 py-4 text-sm text-ink-muted">
              <p>Tapez le numéro tel que l’appelant le dicte : avec ou sans +226, avec ou sans espaces.</p>
              <p>Ou : nom, nom du cercle, code d’invitation (CRC-…), référence de paiement (VP-…) ou opérateur, code de cagnotte, numéro de ticket.</p>
              <p>Entrée ouvre le premier résultat ; flèches haut / bas pour choisir.</p>
            </div>
          ) : results.length === 0 && !query.isFetching ? (
            <p className="px-4 py-6 text-center text-base text-ink-muted">Aucun résultat pour « {q} ».</p>
          ) : (
            <ul className="py-1">
              {results.map((r, i) => {
                const Icon = ICON[r.kind];
                const header = r.kind !== lastKind ? GROUP[r.kind] : null;
                lastKind = r.kind;
                return (
                  <li key={`${r.kind}-${r.id}`}>
                    {header && <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{header}</p>}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(r.href)}
                      className={cn('flex w-full items-center gap-3 px-4 py-2 text-left', i === active ? 'bg-brand-tint' : 'hover:bg-canvas')}
                    >
                      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', i === active ? 'bg-white text-brand' : 'bg-canvas text-ink-soft')}>
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-medium text-ink">{r.title}</span>
                        <span className="block truncate text-sm text-ink-muted">{r.subtitle}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
