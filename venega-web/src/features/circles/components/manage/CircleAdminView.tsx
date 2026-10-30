'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  Clock,
  Inbox,
  RotateCw,
  Settings2,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { AidRequestStatus, CircleType, MembershipRequestStatus, Role } from '@venega/types';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  disburseSolidarityRequest,
  getActiveCycle,
  getBureauDecisions,
  getCircle,
  getCircleMembers,
  getCurrentUser,
  getFounderCircleIds,
  getLedgerEntries,
  getMembershipRequests,
  getSolidarityRequests,
  getSolidarityTotals,
  getSolidarityValidators,
  isBureauFullyApproved,
  setBureauDecision,
  updateMembershipRequest,
} from '../../store';
import { CircleTab, CircleTabBar } from '../overview';
import { NotFoundScreen } from '../solidarity/NotFound';
import { eventTypeLabel } from '../solidarity/labels';

const frequencyLabel: Record<string, string> = {
  DAILY: 'Journalière',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Bimensuelle',
  MONTHLY: 'Mensuelle',
  CUSTOM: 'Personnalisée',
};

type Tab = 'overview' | 'members' | 'requests' | 'treasury';

/**
 * Administration d'un cercle (copie de CircleAdminScreen mobile). Comme sur le mobile,
 * une tontine en argent redirige vers l'écran Tontine et une caisse vers l'écran Solidarité :
 * cet écran ne sert qu'aux tontines en nature.
 */
