'use client';

import { Fragment, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Clock, type LucideIcon } from 'lucide-react';
import { ReliabilityEventType, mockReliabilityEvents, type ReliabilityEvent } from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { useDemoStore } from '@/lib/demoStore';
import { getCircleMembers, getCircles, getCurrentUser } from '@/features/circles/store';
import { scoreLabel } from '@/features/circles/labels';

/*
 * Score de fiabilité de l'utilisateur — reprend ReliabilityScreen.tsx mobile.
 * Différence volontaire : le mobile affiche des valeurs de repli inventées quand il
 * n'y a pas de données (12 paiements à temps, « Excellent », événements fictifs) ;
 * ici on n'affiche que les données réelles.
 * TODO API : score et événements par cercle à exposer (ex. `GET /users/me/reliability`),
 * à ajouter à docs/api-mobile.md.
 */

const rules: { icon: LucideIcon; tone: string; title: string; sub: string }[] = [
  {
    icon: CheckCircle2,
    tone: 'bg-primary-tint text-primary',
    title: 'Paiement à temps (+1 point)',
    sub: 'Chaque virement effectué avant l’échéance renforce votre score.',
  },
  {
    icon: Clock,
    tone: 'bg-amber-tint text-amber-dark',
    title: 'Retard de paiement (−1 point)',
    sub: 'Cotisation effectuée après la date limite du tour.',
  },
  {
    icon: AlertTriangle,
    tone: 'bg-danger-tint text-danger',
    title: 'Cotisation manquée (−3 points)',
    sub: 'Non-paiement du tour à la clôture du cercle.',
  },
];

function eventIcon(e: ReliabilityEvent) {
  if (e.type === ReliabilityEventType.ON_TIME) return <CheckCircle2 size={16} className="shrink-0 text-primary" aria-hidden />;
  if (e.type === ReliabilityEventType.LATE) return <Clock size={16} className="shrink-0 text-amber-dark" aria-hidden />;
  return <AlertTriangle size={16} className="shrink-0 text-danger" aria-hidden />;
}

export function ReliabilityView() {
  useDemoStore();
  const me = getCurrentUser();
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);

  const userMemberships = getCircles().flatMap((c) =>
    getCircleMembers(c.id)
      .filter((m) => m.userId === me.id)
      .map((m) => ({ membership: m, circle: c })),
  );
  const userEvents = mockReliabilityEvents.filter((e) => e.userId === me.id);
  const onTimeEvents = userEvents.filter((e) => e.type === ReliabilityEventType.ON_TIME).length;
  const lateEvents = userEvents.filter((e) => e.type === ReliabilityEventType.LATE).length;
  const missedEvents = userEvents.filter((e) => e.type === ReliabilityEventType.MISSED).length;
  const avgScore =
    userMemberships.length > 0
      ? Math.round(
          userMemberships.reduce((sum, { membership }) => sum + (membership.reliabilityScore || 0), 0) /
            userMemberships.length,
        )
      : null;

  const stats = [
    { value: onTimeEvents, label: 'À temps' },
    { value: lateEvents, label: 'En retard' },
    { value: missedEvents, label: 'Manquées' },
  ];

  return (
    <>
      <PageHeader title="Score de fiabilité" backHref="/profile" />
      <ScreenBody>
        <section className="rounded-[24px] bg-primary-dark p-5 text-white">
          <p className="text-[13px] text-white/75">Fiabilité globale</p>
          <div className="mt-1 flex items-center gap-2.5">
            <p className="text-[28px] font-bold leading-tight">{avgScore === null ? '—' : `${avgScore}%`}</p>
            {avgScore !== null && (
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[12px] text-white">{scoreLabel(avgScore)}</span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-white/75">Basée sur l’ensemble de vos cotisations passées</p>
          <div className="mt-4 flex items-center border-t border-white/20 pt-3.5">
            {stats.map((s, i) => (
              <Fragment key={s.label}>
                {i > 0 && <span aria-hidden className="mx-3 h-8 w-px bg-white/20" />}
                <div className="flex-1 text-center">
                  <p className="text-[17px] font-bold">{s.value}</p>
                  <p className="text-[12px] text-white/75">{s.label}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-bold text-ink">Comment est calculé votre score ?</h2>
          <div className="overflow-hidden rounded-[20px] border border-line bg-white">
            {rules.map(({ icon: Icon, tone, title, sub }, i) => (
              <div key={title} className="flex items-start gap-3 pl-4">
                <span aria-hidden className={`mt-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${tone}`}>
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <div className={`flex-1 py-3 pr-4 ${i < rules.length - 1 ? 'border-b border-line' : ''}`}>
                  <p className="text-[15px] font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-bold text-ink">Détails par cercle</h2>
          {userMemberships.length === 0 ? (
            <p className="text-[14px] text-muted">Vous n’êtes membre d’aucun cercle pour l’instant.</p>
          ) : (
            <div className="space-y-2.5">
              {userMemberships.map(({ membership, circle }) => {
                const circleEvents = userEvents.filter((e) => e.circleId === circle.id);
                const isExpanded = expandedCircle === circle.id;
                return (
                  <div key={circle.id} className="overflow-hidden rounded-[20px] border border-line bg-white">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedCircle(isExpanded ? null : circle.id)}
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-fill"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-tint text-[13px] font-bold text-primary-dark">
                        {membership.reliabilityScore}%
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">{circle.name}</span>
                        <span className="block text-[13px] text-muted">
                          {membership.turnOrder !== undefined ? `Tour ${membership.turnOrder} · ` : ''}
                          {circleEvents.length} événement{circleEvents.length > 1 ? 's' : ''}
                        </span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-muted" aria-hidden />
                      ) : (
                        <ChevronDown size={18} className="text-subtle" aria-hidden />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="space-y-2.5 border-t border-line px-4 py-3">
                        {circleEvents.length === 0 ? (
                          <p className="text-[14px] text-muted">Aucun retard ni manquement enregistré dans ce cercle.</p>
                        ) : (
                          circleEvents.map((event) => (
                            <div key={event.id} className="flex items-start gap-2.5">
                              {eventIcon(event)}
                              <p className="flex-1 text-[14px] text-ink-soft">{event.description}</p>
                              <span
                                className={`shrink-0 text-[14px] font-semibold ${
                                  event.scoreImpact >= 0 ? 'text-primary' : 'text-danger'
                                }`}
                              >
                                {event.scoreImpact > 0 ? `+${event.scoreImpact}` : `−${Math.abs(event.scoreImpact)}`}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </ScreenBody>
    </>
  );
}
