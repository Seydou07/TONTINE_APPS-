'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronRight, Clock, Gift, HeartHandshake, Plus, Repeat, Search, Users, X, type LucideIcon } from 'lucide-react';
import { CircleType, type Circle } from '@venega/types';
import { HeroBand, HeroTitle } from '@/components/ui/HeroBand';
import { Button } from '@/components/ui/Button';
import { Chip, ChipGroup } from '@/components/ui/choice';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { CIRCLE_CREATION_FEE, formatDueIn, getCircles, getFounderCircleIds, getNextContribution } from '../store';
import { circleHref } from './CircleRedirect';

type RoleFilter = 'ALL' | 'CREATED' | 'MEMBER';

// Pas de bleu : la solidarité reprend le vert du logo.
const typeMeta: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  TONTINE_ONLY: { label: 'Tontine', icon: Repeat, tone: 'bg-primary-tint text-primary' },
  NATURE: { label: 'Tontine en nature', icon: Gift, tone: 'bg-amber-tint text-amber-dark' },
  SOLIDARITY_ONLY: { label: 'Solidarité', icon: HeartHandshake, tone: 'bg-primary-tint text-primary-dark' },
  AID_APPEAL: { label: 'Appel à l’aide', icon: HeartHandshake, tone: 'bg-danger-tint text-danger' },
};

const frequencyText: Record<string, string> = {
  DAILY: 'Chaque jour',
  WEEKLY: 'Chaque semaine',
  BIWEEKLY: 'Toutes les 2 semaines',
  MONTHLY: 'Chaque mois',
};

const activationHref = (id: string) => `/payment?circleId=${id}&type=ACTIVATION`;

/** Onglet Cercles (CirclesScreen mobile). */
export function CirclesView() {
  useDemoStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  const circles = getCircles();
  const createdCircleIds = getFounderCircleIds();
  const activeCount = circles.filter((c) => !!c.activatedAt).length;
  const pendingCount = circles.length - activeCount;

  const filteredCircles = circles.filter((circle) => {
    if (!circle.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) return false;
    const isOwner = createdCircleIds.includes(circle.id);
    if (roleFilter === 'CREATED') return isOwner;
    if (roleFilter === 'MEMBER') return !isOwner;
    return true;
  });

  const openHref = (circle: Circle) => (circle.activatedAt ? circleHref(circle) : activationHref(circle.id));

  return (
    <div className="pb-8">
      <HeroBand>
        <HeroTitle
          title="Mes cercles"
          subtitle={`${activeCount} actif${activeCount > 1 ? 's' : ''}${pendingCount > 0 ? ` · ${pendingCount} en attente` : ''}`}
          right={
            <Link
              href="/circles/join"
              aria-label="Rejoindre un cercle"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-amber hover:bg-white/15"
            >
              <Plus size={22} aria-hidden />
            </Link>
          }
        />
      </HeroBand>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Recherche + filtres */}
        <div className="mt-4 space-y-3">
          <div className="flex h-12 items-center gap-2.5 rounded-[14px] border border-line bg-white px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search size={18} className="shrink-0 text-subtle" aria-hidden />
            <input
              type="search"
              aria-label="Rechercher un cercle"
              placeholder="Rechercher un cercle"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-subtle focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} aria-label="Effacer" className="text-subtle hover:text-ink">
                <X size={16} aria-hidden />
              </button>
            )}
          </div>
          <ChipGroup label="Filtrer les cercles">
            <Chip label={`Tous · ${circles.length}`} selected={roleFilter === 'ALL'} onClick={() => setRoleFilter('ALL')} />
            <Chip label="Créés par moi" selected={roleFilter === 'CREATED'} onClick={() => setRoleFilter('CREATED')} />
            <Chip label="Membre" selected={roleFilter === 'MEMBER'} onClick={() => setRoleFilter('MEMBER')} />
          </ChipGroup>
        </div>

        {filteredCircles.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fill text-subtle">
              <Users size={24} strokeWidth={1.6} aria-hidden />
            </span>
            <p className="mt-3 text-[17px] font-bold text-ink">Aucun cercle trouvé</p>
            <p className="mt-1 text-[14px] text-muted">Essayez un autre mot-clé ou un autre filtre.</p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            {filteredCircles.map((circle) => {
              const meta = typeMeta[circle.type] ?? typeMeta.TONTINE_ONLY!;
              const Icon = meta.icon;
              const isAid = circle.type === CircleType.AID_APPEAL;
              const isFounder = createdCircleIds.includes(circle.id);
              const pending = !circle.activatedAt;
              const next = !pending && !isAid ? getNextContribution(circle) : undefined;
              const amount = isAid
                ? circle.rules?.goalAmount ?? 0
                : (circle.tontineAmount || 0) + (circle.solidarityAmount || 0);
              return (
                <li key={circle.id} className="rounded-[20px] border border-line bg-white">
                  <Link href={openHref(circle)} className="block rounded-[20px] p-4 hover:bg-fill/60">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${
                          pending ? 'bg-fill text-subtle' : meta.tone
                        }`}
                      >
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-[15px] font-semibold text-ink">{circle.name}</span>
                        <span className="mt-0.5 block truncate text-[13px] text-muted">
                          {meta.label} · {isFounder ? 'Fondateur' : 'Membre'}
                        </span>
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden />
                    </span>
                    <span className="mt-3.5 grid grid-cols-3 gap-2 border-t border-line pt-3">
                      <Stat label={isAid ? 'Objectif' : 'Cotisation'} value={formatFcfa(amount)} />
                      <Stat label={isAid ? 'Contributeurs' : 'Membres'} value={`${circle.memberCount}`} />
                      <Stat label="Fréquence" value={isAid ? '—' : frequencyText[circle.frequency] ?? 'Régulière'} />
                    </span>
                    {next && (
                      <span className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                        <Calendar size={15} aria-hidden />
                        Prochaine cotisation {formatDueIn(next.daysLeft)}
                      </span>
                    )}
                  </Link>
                  {pending && (
                    <div className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-2.5 rounded-[14px] bg-amber-tint p-3">
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-dark">
                        <Clock size={16} aria-hidden />
                        En attente d’activation
                      </span>
                      <Button size="sm" onClick={() => router.push(activationHref(circle.id))}>
                        Activer · {formatFcfa(CIRCLE_CREATION_FEE)}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0">
      <span className="block text-[12px] text-muted">{label}</span>
      <span className="mt-0.5 block truncate text-[14px] font-semibold text-ink">{value}</span>
    </span>
  );
}
