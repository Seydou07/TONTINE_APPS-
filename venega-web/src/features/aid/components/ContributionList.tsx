'use client';

import { useState } from 'react';
import { EyeOff } from 'lucide-react';
import type { PublicContribution } from '../types';
import { OPERATORS, formatNumber, formatRelative, formatXof } from '../format';
import { card, sectionTitle } from '../ui';
import { OperatorLogo } from './OperatorMark';

const PAGE_SIZE = 10;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '';
  return (first + last).toUpperCase();
}

interface ContributionListProps {
  contributions: PublicContribution[];
  totalCount: number;
  now: number;
  /** Id de la contribution que le visiteur vient de faire (mise en évidence) */
  highlightId?: string;
}

export function ContributionList({ contributions, totalCount, now, highlightId }: ContributionListProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = contributions.slice(0, visible);
  // TODO: remplacer par la pagination serveur (curseur) quand l'API sera prête.
  const hasMore = visible < contributions.length;

  return (
    <section aria-labelledby="contributions-title" className={`${card} p-5`}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="contributions-title" className={sectionTitle}>
          Contributions
        </h2>
        <span className="text-[13px] text-[#5B6B65]">{formatNumber(totalCount)} au total</span>
      </div>

      {shown.length === 0 ? (
        <p className="py-6 text-center text-[15px] text-[#5B6B65]">
          Aucune contribution pour le moment. Soyez le premier à aider.
        </p>
      ) : (
        <ul className="divide-y divide-[#EEF0F2]">
          {shown.map((c) => {
            const isNew = c.id === highlightId;
            return (
              <li key={c.id} className="flex items-start gap-3 py-3">
                <span
                  aria-hidden
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${
                    c.displayName ? 'bg-[#E4F0EB] text-primary-dark' : 'bg-[#F4F5F7] text-[#5B6B65]'
                  }`}
                >
                  {c.displayName ? initials(c.displayName) : <EyeOff size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-[15px] font-semibold text-[#12261E]">
                    <span className="truncate">{c.displayName ?? 'Anonyme'}</span>
                    {isNew && (
                      <span className="shrink-0 rounded-full bg-[#FFF4DE] px-2 py-0.5 text-[11px] font-semibold text-[#8A5A00]">
                        Vous
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#5B6B65]">
                    <span>{formatRelative(c.createdAt, now)}</span>
                    <span aria-hidden>·</span>
                    <OperatorLogo method={c.paymentMethod} size={16} decorative />
                    <span className="truncate">{OPERATORS[c.paymentMethod].label}</span>
                  </p>
                  {c.message && (
                    <p className="mt-1.5 break-words text-[14px] text-[#12261E]">« {c.message} »</p>
                  )}
                </div>
                <span className="shrink-0 text-[15px] font-bold text-[#12261E]">{formatXof(c.amount)}</span>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-2 h-11 w-full rounded-[12px] border border-[#E5E7EB] text-[14px] font-semibold text-primary hover:bg-[#F4F5F7]"
        >
          Voir plus
        </button>
      )}
    </section>
  );
}
