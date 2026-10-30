'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  HeartHandshake,
  Inbox,
  Plus,
  Receipt,
  UserPlus,
  Wallet,
  X,
} from 'lucide-react';
import { AidRequestStatus, EventType, MembershipRequestStatus, Role, type LedgerEntry } from '@venega/types';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScreenBody, ScreenFooter } from '@/components/ui/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Chip, ChipGroup } from '@/components/ui/choice';
import { TextArea, TextField } from '@/components/ui/TextField';
import { EmptyState } from '@/components/ui/misc';
import { AvatarViewer, TransactionDetailSheet } from '@/components/ui/DetailSheets';
import {
  getBureauDecisions,
  getCircle,
  getCircleMembers,
  getCurrentUser,
  getFounderCircleIds,
  getLedgerEntries,
  getMembershipRequests,
  getNextContribution,
  getSolidarityRequests,
  getSolidarityTotals,
  getSolidarityValidators,
  isBureauFullyApproved,
  setBureauDecision,
  submitSolidarityRequest,
  updateMembershipRequest,
} from '../../store';
import {
  ActionCard,
  CircleTab,
  CircleTabBar,
  DueCard,
  HistoryFilterButton,
  OverviewSectionHeader,
  OverviewStack,
  OverviewSummaryCard,
} from '../overview';
import { RoleBadge, StatusBadge } from '../RoleBadge';
import { NotFoundScreen } from './NotFound';
import {
  aidStatusMeta,
  eventTypeLabel,
  formatDateAt,
  formatMonthYear,
  monthLabels,
  rolePriority,
  solidarityRoleLabel,
} from './labels';

type Tab = 'apercu' | 'decaissements' | 'membres' | 'demandes';

/**
 * Caisse de solidarité d'un cercle (copie de SolidarityScreen mobile) :
 * aperçu (solde, cotisation, historique transparent), décaissements (le Président
 * initie, les validateurs approuvent, le Trésorier décaisse), membres, demandes d'adhésion.
 * TODO API : GET /solidarity/circles/:id/ledger, POST /solidarity/requests (beneficiaryUserId),
 * POST /solidarity/requests/:id/approve, GET|PATCH /circles/:id/requests (docs/api-mobile.md §3 et §5).
 */
