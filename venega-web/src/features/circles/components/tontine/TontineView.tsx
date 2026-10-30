'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  MoreVertical,
  Package,
  Receipt,
  Repeat,
  Settings2,
  UserPlus,
  UserX,
  type LucideIcon,
} from 'lucide-react';
import {
  CircleType,
  ContributionMode,
  MembershipRequestStatus,
  PaymentStatus,
  Role,
  TransactionStatus,
  TransactionType,
  mockTransactions,
  mockUsers,
  type Membership,
  type Transaction,
} from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { TransactionDetailSheet } from '@/components/ui/DetailSheets';
import { useDemoStore } from '@/lib/demoStore';
import {
  formatDueIn,
  getActiveCycle,
  getCircle,
  getCircleMembers,
  getCurrentUser,
  getFounderCircleIds,
  getMembershipRequests,
  getNextContribution,
  removeMember,
  setMemberTurnOrder,
} from '../../store';
import {
  CircleTab,
  CircleTabBar,
  HistoryFilterButton,
  OverviewSectionHeader,
  OverviewStack,
  OverviewSummaryCard,
} from '../overview';
import { RotationWheel } from '../RotationWheel';

/*
 * Écran d'une tontine (en argent ou en nature) — copie de TontineScreen.tsx mobile.
 * TODO API : `GET /circles/:id` (membres, cycle actif, bénéficiaire du tour) et
 * `GET /transactions/circle/:circleId` (docs/api-mobile.md, section 3).
 */

// Dans une tontine il n'y a que deux statuts : le fondateur (rôle PRESIDENT) et les membres.
const isFounderRole = (role: Role) => role === Role.PRESIDENT;

const monthLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

type Tab = 'apercu' | 'tour' | 'membres' | 'demandes' | 'gestion';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';
const formatMonthYear = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
};
const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const formatDateHeader = (iso: string) => {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) return "Aujourd'hui";
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};
/** Clé « année-mois » d'une date, pour le filtre de l'historique. */
const monthKey = (iso: string) => {
  const d = new Date(iso);
  return d.getFullYear() * 12 + d.getMonth();
};
const monthKeyLabel = (key: number) => `${monthLabels[key % 12]} ${Math.floor(key / 12)}`;

