'use client';

import { useState } from 'react';
import { EyeOff } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { PublicContribution } from '../types';
import { OPERATORS, formatNumber, formatXof } from '../format';

interface ContributionListProps {
  contributions: PublicContribution[];
  totalCount: number;
  /** Id de la contribution que le visiteur vient de faire (mise en évidence). */
  highlightId?: string;
  pageSize?: number;
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

/**
 * Liste des contributeurs (nom ou « Anonyme », date, opérateur, montant),
 * chargée page par page avec « Voir plus » comme sur le mobile.
 * TODO API : pagination serveur (curseur) de `GET /public/appeals/:code`.
 */
export function ContributionList({ contributions, totalCount, highlightId, pageSize = 15 }: ContributionListProps) {
  const [visible, setVisible] = useState(pageSize);
  const shown = contributions.slice(0, visible);
  const hasMore = visible < contributions.length;

  return (
    <section aria-labelledby="contributions-title">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 id="contributions-title" className="text-[17px] font-bold text-ink">
          Contributeurs
        </h2>
        <span className="text-[13px] font-semibold text-muted">{formatNumber(totalCount)}</span>
      </div>

      {shown.length === 0 ? (
        <p className="py-4 text-[15px] text-muted">
          Aucune contribution pour l’instant. Partagez le lien pour lancer la collecte.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((c) => {
            const name = c.displayName ?? 'Anonyme';
            return (
              <li key={c.id} className="flex items-center gap-3 py-3">
                {c.displayName ? (
                  <Avatar name={c.displayName} size={40} />
                ) : (
                  <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fill text-muted">
                    <EyeOff size={18} strokeWidth={1.8} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                    <span className="truncate">{name}</span>
                    {c.id === highlightId && (
                      <span className="shrink-0 rounded-full bg-amber-tint px-2 py-0.5 text-[11px] font-semibold text-amber-dark">
                        Vous
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {shortDate(c.createdAt)} · {c.paymentMethod ? OPERATORS[c.paymentMethod].label : 'Mobile Money'}
                  </p>
                </div>
                <span className="shrink-0 text-[15px] font-bold text-ink">{formatXof(c.amount)}</span>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + pageSize)}
          className="mt-2 h-12 w-full rounded-full border border-line text-[15px] font-semibold text-primary hover:bg-fill"
        >
          Voir plus
        </button>
      )}
    </section>
  );
}
