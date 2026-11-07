'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, Gift, HandHeart, HeartHandshake, Plus, UserPlus, Users, type LucideIcon } from 'lucide-react';
import { CircleType, type Circle } from '@venega/types';
import { Avatar } from '@/components/ui/Avatar';
import { HeroBand } from '@/components/ui/HeroBand';
import { useDemoStore } from '@/lib/demoStore';
import { formatF } from '@/lib/format';
import { getProfile } from '@/features/profile/store';
import { hasUnreadNotifications } from '@/features/notifications/api';
import { getCircles, getNextContribution } from '@/features/circles/store';
import { circleHref } from '@/features/circles/components/CircleRedirect';

/** Hauteur dont le diaporama chevauche le bandeau vert. */
const CARD_OVERLAP = 40;

function circleMeta(c: Circle): { icon: LucideIcon; subtitle: string } {
  if (c.type === CircleType.AID_APPEAL) {
    return { icon: HeartHandshake, subtitle: `Collecte · objectif ${formatF(c.rules.goalAmount ?? 0)}` };
  }
  if (c.type === CircleType.NATURE) {
    return { icon: Gift, subtitle: `${c.memberCount} membres · ${c.rules.goalItem ?? 'En nature'}` };
  }
  if (c.type === CircleType.SOLIDARITY_ONLY) {
    return { icon: HeartHandshake, subtitle: `${c.memberCount} membres · Solidarité` };
  }
  return { icon: Users, subtitle: `${c.memberCount} membres · ${formatF(c.tontineAmount)} par tour` };
}

/** Onglet Accueil (DashboardScreen mobile). */
export function DashboardView() {
  useDemoStore();
  const profile = getProfile();
  const circles = getCircles();
  // Lu après le montage : l'état « lu » est dans le navigateur.
  const [unread, setUnread] = useState(false);
  useEffect(() => setUnread(hasUnreadNotifications()), []);

  return (
    <div className="pb-8">
      {/* ── Section verte : salutation ── */}
      <HeroBand overlap={CARD_OVERLAP}>
        <div className="flex items-center gap-3.5">
          <Link href="/profile" aria-label="Mon profil" className="shrink-0 rounded-full ring-2 ring-amber">
            <Avatar name={profile.name} uri={profile.avatarUrl} size={52} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-amber">Bonjour</p>
            <p className="mt-0.5 truncate text-[18px] font-bold text-white">{profile.name}</p>
          </div>
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-amber hover:bg-white/15"
          >
            <Bell size={22} strokeWidth={1.9} aria-hidden />
            {unread ? (
              <span aria-hidden className="absolute right-[11px] top-[10px] h-2 w-2 rounded-full border-[1.5px] border-primary-dark bg-danger" />
            ) : null}
          </Link>
        </div>
      </HeroBand>

      {/*
        Le diaporama de bannières de l'app mobile n'est pas repris sur le web : ses messages
        renvoient aux mêmes actions que les trois cartes ci-dessous, qui chevauchent le vert.
      */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6" style={{ marginTop: -CARD_OVERLAP }}>
        {/* ── Actions ── */}
        <div className="grid grid-cols-3 gap-2.5 md:gap-4">
          <ActionTile icon={Plus} label="Créer un cercle" text="Tontine ou caisse de solidarité" href="/circles/create" />
          <ActionTile icon={UserPlus} label="Rejoindre un cercle" text="Avec le code d’invitation" href="/circles/join" />
          <ActionTile icon={HandHeart} label="Lancer une cagnotte" text="Un lien à partager pour collecter" href="/aid/create" />
        </div>

        {/* ── Mes cercles ── */}
        <div className="mb-2.5 mt-7 flex items-center justify-between px-1">
          <h2 className="text-[17px] font-bold text-ink">Mes cercles</h2>
          <Link href="/circles" className="text-[13px] font-semibold text-primary hover:underline">
            Voir tout
          </Link>
        </div>
        <ul className="overflow-hidden rounded-[20px] border border-line bg-white">
          {circles.slice(0, 5).map((c, i, list) => {
            const { icon: Icon, subtitle } = circleMeta(c);
            const active = !!c.activatedAt;
            return (
              <li key={c.id}>
                <Link href={circleHref(c)} className="flex items-center gap-3 pl-3.5 hover:bg-fill">
                  <span
                    aria-hidden
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
                      active ? 'bg-primary-tint text-primary' : 'bg-fill text-subtle'
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span
                    className={`flex min-w-0 flex-1 items-center gap-2.5 py-3.5 pr-3.5 ${
                      i < list.length - 1 ? 'border-b border-line' : ''
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-ink">{c.name}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted">
                        {active ? subtitle : 'En attente d’activation'}
                      </span>
                    </span>
                    {active && <DueTag circle={c} />}
                    <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Échéance courte à droite d'une ligne de cercle : « Aujourd’hui », « Demain », « Dans 3 j ». */
function DueTag({ circle }: { circle: Circle }) {
  const next = getNextContribution(circle);
  if (!next) return null;
  const label = next.daysLeft <= 0 ? 'Aujourd’hui' : next.daysLeft === 1 ? 'Demain' : `Dans ${next.daysLeft} j`;
  const soon = next.daysLeft <= 1;
  return (
    <span
      className={`shrink-0 rounded-[10px] px-2 py-[3px] text-[12px] font-semibold ${
        soon ? 'bg-amber-tint text-amber-dark' : 'bg-primary-tint text-primary'
      }`}
    >
      {label}
    </span>
  );
}

/** Carte d'action : empilée sur téléphone (comme le mobile), en ligne avec une précision sur ordinateur. */
function ActionTile({ icon: Icon, label, text, href }: { icon: LucideIcon; label: string; text: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-[20px] border border-line bg-white px-2 py-3.5 text-center transition-colors hover:border-primary/40 hover:bg-[#F7FAF8] md:flex-row md:gap-3.5 md:px-4 md:py-4 md:text-left"
    >
      <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-dark md:h-11 md:w-11">
        <Icon size={20} strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-tight text-ink md:text-[15px]">{label}</span>
        <span className="mt-0.5 hidden text-[13px] text-muted md:block">{text}</span>
      </span>
    </Link>
  );
}