export function CircleAdminView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('requests');
  const circle = getCircle(circleId);

  const redirectTo =
    circle?.type === CircleType.SOLIDARITY_ONLY
      ? `/circles/${circleId}/solidarity`
      : circle?.type === CircleType.TONTINE_ONLY
        ? `/circles/${circleId}/tontine`
        : null;
  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!circle) return <NotFoundScreen header="Administration" />;
  if (redirectTo) return null;

  const me = getCurrentUser();
  const isPresident = getFounderCircleIds().includes(circle.id);
  const cycle = getActiveCycle(circle);
  const members = getCircleMembers(circle.id);
  const myMembership = members.find((m) => m.userId === me.id);
  const isTreasurer = myMembership?.role === Role.TREASURER;
  const pendingMembership = getMembershipRequests(circle.id).filter((r) => r.status === MembershipRequestStatus.PENDING);
  const bureauPending = getSolidarityRequests(circle.id).filter((r) => r.status === AidRequestStatus.APPROVED);
  const requestsCount = pendingMembership.length + bureauPending.length;
  const validators = getSolidarityValidators(circle.id);
  const totals = getSolidarityTotals(circle.id);
  const ledger = getLedgerEntries(circle.id).slice(0, 8);

  const handleDecideMembership = (id: string, approved: boolean) => {
    updateMembershipRequest(id, {
      status: approved ? MembershipRequestStatus.APPROVED : MembershipRequestStatus.REJECTED,
    });
  };

  const typeLabel = circle.type === CircleType.NATURE ? 'En nature' : 'Tontine';
  const roleLabel = isPresident ? 'Président' : isTreasurer ? 'Trésorier' : 'Membre';

  return (
    <>
      <PageHeader
        title="Administration"
        onBack={() => router.back()}
        right={
          <Link
            href={`/circles/${circle.id}/manage`}
            aria-label="Gérer le cercle"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-fill"
          >
            <Settings2 size={21} aria-hidden />
          </Link>
        }
      />
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 pb-1 pt-3 sm:px-6">
          <p className="line-clamp-2 text-[19px] font-bold text-ink">{circle.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-fill px-2.5 py-1 text-[12px] font-semibold text-ink-soft">{typeLabel}</span>
            <span className="rounded-full bg-primary-tint px-2.5 py-1 text-[12px] font-semibold text-primary-dark">
              Vous êtes {roleLabel.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
      <CircleTabBar>
        <CircleTab label="Vue d'ensemble" active={tab === 'overview'} onClick={() => setTab('overview')} />
        <CircleTab label="Membres" active={tab === 'members'} onClick={() => setTab('members')} />
        <CircleTab label="Demandes" active={tab === 'requests'} badge={requestsCount} onClick={() => setTab('requests')} />
        <CircleTab label="Trésorerie" active={tab === 'treasury'} onClick={() => setTab('treasury')} />
      </CircleTabBar>

      <ScreenBody>
        {tab === 'overview' && (
          <div className="space-y-3">
            {(!!circle.tontineAmount || !!circle.solidarityAmount) && (
              <div className="rounded-[20px] border border-line bg-white px-4">
                {!!circle.tontineAmount && (
                  <div className={`flex justify-between gap-4 py-3 ${circle.solidarityAmount ? 'border-b border-line' : ''}`}>
                    <span className="text-[14px] text-muted">Cotisation tontine par tour</span>
                    <span className="text-[15px] font-semibold text-ink">{formatFcfa(circle.tontineAmount)}</span>
                  </div>
                )}
                {!!circle.solidarityAmount && (
                  <div className="flex justify-between gap-4 py-3">
                    <span className="text-[14px] text-muted">Cotisation solidarité par tour</span>
                    <span className="text-[15px] font-semibold text-ink">{formatFcfa(circle.solidarityAmount)}</span>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2.5">
              <StatTile icon={Users} value={`${members.length}`} label="Membres" />
              <StatTile
                icon={CalendarClock}
                value={circle.frequency ? frequencyLabel[circle.frequency] ?? circle.frequency : '—'}
                label="Fréquence"
              />
              <StatTile
                icon={RotateCw}
                value={cycle ? `${cycle.currentTurn} / ${cycle.totalTurns || members.length}` : '—'}
                label="Tour actuel"
              />
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div className="overflow-hidden rounded-[20px] border border-line bg-white">
            {members.map((m, idx) => (
              <div key={m.userId} className="flex items-center gap-3 pl-4">
                <Avatar name={`${m.user.firstName} ${m.user.lastName}`} uri={m.user.avatarUrl} size={40} />
                <div className={`min-w-0 flex-1 py-3 pr-4 ${idx < members.length - 1 ? 'border-b border-line' : ''}`}>
                  <p className="truncate text-[15px] font-semibold text-ink">
                    {m.user.firstName} {m.user.lastName}
                  </p>
                  <p className="text-[13px] text-muted">
                    {m.role === Role.PRESIDENT ? 'Président' : m.role === Role.TREASURER ? 'Trésorier' : 'Membre'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'requests' && (
          <div>
            <h2 className="mb-2.5 px-1 text-[17px] font-bold text-ink">Demandes d&apos;adhésion</h2>
            {pendingMembership.length === 0 ? (
              <EmptyLine text="Aucune demande en attente." />
            ) : (
              <div className="space-y-3">
                {pendingMembership.map((r) => (
                  <div key={r.id} className="space-y-3 rounded-[20px] border border-line bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.fullName} uri={r.user?.avatarUrl} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-ink">{r.fullName}</p>
                        <p className="text-[13px] text-muted">{r.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <DocTag label="CNIB fournie" />
                      {r.selfieUrl && <DocTag label="Selfie fourni" />}
                    </div>
                    {r.joiningFee > 0 && (
                      <div className="flex justify-between rounded-[12px] bg-fill px-3 py-2.5">
                        <span className="text-[14px] text-muted">Frais de rachat</span>
                        <span className="text-[14px] font-semibold text-ink">{formatFcfa(r.joiningFee)}</span>
                      </div>
                    )}
                    <div className="flex gap-2.5">
                      <Button variant="secondary" size="sm" onClick={() => handleDecideMembership(r.id, false)} className="flex-1">
                        Refuser
                      </Button>
                      <Button size="sm" onClick={() => handleDecideMembership(r.id, true)} className="flex-1">
                        Valider
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 className="mb-2.5 mt-6 px-1 text-[17px] font-bold text-ink">Demandes d&apos;aide à valider</h2>
            {bureauPending.length === 0 ? (
              <EmptyLine text="Aucune demande en attente du bureau." />
            ) : (
              <div className="space-y-3">
                {bureauPending.map((r) => {
                  const votesFor = r.votes.filter((v) => v.approved).length;
                  const votesAgainst = r.votes.filter((v) => !v.approved).length;
                  const decisions = getBureauDecisions(r.id);
                  const fullyApproved = isBureauFullyApproved(circle.id, r.id);
                  const iApproved = decisions[me.id] === true;
                  const isValidator = validators.includes(me.id);
                  return (
                    <div key={r.id} className="space-y-3 rounded-[20px] border border-line bg-white p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.requesterName} uri={r.requesterAvatar} size={40} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-ink">{r.requesterName}</p>
                          <p className="text-[13px] text-muted">
                            {eventTypeLabel[r.eventType]} · {formatFcfa(r.amountRequested)} demandés
                          </p>
                        </div>
                      </div>
                      <p className="text-[13px] text-muted">
                        Vote des membres : {votesFor} pour · {votesAgainst} contre
                      </p>
                      <div className="rounded-[14px] border border-line px-3">
                        {validators.map((vId, i) => {
                          const vMember = members.find((m) => m.userId === vId);
                          const done = decisions[vId] === true;
                          const label =
                            vId === me.id
                              ? `Votre validation (${vMember?.role === Role.TREASURER ? 'Trésorier' : 'Président'})`
                              : `${vMember?.user.firstName} ${vMember?.user.lastName}`;
                          return (
                            <div
                              key={vId}
                              className={`flex items-center justify-between gap-3 py-2.5 ${
                                i < validators.length - 1 ? 'border-b border-line' : ''
                              }`}
                            >
                              <span className="text-[14px] text-ink">{label}</span>
                              {done ? (
                                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
                                  <Check size={14} strokeWidth={2.5} aria-hidden />
                                  Approuvée
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-amber-dark">
                                  <Clock size={14} aria-hidden />
                                  En attente
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[13px] text-muted">
                        Le décaissement nécessite l&apos;accord de tous les validateurs désignés.
                      </p>
                      {isValidator && !iApproved && (
                        <Button size="sm" onClick={() => setBureauDecision(r.id, me.id, true)} className="w-full">
                          Approuver le décaissement
                        </Button>
                      )}
                      {isTreasurer && (
                        <Button
                          size="sm"
                          icon={Wallet}
                          disabled={!fullyApproved}
                          onClick={() => disburseSolidarityRequest(r.id)}
                          className="w-full"
                        >
                          {fullyApproved ? 'Décaisser' : 'En attente du bureau'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'treasury' && (
          <div className="space-y-3">
            <div className="rounded-[20px] bg-primary-dark p-5 text-white">
              <p className="text-[13px] text-white/75">Solde de la caisse de solidarité</p>
              <p className="mt-1 text-[28px] font-bold leading-tight">{formatFcfa(totals.balance)}</p>
            </div>
            <h2 className="px-1 pt-2 text-[17px] font-bold text-ink">Dernières opérations</h2>
            {ledger.length === 0 ? (
              <EmptyLine text="Aucune opération pour le moment." />
            ) : (
              <div className="overflow-hidden rounded-[20px] border border-line bg-white">
                {ledger.map((e, idx) => {
                  const credit = e.type === 'CREDIT';
                  const Icon = credit ? ArrowDownLeft : ArrowUpRight;
                  return (
                    <div key={e.id} className="flex items-center gap-3 pl-4">
                      <span
                        aria-hidden
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
                          credit ? 'bg-primary-tint text-primary' : 'bg-danger-tint text-danger'
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <div
                        className={`flex min-w-0 flex-1 items-center gap-3 py-3 pr-4 ${
                          idx < ledger.length - 1 ? 'border-b border-line' : ''
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">{e.description}</span>
                        <span className={`shrink-0 text-[15px] font-bold ${credit ? 'text-primary' : 'text-danger'}`}>
                          {credit ? '+' : '−'}
                          {formatFcfa(e.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </ScreenBody>
    </>
  );
}

function StatTile({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-[20px] border border-line bg-white px-2 py-3.5 text-center">
      <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <p className="mt-2 break-words text-[15px] font-bold text-ink">{value}</p>
      <p className="text-[12px] text-muted">{label}</p>
    </div>
  );
}

function DocTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-2.5 py-1 text-[12px] font-semibold text-primary-dark">
      <Check size={14} strokeWidth={2.5} aria-hidden />
      {label}
    </span>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[20px] border border-line bg-white p-4 text-[14px] text-muted">
      <Inbox size={18} className="text-subtle" aria-hidden />
      {text}
    </div>
  );
}
