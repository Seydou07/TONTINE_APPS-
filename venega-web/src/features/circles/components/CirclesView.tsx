'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, UserPlus, Users } from 'lucide-react';
import { CircleType, mockCircles } from '@venega/types';
import { HeroBand, HeroTitle, PageBody } from '@/components/ui/HeroBand';
import { btnAmber, btnSmallSecondary, card } from '@/components/ui/classes';
import { EmptyState } from '@/components/ui/misc';
import { CircleCard } from './CircleCard';
import { isTontine } from '../labels';

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'tontine', label: 'Tontines' },
  { key: 'solidarity', label: 'Solidarité' },
] as const;
type FilterKey = (typeof FILTERS)[number]['key'];

const OVERLAP = 28;

export function CirclesView() {
  const [filter, setFilter] = useState<FilterKey>('all');

  const circles = mockCircles.filter((c) => {
    if (filter === 'tontine') return isTontine(c.type);
    if (filter === 'solidarity') return c.type === CircleType.SOLIDARITY_ONLY || c.type === CircleType.AID_APPEAL;
    return true;
  });

  return (
    <>
      <HeroBand overlap={OVERLAP}>
        <HeroTitle
          title="Mes cercles"
          subtitle={`${mockCircles.length} cercles — tontines et caisses de solidarité`}
          right={
            <Link href="/circles/create" className={btnAmber}>
              <Plus size={18} aria-hidden />
              Créer
            </Link>
          }
        />
      </HeroBand>

      <PageBody overlap={OVERLAP}>
        <div className={`${card} flex items-center gap-1 p-1.5`} role="tablist" aria-label="Filtrer les cercles">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={`h-10 flex-1 rounded-[12px] text-[14px] font-semibold transition-colors ${
                  active ? 'bg-primary text-white' : 'text-ink-soft hover:bg-fill'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {circles.length === 0 ? (
          <EmptyState icon={Users} title="Aucun cercle" text="Aucun cercle ne correspond à ce filtre." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {circles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} />
            ))}
          </div>
        )}

        <div className={`${card} flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center`}>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-ink">Vous avez reçu un code d&apos;invitation ?</p>
            <p className="mt-0.5 text-[14px] text-muted">Rejoignez le cercle d&apos;un proche en quelques étapes.</p>
          </div>
          <Link href="/circles/join" className={btnSmallSecondary}>
            <UserPlus size={16} aria-hidden />
            Rejoindre un cercle
          </Link>
        </div>
      </PageBody>
    </>
  );
}