export function TontineView({ circleId }: { circleId: string }) {
  useDemoStore();
  const router = useRouter();
  const circle = getCircle(circleId);

  const [tab, setTab] = useState<Tab>('apercu');
  const [showFounderMenu, setShowFounderMenu] = useState(false);
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [turnPickerMember, setTurnPickerMember] = useState<{ userId: string; name: string } | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null);

  const transactions = useMemo(
    () =>
      mockTransactions
        .filter((t) => t.circleId === circleId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [circleId],
  );

  if (!circle) {
    return (
      <>
        <PageHeader title="Cercle introuvable" backHref="/circles" />
        <p className="mx-auto max-w-2xl px-4 py-8 text-[15px] text-muted">Ce cercle n’existe pas ou plus.</p>
      </>
    );
  }

  const isFounder = getFounderCircleIds().includes(circle.id);
  const me = getCurrentUser();
  const cycle = getActiveCycle(circle);
  // Une tontine est un seul produit, en argent ou en nature (le bien est remis à tour de rôle).
  const isNature = circle.contributionMode === ContributionMode.NATURE || circle.type === CircleType.NATURE;
  const goalItem = circle.rules?.goalItem?.trim() || undefined;
  const itemName = goalItem ?? 'Bien en nature';
  const membershipRequests = getMembershipRequests(circle.id);
  const currentTurn = cycle?.currentTurn ?? 1;

  const storedMembers = getCircleMembers(circle.id);
  // Données de démonstration : certains cercles fictifs (ex. la tontine moto) n'ont pas
  // encore d'adhésions dans les données de test — même repli que l'app mobile.
  const memberSource: Membership[] =
    storedMembers.length > 0 || circle.memberCount === 0
      ? storedMembers
      : mockUsers.slice(0, Math.min(circle.memberCount, 8)).map((u, idx) => ({
          userId: u.id,
          circleId: circle.id,
          role: idx === 0 ? Role.PRESIDENT : Role.MEMBER,
          turnOrder: idx + 1,
          paymentStatus: idx < 2 ? PaymentStatus.PAID : PaymentStatus.PENDING,
          joinedAt: circle.createdAt,
          user: u,
          reliabilityScore: 88,
          hasReceivedPayout: idx + 1 < currentTurn,
          hasDeposit: true,
        }));
  const members = [...memberSource].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const sortedMembers = [...members].sort((a, b) => Number(!isFounderRole(a.role)) - Number(!isFounderRole(b.role)));
  const pendingMembership = membershipRequests.filter((r) => r.status === MembershipRequestStatus.PENDING);

  const completedContribByUser: Record<string, number> = {};
  transactions.forEach((t) => {
    if (t.type === TransactionType.TONTINE_CONTRIBUTION && t.status === TransactionStatus.COMPLETED) {
      completedContribByUser[t.userId] = (completedContribByUser[t.userId] ?? 0) + 1;
    }
  });
  const turnCompletedCount = members.filter((m) => (completedContribByUser[m.userId] ?? 0) >= currentTurn).length;
  const turnProgress = members.length > 0 ? turnCompletedCount / members.length : 0;
  const turnBeneficiary = members.find((m) => m.turnOrder === currentTurn) ?? members.find((m) => !m.hasReceivedPayout);
  const turnPot = circle.tontineAmount * members.length;

  const monthsWithActivity = [...new Set(transactions.map((t) => monthKey(t.createdAt)))].sort((a, b) => a - b);
  const filteredTx =
    monthFilter === null ? transactions : transactions.filter((t) => monthKey(t.createdAt) === monthFilter);
  const visibleTx = filteredTx.slice(0, visibleCount);
  const groups: { dateLabel: string; items: Transaction[] }[] = [];
  visibleTx.forEach((t) => {
    const label = formatDateHeader(t.createdAt);
    const group = groups.find((g) => g.dateLabel === label);
    if (group) group.items.push(t);
    else groups.push({ dateLabel: label, items: [t] });
  });

  const nextDueDays = getNextContribution(circle)?.daysLeft ?? null;
  const payHref = `/payment?circleId=${circle.id}&amount=${circle.tontineAmount}&type=TONTINE`;
  const openMember = (userId: string) => router.push(`/circles/${circle.id}/member/${userId}`);
  const memberName = (m: Membership) => `${m.user.firstName} ${m.user.lastName}`;

  const getTurnNumber = (t: Transaction) => {
    if (t.type === TransactionType.PAYOUT) {
      return members.find((m) => m.userId === t.userId)?.turnOrder ?? '—';
    }
    const sameUserContribs = transactions
      .filter((x) => x.type === TransactionType.TONTINE_CONTRIBUTION && x.userId === t.userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return sameUserContribs.findIndex((x) => x.id === t.id) + 1;
  };

  const txLabel = (t: Transaction) => {
    const turn = getTurnNumber(t);
    if (t.type === TransactionType.PAYOUT) {
      return isNature
        ? `${itemName} remis à ${t.memberName} · Tour ${turn}`
        : `Cagnotte reçue par ${t.memberName} · Tour ${turn}`;
    }
    const base = t.userId === me.id ? 'Cotisation tontine versée' : `Cotisation de ${t.memberName}`;
    return `${base} · Tour ${turn}`;
  };

  const txStatusLabel = (t: Transaction) => {
    if (t.type === TransactionType.PAYOUT) return isNature ? 'Remis' : 'Versée';
    return t.status === TransactionStatus.PENDING ? 'En attente' : t.status === TransactionStatus.FAILED ? 'Échouée' : 'Payé';
  };

  const handlePickTurn = (turnOrder: number) => {
    if (!turnPickerMember) return;
    setMemberTurnOrder(circle.id, turnPickerMember.userId, turnOrder);
    setTurnPickerMember(null);
  };

  const confirmRemove = () => {
    if (!memberToRemove) return;
    removeMember(circle.id, memberToRemove.userId);
    setMemberToRemove(null);
  };

  const groupTitle = 'mb-2 px-1 text-[13px] font-semibold text-muted';
  const rowBase = 'flex w-full items-center gap-3 pl-3.5 text-left transition-colors hover:bg-fill';
  const rowBody = (border: boolean) =>
    `flex min-h-[64px] min-w-0 flex-1 items-center gap-2.5 py-3 pr-3.5 ${border ? 'border-b border-line' : ''}`;

  return (
    <>
      <PageHeader
        title={circle.name}
        subtitle={`${isNature ? 'Tontine en nature' : 'Tontine'} · Vous êtes ${isFounder ? 'fondateur' : 'membre'}`}
        backHref="/circles"
        right={
          isFounder ? (
            <button
              type="button"
              onClick={() => setShowFounderMenu(true)}
              aria-label="Options du cercle"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-fill"
            >
              <MoreVertical size={20} aria-hidden />
            </button>
          ) : null
        }
      />

      <CircleTabBar>
        <CircleTab label="Aperçu" active={tab === 'apercu'} onClick={() => setTab('apercu')} />
        <CircleTab label="Tour" active={tab === 'tour'} onClick={() => setTab('tour')} />
        <CircleTab label="Membres" active={tab === 'membres'} onClick={() => setTab('membres')} />
        <CircleTab
          label="Demandes"
          active={tab === 'demandes'}
          badge={pendingMembership.length}
          onClick={() => setTab('demandes')}
        />
        {isFounder && <CircleTab label="Gestion" active={tab === 'gestion'} onClick={() => setTab('gestion')} />}
      </CircleTabBar>

      <div className="mx-auto max-w-2xl px-4 pb-10 pt-4 sm:px-6">
        {tab === 'apercu' && (
          <div>
            <OverviewStack>
              <OverviewSummaryCard
                label={isNature ? `Bien du tour ${currentTurn}` : `Cagnotte du tour ${currentTurn}`}
                amount={isNature ? itemName : formatXOF(turnPot)}
                stats={[
                  {
                    label: 'Bénéficiaire du tour',
                    value: turnBeneficiary
                      ? turnBeneficiary.userId === me.id
                        ? 'Moi'
                        : memberName(turnBeneficiary)
                      : '—',
                    person: turnBeneficiary
                      ? { name: memberName(turnBeneficiary), uri: turnBeneficiary.user.avatarUrl }
                      : undefined,
                  },
                  { label: 'Cotisations', value: `${turnCompletedCount}/${members.length} ont cotisé` },
                ]}
                progress={turnProgress}
                dueInDays={nextDueDays ?? undefined}
              />

              {isNature && (
                <section className="overflow-hidden rounded-[20px] border border-line bg-white sm:flex">
                  {circle.rules?.goalImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={circle.rules.goalImageUrl}
                      alt={itemName}
                      className="h-44 w-full object-cover sm:h-auto sm:w-48"
                    />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-fill text-muted sm:h-auto sm:w-48">
                      <Package size={40} strokeWidth={1.5} aria-hidden />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <p className="text-[12px] font-semibold text-amber-dark">Bien remis à chaque tour</p>
                    <p className="mt-1 text-[17px] font-bold text-ink">{itemName}</p>
                    {!!circle.rules?.goalDetails && (
                      <p className="mt-1 text-[14px] text-ink-soft">{circle.rules.goalDetails}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                      {!!circle.rules?.goalAmount && (
                        <div>
                          <p className="text-[12px] text-muted">Valeur estimée</p>
                          <p className="text-[15px] font-semibold text-ink">{formatXOF(circle.rules.goalAmount)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[12px] text-muted">Cotisation</p>
                        <p className="text-[15px] font-semibold text-ink">{formatXOF(circle.tontineAmount)}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </OverviewStack>

            <OverviewSectionHeader
              title="Historique"
              right={
                monthsWithActivity.length > 1 ? (
                  <HistoryFilterButton
                    label={monthFilter !== null ? monthKeyLabel(monthFilter) : 'Filtrer'}
                    active={monthFilter !== null}
                    onClick={() => setShowMonthFilter(true)}
                  />
                ) : null
              }
            />

            {filteredTx.length === 0 && (
              <EmptyBlock
                icon={Receipt}
                title="Aucune opération"
                text={
                  isNature
                    ? 'Les cotisations et les remises du bien apparaîtront ici.'
                    : 'Les cotisations et cagnottes apparaîtront ici.'
                }
              />
            )}

            {groups.map((group) => (
              <div key={group.dateLabel} className="mb-4">
                <p className="mb-2 px-1 text-[13px] font-semibold text-muted">{group.dateLabel}</p>
                <div className="overflow-hidden rounded-[20px] border border-line bg-white">
                  {group.items.map((t, i) => {
                    const isCredit = t.type !== TransactionType.PAYOUT;
                    const pending = t.status === TransactionStatus.PENDING;
                    const failed = t.status === TransactionStatus.FAILED;
                    const Icon = isCredit ? ArrowUpRight : ArrowDownLeft;
                    return (
                      <button key={t.id} type="button" onClick={() => setSelectedTx(t)} className={rowBase}>
                        <span
                          aria-hidden
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            pending
                              ? 'bg-amber-tint text-amber-dark'
                              : isCredit
                                ? 'bg-primary-tint text-primary'
                                : 'bg-fill text-ink-soft'
                          }`}
                        >
                          <Icon size={18} />
                        </span>
                        <span className={rowBody(i < group.items.length - 1)}>
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 block text-[15px] font-semibold text-ink">{txLabel(t)}</span>
                            <span className="mt-0.5 block text-[13px] text-muted">
                              {new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className={`block text-[15px] font-bold ${isCredit ? 'text-primary' : 'text-ink'}`}>
                              {isCredit ? '+' : '−'}
                              {formatXOF(t.amount)}
                            </span>
                            <span
                              className={`block text-[12px] ${
                                pending ? 'text-amber-dark' : failed ? 'text-danger' : 'text-muted'
                              }`}
                            >
                              {txStatusLabel(t)}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredTx.length > visibleCount && (
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + 5)}
                className="mx-auto block h-10 rounded-full px-4 text-[14px] font-semibold text-primary hover:bg-primary-tint"
              >
                Voir plus
              </button>
            )}
          </div>
        )}

        {tab === 'tour' && (
          <div>
            <RotationWheel
              title="Tour en cours"
              members={members.map((m) => ({
                userId: m.userId,
                name: memberName(m),
                avatarUrl: m.user.avatarUrl,
                hasReceived: m.hasReceivedPayout,
              }))}
              beneficiaryUserId={turnBeneficiary?.userId}
              centerName={turnBeneficiary ? (turnBeneficiary.userId === me.id ? 'Moi' : turnBeneficiary.user.firstName) : '—'}
              centerCaption={`Tour ${currentTurn} / ${members.length}`}
              onPressMember={openMember}
            >
              <p className="text-center text-[14px] text-ink-soft">
                {turnCompletedCount}/{members.length} membres ont cotisé pour ce tour
              </p>
              {nextDueDays != null && (
                <p className="text-center text-[13px] text-muted">Prochaine cotisation {formatDueIn(nextDueDays)}</p>
              )}
              <Button onClick={() => router.push(payHref)}>Payer {formatXOF(circle.tontineAmount)}</Button>
              {isFounder && (
                <Button variant="secondary" onClick={() => router.push(`/circles/${circle.id}/payout`)}>
                  {isNature ? 'Remettre le bien' : 'Verser la cagnotte'}
                </Button>
              )}
            </RotationWheel>

            <h2 className={`${groupTitle} mt-6`}>Ordre de passage</h2>
            <div className="overflow-hidden rounded-[20px] border border-line bg-white">
              {members.map((m, idx) => {
                const isCurrent = m.userId === turnBeneficiary?.userId;
                const status = m.hasReceivedPayout ? (isNature ? 'Bien reçu' : 'Servi') : isCurrent ? 'Ce tour' : 'À venir';
                return (
                  <button key={m.userId} type="button" onClick={() => openMember(m.userId)} className={rowBase}>
                    <Avatar name={memberName(m)} uri={m.user.avatarUrl} size={40} highlighted={isCurrent} />
                    <span className={rowBody(idx < members.length - 1)}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">
                          {memberName(m)}
                          {m.userId === me.id ? ' (Moi)' : ''}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-muted">
                          Tour {m.turnOrder ?? '—'}
                          {isFounderRole(m.role) ? ' · Fondateur' : ''}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-[13px] font-semibold ${
                          m.hasReceivedPayout ? 'text-amber-dark' : isCurrent ? 'text-primary' : 'text-muted'
                        }`}
                      >
                        {status}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'membres' && (
          <div>
            <h2 className={groupTitle}>{sortedMembers.length} membre(s)</h2>
            <div className="overflow-hidden rounded-[20px] border border-line bg-white">
              {sortedMembers.map((m, idx) => {
                const fullName = memberName(m);
                return (
                  <button
                    key={m.userId}
                    type="button"
                    onClick={() => openMember(m.userId)}
                    aria-label={`Voir le profil de ${fullName}`}
                    className={rowBase}
                  >
                    <Avatar name={fullName} uri={m.user.avatarUrl} size={40} />
                    <span className={rowBody(idx < sortedMembers.length - 1)}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">
                          {fullName}
                          {m.userId === me.id ? ' (Moi)' : ''}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {isFounderRole(m.role) && (
                            <span className="rounded-full bg-amber-tint px-2 py-0.5 text-[12px] font-semibold text-amber-dark">
                              Fondateur
                            </span>
                          )}
                          <span className="text-[13px] text-muted">Membre depuis {formatMonthYear(m.joinedAt)}</span>
                        </span>
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'demandes' && (
          <div>
            <h2 className={groupTitle}>Demandes d&apos;adhésion</h2>
            {pendingMembership.length === 0 ? (
              <EmptyBlock icon={UserPlus} title="Aucune demande" text="Aucune demande d'adhésion en attente." />
            ) : (
              <div className="overflow-hidden rounded-[20px] border border-line bg-white">
                {pendingMembership.map((r, idx) => (
                  <Link
                    key={r.id}
                    href={`/circles/${circle.id}/requests?requestId=${r.id}`}
                    aria-label={`Voir le dossier de ${r.fullName}`}
                    className={rowBase}
                  >
                    <Avatar name={r.fullName} uri={r.user?.avatarUrl} size={40} />
                    <span className={rowBody(idx < pendingMembership.length - 1)}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">{r.fullName}</span>
                        <span className="mt-0.5 block text-[13px] text-muted">Demande du {formatShortDate(r.createdAt)}</span>
                      </span>
                      <span className="hidden shrink-0 text-[14px] font-semibold text-primary sm:inline">Voir le dossier</span>
                      <ChevronRight size={18} className="shrink-0 text-primary" aria-hidden />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'gestion' && isFounder && (
          <div>
            <h2 className={groupTitle}>Gestion des membres</h2>
            <div className="space-y-2.5">
              {sortedMembers.map((m) => {
                const fullName = memberName(m);
                return (
                  <div key={m.userId} className="rounded-[20px] border border-line bg-white p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={fullName} uri={m.user.avatarUrl} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-ink">
                          {fullName}
                          {m.userId === me.id ? ' (Moi)' : ''}
                        </p>
                        <p className="text-[13px] text-muted">Tour {m.turnOrder ?? '—'}</p>
                      </div>
                    </div>
                    {m.userId !== me.id && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Repeat}
                          onClick={() => setTurnPickerMember({ userId: m.userId, name: fullName })}
                        >
                          Changer le tour
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={UserX}
                          onClick={() => setMemberToRemove({ userId: m.userId, name: fullName })}
                        >
                          Retirer
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <ListGroup title="Paramètres" className="mt-6">
              <ListRow
                icon={Settings2}
                tone="primary"
                title="Reparamétrer le cercle"
                href={`/circles/${circle.id}/edit`}
                last
              />
            </ListGroup>
          </div>
        )}
      </div>

      {/* ── Menu fondateur ── */}
      <Sheet open={showFounderMenu} onClose={() => setShowFounderMenu(false)} title="Options du cercle">
        <ListGroup>
          <ListRow
            icon={Settings2}
            tone="primary"
            title="Paramètres du cercle"
            href={`/circles/${circle.id}/manage`}
            last
          />
        </ListGroup>
      </Sheet>

      {/* ── Filtre par mois ── */}
      <Sheet open={showMonthFilter} onClose={() => setShowMonthFilter(false)} title="Filtrer par mois">
        <ListGroup>
          <ListRow
            title="Tous les mois"
            value={monthFilter === null ? 'Sélectionné' : undefined}
            valueTone="success"
            chevron={false}
            onClick={() => {
              setMonthFilter(null);
              setVisibleCount(5);
              setShowMonthFilter(false);
            }}
            last={monthsWithActivity.length === 0}
          />
          {monthsWithActivity.map((key, i) => (
            <ListRow
              key={key}
              title={monthKeyLabel(key)}
              value={monthFilter === key ? 'Sélectionné' : undefined}
              valueTone="success"
              chevron={false}
              onClick={() => {
                setMonthFilter(key);
                setVisibleCount(5);
                setShowMonthFilter(false);
              }}
              last={i === monthsWithActivity.length - 1}
            />
          ))}
        </ListGroup>
      </Sheet>

      {selectedTx && (
        <TransactionDetailSheet
          open
          onClose={() => setSelectedTx(null)}
          isCredit={selectedTx.type !== TransactionType.PAYOUT}
          name={selectedTx.memberName}
          amount={formatXOF(selectedTx.amount).replace(' F CFA', ' F')}
          fields={[
            {
              label: 'Type',
              value:
                selectedTx.type === TransactionType.PAYOUT ? (isNature ? 'Bien remis' : 'Cagnotte reçue') : 'Cotisation',
            },
            { label: 'Membre', value: selectedTx.memberName },
            { label: 'Tour', value: `Tour ${getTurnNumber(selectedTx)}` },
            ...(selectedTx.providerReference ? [{ label: 'Référence', value: selectedTx.providerReference }] : []),
            { label: 'Statut', value: txStatusLabel(selectedTx) },
            { label: 'Date', value: formatDate(selectedTx.createdAt) },
          ]}
        />
      )}

      {/* ── Sélecteur de tour ── */}
      <Sheet
        open={!!turnPickerMember}
        onClose={() => setTurnPickerMember(null)}
        title={`Nouveau tour pour ${turnPickerMember?.name ?? ''}`}
      >
        <p className="text-[14px] text-muted">La personne qui occupe déjà ce tour prendra sa place actuelle.</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {members.map((m) => (
            <button
              key={m.userId}
              type="button"
              onClick={() => handlePickTurn(m.turnOrder ?? 1)}
              aria-label={`Tour ${m.turnOrder}`}
              className="flex h-12 items-center justify-center rounded-[12px] border border-line bg-white text-[16px] font-semibold text-ink hover:border-primary hover:bg-primary-tint"
            >
              {m.turnOrder}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={() => setTurnPickerMember(null)} className="mt-5">
          Annuler
        </Button>
      </Sheet>

      {/* ── Confirmation du retrait (remplace Alert.alert mobile) ── */}
      <Sheet open={!!memberToRemove} onClose={() => setMemberToRemove(null)} title="Retirer du cercle ?">
        <p className="text-[15px] text-ink-soft">
          {memberToRemove?.name} ne fera plus partie de la tontine &quot;{circle.name}&quot;.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={() => setMemberToRemove(null)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmRemove}>
            Retirer
          </Button>
        </div>
      </Sheet>
    </>
  );
}

function EmptyBlock({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fill text-muted">
        <Icon size={24} strokeWidth={1.8} aria-hidden />
      </span>
      <p className="mt-3 text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-[14px] text-muted">{text}</p>
    </div>
  );
}
