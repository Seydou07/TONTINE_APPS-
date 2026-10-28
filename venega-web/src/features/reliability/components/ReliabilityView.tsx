'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Ban, Check, ChevronDown, Clock, ShieldCheck } from 'lucide-react';
import { mockCircles, mockMemberships, mockReliabilityEvents, mockUsers, ReliabilityEventType } from '@venega/types';
import { Badge } from '@/components/ui/Badge';
import { HeroBand, HeroTitle, PageBody } from '@/components/ui/HeroBand';
import { btnPrimary, card } from '@/components/ui/classes';
import { EmptyState, SectionHeader } from '@/components/ui/misc';
import { scoreLabel, scoreTone } from '@/features/circles/labels';
import { formatDate } from '@/lib/format';

const OVERLAP = 40;

const SCORE_TEXT = { green: 'text-primary-dark', amber: 'text-amber-dark', danger: 'text-danger', neutral: 'text-muted', onDark: 'text-white' };

export function ReliabilityView() {
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);
  const currentUser = mockUsers.find((u) => u.id === 'u1');
  const memberships = mockMemberships.filter((m) => m.userId === 'u1');
  const events = mockReliabilityEvents.filter((e) => e.userId === 'u1');

  if (!currentUser) return null;

  const late = events.filter((e) => e.type === ReliabilityEventType.LATE).length;
  const missed = events.filter((e) => e.type === ReliabilityEventType.MISSED).length;
  const onTime = events.filter((e) => e.type === ReliabilityEventType.ON_TIME).length;
  const avgScore =
    memberships.length > 0
      ? Math.round(memberships.reduce((sum, m) => sum + (m.reliabilityScore || 0), 0) / memberships.length)
      : 0;

  return (
    <>
      <HeroBand overlap={OVERLAP} width="narrow">
        <HeroTitle title="Score de fiabilité" subtitle="Votre régularité de paiement dans chaque cercle" />
      </HeroBand>

      <PageBody overlap={OVERLAP} width="narrow">
        <section className={`${card} p-5`}>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={`text-[40px] font-bold leading-none ${SCORE_TEXT[scoreTone(avgScore)]}`}>{avgScore}</p>
              <p className="mt-1 text-[12px] text-muted">sur 100</p>
            </div>
            <div className="min-w-0 flex-1 border-l border-line pl-4">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-ink">Score global</p>
                <Badge tone={scoreTone(avgScore)}>{scoreLabel(avgScore)}</Badge>
              </div>
              <p className="mt-0.5 text-[13px] text-muted">Moyenne de vos cercles</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-soft">
                <li>{onTime} à temps</li>
                <li>
                  {late} retard{late > 1 ? 's' : ''}
                </li>
                <li>
                  {missed} manqué{missed > 1 ? 's' : ''}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-[14px] bg-fill p-4">
            <p className="text-[14px] font-semibold text-ink">Comment le score est calculé</p>
            <ul className="mt-2 space-y-1.5 text-[14px] text-ink-soft">
              <li className="flex items-center gap-2">
                <Check size={15} className="text-primary" aria-hidden />
                Paiement à temps : <strong className="text-ink">+1 point</strong>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={15} className="text-amber-dark" aria-hidden />
                Retard : <strong className="text-ink">−1 point</strong>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle size={15} className="text-danger" aria-hidden />
                Cotisation manquée : <strong className="text-ink">−3 points</strong>
              </li>
            </ul>
          </div>
        </section>

        {memberships.length > 0 ? (
          <section>
            <SectionHeader title="Score par cercle" />
            <ul className="space-y-2.5">
              {memberships.map((m) => {
                const circle = mockCircles.find((c) => c.id === m.circleId);
                if (!circle) return null;
                const circleEvents = events.filter((e) => e.circleId === m.circleId);
                const open = expandedCircle === m.circleId;
                const tone = scoreTone(m.reliabilityScore);
                return (
                  <li key={m.circleId} className={`${card} overflow-hidden`}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setExpandedCircle(open ? null : m.circleId)}
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-fill"
                    >
                      <span className={`w-11 shrink-0 text-center text-[20px] font-bold ${SCORE_TEXT[tone]}`}>
                        {m.reliabilityScore}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-ink">{circle.name}</p>
                        <p className="text-[13px] text-muted">
                          {circleEvents.length} événement{circleEvents.length > 1 ? 's' : ''}
                          {m.turnOrder ? ` · Tour n° ${m.turnOrder}` : ''}
                        </p>
                      </div>
                      <Badge tone={tone}>{scoreLabel(m.reliabilityScore)}</Badge>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-subtle transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    {open && (
                      <div className="border-t border-line">
                        {circleEvents.length > 0 ? (
                          <ul className="divide-y divide-line">
                            {circleEvents.map((e) => (
                              <li key={e.id} className="flex items-start gap-3 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-[14px] text-ink">{e.description}</p>
                                  <p className="text-[12px] text-muted">{formatDate(e.createdAt)}</p>
                                </div>
                                <span
                                  className={`text-[13px] font-bold ${
                                    e.scoreImpact > 0 ? 'text-primary' : e.scoreImpact < 0 ? 'text-danger' : 'text-muted'
                                  }`}
                                >
                                  {e.scoreImpact > 0 ? '+' : ''}
                                  {e.scoreImpact}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="p-4 text-center text-[14px] text-muted">Aucun événement dans ce cercle.</p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="Aucun cercle"
            text="Rejoignez un cercle pour commencer à construire votre score de fiabilité."
            action={
              <Link href="/circles" className={btnPrimary}>
                Voir les cercles
              </Link>
            }
          />
        )}

        {memberships.some((m) => m.reliabilityScore < 50) && (
          <section className="rounded-[20px] border border-danger/20 bg-danger-tint p-5">
            <div className="flex items-center gap-2">
              <Ban size={18} className="text-danger" aria-hidden />
              <h2 className="text-[15px] font-bold text-danger">Avertissement</h2>
            </div>
            <p className="mt-2 text-[14px] text-ink-soft">
              Votre score est bas dans certains cercles. Un score inférieur à 0 bloque la réception de la cagnotte. Après
              3 retards, le président peut vous exclure du cercle, ce qui vous bloque dans tous les cercles de la
              plateforme.
            </p>
            <p className="mt-2 text-[14px] text-ink-soft">
              En cas d&apos;exclusion, les cotisations passées ne sont pas remboursées et une procédure pour impayés peut
              être engagée.
            </p>
          </section>
        )}
      </PageBody>
    </>
  );
}
