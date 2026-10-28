import Link from 'next/link';
import { Bell, HandHeart, History, Plus, UserPlus, CalendarClock } from 'lucide-react';
import { mockCircles, mockCurrentUser, mockMemberships, mockNotifications, PaymentStatus } from '@venega/types';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { HeroBand, HeroTitle, PageBody } from '@/components/ui/HeroBand';
import { btnPrimary, card } from '@/components/ui/classes';
import { IconTile, SectionHeader } from '@/components/ui/misc';
import { CircleCard } from '@/features/circles/components/CircleCard';
import { frequencyLabel, isTontine, mainContribution } from '@/features/circles/labels';
import { formatFcfa } from '@/lib/format';
import NotificationsList from './NotificationsList';

const QUICK_ACTIONS = [
  { label: 'Créer', icon: Plus, href: '/circles/create' },
  { label: 'Rejoindre', icon: UserPlus, href: '/circles/join' },
  { label: 'Solidarité', icon: HandHeart, href: '/solidarity' },
  { label: 'Historique', icon: History, href: '/activity' },
];

const OVERLAP = 56;

export function DashboardView() {
  // Prochaine cotisation : premier cercle où la cotisation du tour est en attente (démo : u1).
  const pending = mockMemberships.find((m) => m.userId === 'u1' && m.paymentStatus === PaymentStatus.PENDING);
  const nextCircle = pending ? mockCircles.find((c) => c.id === pending.circleId) : undefined;
  const nextAmount = nextCircle ? mainContribution(nextCircle) : 0;
  const nextType = nextCircle && isTontine(nextCircle.type) ? 'TONTINE' : 'SOLIDARITY';
  const unread = mockNotifications.some((n) => n.userId === 'u1' && !n.read);

  return (
    <>
      <HeroBand overlap={OVERLAP}>
        <div className="mb-5 flex items-center justify-between md:hidden">
          <BrandLogo onDark href="/dashboard" />
          <Link
            href="#notifications"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <Bell size={20} aria-hidden />
            {unread && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber" />}
          </Link>
        </div>
        <HeroTitle
          eyebrow="Tableau de bord"
          title={`Bonjour, ${mockCurrentUser.firstName}`}
          subtitle="Voici où en sont vos cercles aujourd'hui."
        />
      </HeroBand>

      <PageBody overlap={OVERLAP}>
        {/* Prochaine cotisation */}
        {nextCircle ? (
          <section className={`${card} p-5`} aria-labelledby="next-title">
            <div className="flex items-start gap-3">
              <IconTile icon={CalendarClock} tone="amber" size={44} />
              <div className="min-w-0 flex-1">
                <p id="next-title" className="text-[13px] font-medium text-amber-dark">
                  Prochaine cotisation
                </p>
                <p className="truncate text-[15px] font-semibold text-ink">{nextCircle.name}</p>
                <p className="text-[13px] text-muted">{frequencyLabel(nextCircle.frequency)}</p>
              </div>
              <p className="shrink-0 text-right text-[20px] font-bold text-ink">{formatFcfa(nextAmount)}</p>
            </div>
            <Link
              href={`/payment?circleId=${nextCircle.id}&amount=${nextAmount}&type=${nextType}`}
              className={`${btnPrimary} mt-4`}
            >
              Payer {formatFcfa(nextAmount)}
            </Link>
          </section>
        ) : (
          <section className={`${card} p-5`}>
            <p className="text-[15px] font-semibold text-ink">Vous êtes à jour</p>
            <p className="mt-1 text-[14px] text-muted">Aucune cotisation en attente pour le moment.</p>
          </section>
        )}

        {/* Raccourcis */}
        <nav aria-label="Raccourcis" className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`${card} flex flex-col items-center justify-center gap-2 px-1 py-3.5 text-center transition-colors hover:border-line-strong`}
            >
              <IconTile icon={a.icon} tone="green" size={40} />
              <span className="text-[13px] font-semibold text-ink">{a.label}</span>
            </Link>
          ))}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section>
            <SectionHeader title="Mes cercles" action={{ href: '/circles', label: 'Voir tout' }} />
            <div className="grid gap-3 sm:grid-cols-2">
              {mockCircles.slice(0, 4).map((circle) => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
            </div>
          </section>

          <section id="notifications" className="scroll-mt-4">
            <SectionHeader title="Notifications" />
            <NotificationsList />
          </section>
        </div>
      </PageBody>
    </>
  );
}