export function SolidarityView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('apercu');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [viewedProfile, setViewedProfile] = useState<{ name: string; photoUrl?: string } | null>(null);
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqBeneficiaryId, setReqBeneficiaryId] = useState<string | null>(null);
  const [reqEventType, setReqEventType] = useState<EventType>(EventType.MALADIE);
  const [reqReason, setReqReason] = useState('');
  const [reqAmount, setReqAmount] = useState('');

  const circle = getCircle(circleId);
  if (!circle) return <NotFoundScreen header="Caisse de solidarité" />;

  const isFounder = getFounderCircleIds().includes(circle.id);
  const me = getCurrentUser();
  const entries = getLedgerEntries(circle.id);
  const totals = getSolidarityTotals(circle.id);
  const monthsWithActivity = [...new Set(entries.map((e) => new Date(e.createdAt).getMonth()))].sort((a, b) => a - b);
  const requests = getSolidarityRequests(circle.id);
  const pendingMembership = getMembershipRequests(circle.id).filter((r) => r.status === MembershipRequestStatus.PENDING);

  const filteredEntries =
    monthFilter === null ? entries : entries.filter((e) => new Date(e.createdAt).getMonth() === monthFilter);

  const members = getCircleMembers(circle.id);
  const sortedMembers = [...members].sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);
  const validators = getSolidarityValidators(circle.id);
  const myMembership = members.find((m) => m.userId === me.id);
  const isValidator = validators.includes(me.id);
  const isTreasurer = myMembership?.role === Role.TREASURER;
  const next = getNextContribution(circle);

  const handleDecideMembership = (id: string, approved: boolean) => {
    updateMembershipRequest(id, {
      status: approved ? MembershipRequestStatus.APPROVED : MembershipRequestStatus.REJECTED,
      decidedAt: new Date().toISOString(),
    });
  };

  const openRequestModal = () => {
    setReqBeneficiaryId(null);
    setReqEventType(EventType.MALADIE);
    setReqReason('');
    setReqAmount('');
    setShowRequestModal(true);
  };

  const handleSubmitRequest = () => {
    const amount = parseInt(reqAmount.replace(/\D/g, ''), 10);
    const beneficiary = members.find((m) => m.userId === reqBeneficiaryId);
    if (!beneficiary || !reqReason.trim() || !amount) return;
    submitSolidarityRequest({
      circleId: circle.id,
      userId: beneficiary.userId,
      requesterName: `${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
      eventType: reqEventType,
      reason: reqReason.trim(),
      amountRequested: amount,
    });
    setShowRequestModal(false);
    setTab('decaissements');
  };

  const handlePayNow = () => {
    router.push(`/payment?circleId=${circle.id}&amount=${circle.solidarityAmount || 1000}&type=SOLIDARITY`);
  };

  const canSubmit = !!reqBeneficiaryId && !!reqReason.trim() && !!reqAmount;
  const pickMonth = (m: number | null) => {
    setMonthFilter(m);
    setVisibleCount(5);
    setShowMonthFilter(false);
  };

  return (
    <>
      <PageHeader
        title={circle.name}
        subtitle={`Solidarité · ${
          isFounder
            ? 'Vous êtes fondateur'
            : `Vous êtes ${solidarityRoleLabel[myMembership?.role ?? Role.MEMBER].toLowerCase()}`
        }`}
        onBack={() => router.back()}
        right={
          <Link
            href={`/circles/${circle.id}/invite`}
            aria-label="Inviter un membre"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-fill"
          >
            <UserPlus size={21} aria-hidden />
          </Link>
        }
      />

      <CircleTabBar>
        <CircleTab label="Aperçu" active={tab === 'apercu'} onClick={() => setTab('apercu')} />
        <CircleTab label="Décaissements" active={tab === 'decaissements'} onClick={() => setTab('decaissements')} />
        <CircleTab label="Membres" active={tab === 'membres'} onClick={() => setTab('membres')} />
        <CircleTab
          label="Demandes"
          active={tab === 'demandes'}
          badge={pendingMembership.length}
          onClick={() => setTab('demandes')}
        />
      </CircleTabBar>

      <ScreenBody>
        {tab === 'apercu' && (
          <div>
            <OverviewStack>
              <OverviewSummaryCard
                label="Solde de la caisse"
                amount={`${totals.balance < 0 ? '−' : ''}${formatFcfa(Math.abs(totals.balance))}`}
                negative={totals.balance < 0}
                stats={[
                  { label: 'Cotisé', value: formatFcfa(totals.totalCredits) },
                  { label: 'Versé', value: formatFcfa(totals.totalDebits) },
                ]}
                dueInDays={next?.daysLeft}
              />
              <DueCard amount={formatFcfa(circle.solidarityAmount || 1000)} daysLeft={next?.daysLeft} onPay={handlePayNow} />
              {isFounder && (
                <ActionCard
                  icon={HeartHandshake}
                  title="Un membre traverse un coup dur ?"
                  sub="Initiez une aide, validée par les approbateurs."
                  actionLabel="Initier"
                  onClick={openRequestModal}
                />
              )}
            </OverviewStack>

            <OverviewSectionHeader
              title="Historique"
              right={
                monthsWithActivity.length > 1 ? (
                  <HistoryFilterButton
                    label={monthFilter !== null ? `${monthLabels[monthFilter]} 2026` : 'Filtrer'}
                    active={monthFilter !== null}
                    onClick={() => setShowMonthFilter(true)}
                  />
                ) : null
              }
            />

            {filteredEntries.length === 0 ? (
              <EmptyState icon={Receipt} title="Aucune opération" text="Les cotisations et les aides versées apparaîtront ici." />
            ) : (
              <div className="overflow-hidden rounded-[20px] border border-line bg-white">
                {filteredEntries.slice(0, visibleCount).map((e, idx, arr) => {
                  const isCredit = e.type === 'CREDIT';
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedEntry(e)}
                      className="flex w-full items-center gap-3 pl-4 text-left hover:bg-fill"
                    >
                      <span
                        aria-hidden
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
                          isCredit ? 'bg-primary-tint text-primary' : 'bg-danger-tint text-danger'
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </span>
                      <span
                        className={`flex min-w-0 flex-1 items-center gap-3 py-3 pr-4 ${
                          idx < arr.length - 1 ? 'border-b border-line' : ''
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-ink">
                            {isCredit ? `Cotisation — ${e.memberName ?? ''}` : e.description}
                          </span>
                          <span className="block text-[13px] text-muted">{formatDateAt(e.createdAt)}</span>
                        </span>
                        <span className={`shrink-0 text-[15px] font-bold ${isCredit ? 'text-primary' : 'text-danger'}`}>
                          {isCredit ? '+' : '−'}
                          {formatFcfa(e.amount)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {filteredEntries.length > visibleCount && (
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + 5)}
                className="mt-2 h-10 w-full rounded-[12px] text-[14px] font-semibold text-primary hover:bg-primary-tint"
              >
                Voir plus
              </button>
            )}

            <p className="mt-4 px-1 text-center text-[13px] text-muted">
              La caisse est transparente : chaque cotisation et chaque déboursement est tracé et visible de tous les
              membres du cercle.
            </p>
          </div>
        )}

        {tab === 'decaissements' && (
          <div className="space-y-3">
            {!isFounder && (
              <div className="rounded-[14px] bg-fill p-3.5 text-[13px] text-ink-soft">
                Un événement à annoncer ? Contactez le Président du cercle — lui seul peut initier une demande
                d&apos;aide. Vous pouvez suivre ici l&apos;avancement de chaque décaissement.
              </div>
            )}
            {requests.length === 0 && (
              <EmptyState
                icon={HeartHandshake}
                title="Aucun décaissement"
                text="Les demandes d'aide du cercle apparaîtront ici."
              />
            )}
            {requests.map((r) => {
              const decisions = getBureauDecisions(r.id);
              const fullyApproved = isBureauFullyApproved(circle.id, r.id);
              const approvedCount = validators.filter((v) => decisions[v] === true).length;
              const myDecision = decisions[me.id];
              const isExpanded = expandedRequestId === r.id;
              const isPendingBureau = r.status === AidRequestStatus.APPROVED;
              const status = aidStatusMeta[r.status];
              return (
                <div key={r.id} className="rounded-[20px] border border-line bg-white">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedRequestId((prev) => (prev === r.id ? null : r.id))}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <Avatar
                      name={r.requesterName}
                      uri={members.find((m) => m.userId === r.userId)?.user.avatarUrl}
                      size={40}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-ink">{r.requesterName}</span>
                      <span className="block text-[13px] text-muted">
                        {eventTypeLabel[r.eventType]} · {formatFcfa(r.amountRequested)}
                      </span>
                    </span>
                    <StatusBadge label={status.label} className={status.className} />
                  </button>

                  {isExpanded && (
                    <div className="space-y-3 border-t border-line px-4 pb-4 pt-3">
                      <p className="text-[14px] text-ink-soft">{r.reason}</p>
                      {isPendingBureau && validators.length === 0 && isFounder && (
                        <p className="text-[13px] text-muted">
                          Aucun approbateur désigné — rendez-vous dans Gestion du cercle pour en choisir.
                        </p>
                      )}
                      {isPendingBureau && validators.length > 0 && (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fill">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${(approvedCount / validators.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-[13px] font-semibold text-muted">
                              {approvedCount}/{validators.length} approbateurs
                            </span>
                          </div>
                          {isValidator && (
                            <div className="flex gap-2.5">
                              <Button
                                size="sm"
                                icon={X}
                                variant={myDecision === false ? 'danger' : 'secondary'}
                                onClick={() => setBureauDecision(r.id, me.id, false)}
                                className="flex-1"
                              >
                                Désapprouver
                              </Button>
                              <Button
                                size="sm"
                                icon={Check}
                                variant={myDecision === true ? 'primary' : 'secondary'}
                                onClick={() => setBureauDecision(r.id, me.id, true)}
                                className="flex-1"
                              >
                                Approuver
                              </Button>
                            </div>
                          )}
                          {isTreasurer && (
                            <Button
                              size="sm"
                              icon={Wallet}
                              disabled={!fullyApproved}
                              onClick={() => router.push(`/circles/${circle.id}/solidarity-disburse/${r.id}`)}
                              className="w-full"
                            >
                              {fullyApproved ? 'Décaisser' : 'En attente des approbateurs'}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'membres' && (
          <div>
            <h2 className="mb-2.5 px-1 text-[17px] font-bold text-ink">{sortedMembers.length} membre(s)</h2>
            <div className="overflow-hidden rounded-[20px] border border-line bg-white">
              {sortedMembers.map((m, idx) => {
                const fullName = `${m.user.firstName} ${m.user.lastName}`;
                return (
                  <div key={m.userId} className="flex items-center gap-3 pl-4">
                    <button
                      type="button"
                      aria-label={`Voir la photo de ${fullName}`}
                      onClick={() =>
                        setViewedProfile({ name: m.userId === me.id ? 'Moi' : fullName, photoUrl: m.user.avatarUrl })
                      }
                      className="rounded-full"
                    >
                      <Avatar name={fullName} uri={m.user.avatarUrl} size={40} />
                    </button>
                    <Link
                      href={`/circles/${circle.id}/solidarity-member/${m.userId}`}
                      className={`flex min-w-0 flex-1 items-center gap-3 py-3 pr-4 hover:opacity-80 ${
                        idx < sortedMembers.length - 1 ? 'border-b border-line' : ''
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">
                          {fullName}
                          {m.userId === me.id ? ' (Moi)' : ''}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-2">
                          <RoleBadge role={m.role} label={solidarityRoleLabel[m.role]} />
                          <span className="text-[13px] text-muted">Membre depuis {formatMonthYear(m.joinedAt)}</span>
                        </span>
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'demandes' && (
          <div className="space-y-3">
            <h2 className="px-1 text-[17px] font-bold text-ink">Demandes d&apos;adhésion</h2>
            {pendingMembership.length === 0 ? (
              <EmptyState icon={Inbox} title="Aucune demande" text="Aucune demande d'adhésion en attente." />
            ) : (
              pendingMembership.map((r) => (
                <div key={r.id} className="rounded-[20px] border border-line bg-white p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.fullName} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ink">{r.fullName}</p>
                      <p className="text-[13px] text-muted">{r.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2.5">
                    <Button size="sm" variant="secondary" onClick={() => handleDecideMembership(r.id, false)} className="flex-1">
                      Refuser
                    </Button>
                    <Button size="sm" onClick={() => handleDecideMembership(r.id, true)} className="flex-1">
                      Valider
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {isFounder && tab === 'decaissements' && (
          <ScreenFooter>
            <Button icon={Plus} onClick={openRequestModal}>
              Initier une aide
            </Button>
          </ScreenFooter>
        )}
      </ScreenBody>

      {/* Filtre par mois */}
      <Sheet open={showMonthFilter} onClose={() => setShowMonthFilter(false)} title="Filtrer par mois">
        <ChipGroup label="Mois">
          <Chip label="Tous les mois" selected={monthFilter === null} onClick={() => pickMonth(null)} />
          {monthsWithActivity.map((mIdx) => (
            <Chip key={mIdx} label={`${monthLabels[mIdx]} 2026`} selected={monthFilter === mIdx} onClick={() => pickMonth(mIdx)} />
          ))}
        </ChipGroup>
      </Sheet>

      {/* Initier une demande (Président uniquement) */}
      <Sheet open={showRequestModal} onClose={() => setShowRequestModal(false)} title="Initier une demande" size="lg">
        <p className="text-[13px] text-muted">
          À utiliser une fois le membre contacté et son événement connu — la demande part directement en validation
          auprès des approbateurs désignés.
        </p>

        <p className="mb-2 mt-5 text-[13px] font-semibold text-ink-soft">Membre concerné</p>
        <div role="radiogroup" aria-label="Membre concerné" className="flex flex-wrap gap-3">
          {members.map((m) => {
            const active = reqBeneficiaryId === m.userId;
            const fullName = `${m.user.firstName} ${m.user.lastName}`;
            return (
              <button
                key={m.userId}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={fullName}
                onClick={() => setReqBeneficiaryId(m.userId)}
                className="flex w-16 flex-col items-center gap-1"
              >
                <Avatar name={fullName} uri={m.user.avatarUrl} size={40} highlighted={active} />
                <span className={`max-w-full truncate text-[12px] ${active ? 'font-semibold text-primary' : 'text-muted'}`}>
                  {m.user.firstName}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mb-2 mt-5 text-[13px] font-semibold text-ink-soft">Type d&apos;événement</p>
        <ChipGroup label="Type d'événement">
          {Object.values(EventType).map((et) => (
            <Chip key={et} label={eventTypeLabel[et]} selected={reqEventType === et} onClick={() => setReqEventType(et)} />
          ))}
        </ChipGroup>

        <div className="mt-5 space-y-4">
          <TextArea
            label="Motif de la demande"
            placeholder="Expliquez brièvement la situation aux membres du cercle…"
            value={reqReason}
            onChange={(e) => setReqReason(e.target.value)}
            rows={3}
          />
          <TextField
            label="Montant à décaisser"
            placeholder="Ex : 45000"
            inputMode="numeric"
            value={reqAmount}
            onChange={(e) => setReqAmount(e.target.value.replace(/\D/g, ''))}
            suffix="F CFA"
          />
        </div>

        <Button disabled={!canSubmit} onClick={handleSubmitRequest} className="mt-6">
          Envoyer aux approbateurs
        </Button>
      </Sheet>

      {selectedEntry && (
        <TransactionDetailSheet
          open
          onClose={() => setSelectedEntry(null)}
          isCredit={selectedEntry.type === 'CREDIT'}
          name={selectedEntry.memberName ?? '—'}
          amount={formatFcfa(selectedEntry.amount)}
          fields={[
            { label: 'Type', value: selectedEntry.type === 'CREDIT' ? 'Cotisation' : 'Aide versée' },
            { label: 'Membre', value: selectedEntry.memberName ?? '—' },
            ...(selectedEntry.reason ? [{ label: 'Motif', value: selectedEntry.reason }] : []),
            { label: 'Statut', value: selectedEntry.type === 'CREDIT' ? 'Confirmée' : 'Justifié' },
            { label: 'Date', value: formatDateAt(selectedEntry.createdAt) },
          ]}
        />
      )}

      {viewedProfile && (
        <AvatarViewer
          open
          onClose={() => setViewedProfile(null)}
          name={viewedProfile.name}
          photoUrl={viewedProfile.photoUrl}
        />
      )}
    </>
  );
}
