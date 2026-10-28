import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  MoreVertical,
  Package,
  Settings2,
  Repeat,
  UserPlus,
  UserX,
  Receipt,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import {
  mockTransactions,
  mockUsers,
  Role,
  TransactionType,
  TransactionStatus,
  Frequency,
  MembershipRequestStatus,
  CircleType,
  ContributionMode,
  PaymentStatus,
} from '@venega/types';
import type { Transaction, MembershipRequest, Membership } from '@venega/types';
import TransactionDetailModal from '../../../components/TransactionDetailModal';
import { Avatar, Button, IconButton, ListGroup, ListRow, Sheet } from '../../../components/ui';
import { ScreenHeader } from '../components/SolidarityParts';
import {
  CircleTab,
  CircleTabBar,
  HistoryFilterButton,
  OverviewSectionHeader,
  OverviewStack,
  OverviewSummaryCard,
} from '../components/CircleOverview';
import RotationWheel from '../components/RotationWheel';
import { payButtonTitle } from '../components/PaymentFlow';
import {
  getCircle,
  getCircles,
  getFounderCircleIds,
  getCurrentUser,
  getCircleMembers,
  getActiveCycle,
  getMembershipRequests,
  removeMember,
  setMemberTurnOrder,
} from '../circleStore';

// Dans une tontine il n'y a que deux statuts : le fondateur (rôle PRESIDENT) et les membres.
const isFounderRole = (role: Role) => role === Role.PRESIDENT;

const monthLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

type Tab = 'apercu' | 'tour' | 'membres' | 'demandes' | 'gestion';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

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
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const daysUntilNextSaturday = () => {
  const today = new Date();
  const diff = (6 - today.getDay() + 7) % 7;
  return diff === 0 ? 7 : diff;
};

export default function TontineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const isFounder = getFounderCircleIds().includes(circle.id);
  const me = getCurrentUser();
  const cycle = getActiveCycle(circle);
  // Une tontine est un seul produit, en argent ou en nature (le bien est remis à tour de rôle).
  const isNature = circle.contributionMode === ContributionMode.NATURE || circle.type === CircleType.NATURE;
  const goalItem = circle.rules?.goalItem?.trim() || undefined;
  const itemName = goalItem ?? 'Bien en nature';

  const [tab, setTab] = useState<Tab>('apercu');
  const [showFounderMenu, setShowFounderMenu] = useState(false);
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    mockTransactions.filter((t) => t.circleId === circle.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>(() => getMembershipRequests(circle.id));
  const [, forceRender] = useState(0);
  const [turnPickerMember, setTurnPickerMember] = useState<{ userId: string; name: string } | null>(null);
  const refreshMembershipRequests = () => setMembershipRequests(getMembershipRequests(circle.id));

  useFocusEffect(
    useCallback(() => {
      setTransactions(
        mockTransactions.filter((t) => t.circleId === circle.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      );
      refreshMembershipRequests();
    }, [circle.id])
  );

  const handleRemoveMember = (userId: string, name: string) => {
    Alert.alert(
      'Retirer du cercle ?',
      `${name} ne fera plus partie de la tontine "${circle.name}".`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            removeMember(circle.id, userId);
            forceRender((n) => n + 1);
          },
        },
      ]
    );
  };

  const handlePickTurn = (turnOrder: number) => {
    if (!turnPickerMember) return;
    setMemberTurnOrder(circle.id, turnPickerMember.userId, turnOrder);
    setTurnPickerMember(null);
    forceRender((n) => n + 1);
  };

  const handleOpenSettings = () => {
    router.push(`/circle/${circle.id}/edit` as any);
  };

  const currentTurn = cycle?.currentTurn ?? 1;
  const storedMembers = getCircleMembers(circle.id);
  // Données de démonstration : certains cercles fictifs (ex. la tontine moto) n'ont pas
  // encore d'adhésions dans les données de test — on reprend le repli de l'ancienne fiche.
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

  const monthsWithActivity = [...new Set(transactions.map((t) => new Date(t.createdAt).getMonth()))].sort((a, b) => a - b);
  const filteredTx = monthFilter === null ? transactions : transactions.filter((t) => new Date(t.createdAt).getMonth() === monthFilter);

  const visibleTx = filteredTx.slice(0, visibleCount);
  const groups: { dateLabel: string; items: Transaction[] }[] = [];
  visibleTx.forEach((t) => {
    const label = formatDateHeader(t.createdAt);
    const group = groups.find((g) => g.dateLabel === label);
    if (group) group.items.push(t);
    else groups.push({ dateLabel: label, items: [t] });
  });

  const nextDueDays = circle.frequency === Frequency.WEEKLY ? daysUntilNextSaturday() : null;

  const handlePayNow = () => {
    router.push(`/payment?circleId=${circle.id}&amount=${circle.tontineAmount}&type=TONTINE` as any);
  };

  const openMember = (userId: string) => {
    router.push(`/circle/${circle.id}/member/${userId}` as any);
  };

  const openMembershipRequest = (requestId: string) => {
    router.push({ pathname: '/circle/[id]/requests', params: { id: circle.id, requestId } } as any);
  };

  const memberName = (m: Membership) => `${m.user.firstName} ${m.user.lastName}`;

  const handleSettings = () => {
    setShowFounderMenu(false);
    router.push(`/circle/${circle.id}/manage` as any);
  };

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
      return isNature ? `${itemName} remis à ${t.memberName} · Tour ${turn}` : `Cagnotte reçue par ${t.memberName} · Tour ${turn}`;
    }
    const base = t.userId === me.id ? 'Cotisation tontine versée' : `Cotisation de ${t.memberName}`;
    return `${base} · Tour ${turn}`;
  };

  const txStatusLabel = (t: Transaction) => {
    if (t.type === TransactionType.PAYOUT) return isNature ? 'Remis' : 'Versée';
    return t.status === TransactionStatus.PENDING ? 'En attente' : t.status === TransactionStatus.FAILED ? 'Échouée' : 'Payé';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── En-tête ── */}
        <ScreenHeader
          title={circle.name}
          subtitle={`${isNature ? 'Tontine en nature' : 'Tontine'} · Vous êtes ${isFounder ? 'fondateur' : 'membre'}`}
          onBack={() => router.back()}
          right={
            isFounder ? (
              <IconButton
                icon={MoreVertical}
                variant="plain"
                accessibilityLabel="Options du cercle"
                onPress={() => setShowFounderMenu((v) => !v)}
              />
            ) : null
          }
        />

        {/* ── Onglets ── */}
        <CircleTabBar>
          <CircleTab label="Aperçu" active={tab === 'apercu'} onPress={() => setTab('apercu')} />
          <CircleTab label="Tour" active={tab === 'tour'} onPress={() => setTab('tour')} />
          <CircleTab label="Membres" active={tab === 'membres'} onPress={() => setTab('membres')} />
          <CircleTab label="Demandes" active={tab === 'demandes'} badge={pendingMembership.length} onPress={() => setTab('demandes')} />
          {isFounder && <CircleTab label="Gestion" active={tab === 'gestion'} onPress={() => setTab('gestion')} />}
        </CircleTabBar>

        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {tab === 'apercu' && (
            <View>
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
                          : `${turnBeneficiary.user.firstName} ${turnBeneficiary.user.lastName}`
                        : '—',
                      person: turnBeneficiary
                        ? {
                            name: `${turnBeneficiary.user.firstName} ${turnBeneficiary.user.lastName}`,
                            uri: turnBeneficiary.user.avatarUrl,
                          }
                        : undefined,
                    },
                    { label: 'Cotisations', value: `${turnCompletedCount}/${members.length} ont cotisé` },
                  ]}
                  progress={turnProgress}
                />

                {isNature && (
                  <View style={[styles.card, styles.itemCard]}>
                    {circle.rules?.goalImageUrl ? (
                      <Image source={{ uri: circle.rules.goalImageUrl }} style={styles.itemImage} resizeMode="cover" accessibilityLabel={itemName} />
                    ) : (
                      <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                        <Package size={40} color={colors.muted} strokeWidth={1.5} />
                      </View>
                    )}
                    <View style={styles.itemBody}>
                      <Text style={styles.itemEyebrow}>Bien remis à chaque tour</Text>
                      <Text style={styles.itemName}>{itemName}</Text>
                      {!!circle.rules?.goalDetails && <Text style={styles.itemDetails}>{circle.rules.goalDetails}</Text>}
                      <View style={styles.itemFacts}>
                        {!!circle.rules?.goalAmount && (
                          <View style={styles.itemFact}>
                            <Text style={styles.itemFactLabel}>Valeur estimée</Text>
                            <Text style={styles.itemFactValue}>{formatXOF(circle.rules.goalAmount)}</Text>
                          </View>
                        )}
                        <View style={styles.itemFact}>
                          <Text style={styles.itemFactLabel}>Cotisation</Text>
                          <Text style={styles.itemFactValue}>{formatXOF(circle.tontineAmount)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </OverviewStack>

              {/* ── Historique ── */}
              <OverviewSectionHeader
                title="Historique"
                right={
                  monthsWithActivity.length > 1 ? (
                    <HistoryFilterButton
                      label={monthFilter !== null ? `${monthLabels[monthFilter]} 2026` : 'Filtrer'}
                      active={monthFilter !== null}
                      onPress={() => setShowMonthFilter((v) => !v)}
                    />
                  ) : null
                }
              />

              {filteredTx.length === 0 && (
                <EmptyState icon={Receipt} title="Aucune opération" text={isNature ? 'Les cotisations et les remises du bien apparaîtront ici.' : 'Les cotisations et cagnottes apparaîtront ici.'} />
              )}

              {groups.map((group) => (
                <View key={group.dateLabel} style={styles.txGroup}>
                  <Text style={styles.dateGroupLabel}>{group.dateLabel}</Text>
                  <View style={styles.card}>
                    {group.items.map((t, i) => {
                      const isCredit = t.type !== TransactionType.PAYOUT;
                      const pending = t.status === TransactionStatus.PENDING;
                      const failed = t.status === TransactionStatus.FAILED;
                      const Icon = isCredit ? ArrowUpRight : ArrowDownLeft;
                      return (
                        <TouchableOpacity
                          key={t.id}
                          activeOpacity={0.6}
                          onPress={() => setSelectedTx(t)}
                          style={styles.row}
                        >
                          <View
                            style={[
                              styles.rowIcon,
                              styles.rowIconRound,
                              { backgroundColor: pending ? colors.accent.tint : isCredit ? colors.primary.tint : colors.fill },
                            ]}
                          >
                            <Icon size={18} color={pending ? colors.accent.dark : isCredit ? colors.primary.DEFAULT : colors.inkSoft} />
                          </View>
                          <View style={[styles.rowBody, i < group.items.length - 1 && styles.rowBorder]}>
                            <View style={styles.flex}>
                              <Text style={styles.rowTitle} numberOfLines={2}>
                                {txLabel(t)}
                              </Text>
                              <Text style={styles.rowSub}>
                                {new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </View>
                            <View style={styles.amountCol}>
                              <Text style={[styles.amount, { color: isCredit ? colors.primary.DEFAULT : colors.ink }]}>
                                {isCredit ? '+' : '−'}
                                {formatXOF(t.amount)}
                              </Text>
                              <Text
                                style={[
                                  styles.txStatus,
                                  pending && { color: colors.accent.dark },
                                  failed && { color: colors.danger.DEFAULT },
                                ]}
                              >
                                {txStatusLabel(t)}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              {filteredTx.length > visibleCount && (
                <Button title="Voir plus" variant="ghost" size="sm" onPress={() => setVisibleCount((n) => n + 5)} />
              )}
            </View>
          )}

          {tab === 'tour' && (
            <View>
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
                <Text style={styles.tourProgressText}>
                  {turnCompletedCount}/{members.length} membres ont cotisé pour ce tour
                </Text>
                {nextDueDays != null && (
                  <Text style={styles.tourDueText}>
                    Prochaine cotisation dans {nextDueDays} jour{nextDueDays > 1 ? 's' : ''}
                  </Text>
                )}
                <Button title={payButtonTitle(circle.tontineAmount)} onPress={handlePayNow} />
                {isFounder && (
                  <Button
                    title="Verser la cagnotte"
                    variant="secondary"
                    onPress={() => router.push(`/circle/${circle.id}/payout` as any)}
                  />
                )}
              </RotationWheel>

              <Text style={[styles.groupTitle, styles.tourListTitle]}>Ordre de passage</Text>
              <View style={styles.card}>
                {members.map((m, idx) => {
                  const isCurrent = m.userId === turnBeneficiary?.userId;
                  const status = m.hasReceivedPayout
                    ? isNature ? 'Bien reçu' : 'Servi'
                    : isCurrent
                    ? 'Ce tour'
                    : 'À venir';
                  return (
                    <TouchableOpacity key={m.userId} style={styles.row} activeOpacity={0.6} onPress={() => openMember(m.userId)}>
                      <Avatar name={memberName(m)} uri={m.user.avatarUrl} size={40} highlighted={isCurrent} />
                      <View style={[styles.rowBody, idx < members.length - 1 && styles.rowBorder]}>
                        <View style={styles.flex}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {memberName(m)}{m.userId === me.id ? ' (Moi)' : ''}
                          </Text>
                          <Text style={styles.rowSub}>
                            Tour {m.turnOrder ?? '—'}{isFounderRole(m.role) ? ' · Fondateur' : ''}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.turnStatus,
                            isCurrent && { color: colors.primary.DEFAULT },
                            m.hasReceivedPayout && { color: colors.accent.deep },
                          ]}
                        >
                          {status}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {tab === 'membres' && (
            <View>
              <Text style={styles.groupTitle}>{sortedMembers.length} membre(s)</Text>
              <View style={styles.card}>
                {sortedMembers.map((m, idx) => {
                  const fullName = memberName(m);
                  return (
                    <TouchableOpacity
                      key={m.userId}
                      style={styles.row}
                      activeOpacity={0.6}
                      accessibilityLabel={`Voir le profil de ${fullName}`}
                      onPress={() => openMember(m.userId)}
                    >
                      <Avatar name={fullName} uri={m.user.avatarUrl} size={40} />
                      <View style={[styles.rowBody, idx < sortedMembers.length - 1 && styles.rowBorder]}>
                        <View style={styles.flex}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {fullName}{m.userId === me.id ? ' (Moi)' : ''}
                          </Text>
                          <View style={styles.memberMetaRow}>
                            {isFounderRole(m.role) && (
                              <View style={styles.roleTag}>
                                <Text style={styles.roleTagText}>Fondateur</Text>
                              </View>
                            )}
                            <Text style={styles.rowSubInline}>Membre depuis {formatMonthYear(m.joinedAt)}</Text>
                          </View>
                        </View>
                        <ChevronRight size={18} color={colors.muted} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {tab === 'demandes' && (
            <View>
              <Text style={styles.groupTitle}>Demandes d'adhésion</Text>
              {pendingMembership.length === 0 ? (
                <EmptyState icon={UserPlus} title="Aucune demande" text="Aucune demande d'adhésion en attente." />
              ) : (
                <View style={styles.card}>
                  {pendingMembership.map((r, idx) => (
                    <TouchableOpacity
                      key={r.id}
                      style={styles.row}
                      activeOpacity={0.6}
                      accessibilityRole="button"
                      accessibilityLabel={`Voir le dossier de ${r.fullName}`}
                      onPress={() => openMembershipRequest(r.id)}
                    >
                      <Avatar name={r.fullName} uri={r.user?.avatarUrl} size={40} />
                      <View style={[styles.rowBody, idx < pendingMembership.length - 1 && styles.rowBorder]}>
                        <View style={styles.flex}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {r.fullName}
                          </Text>
                          <Text style={styles.rowSub}>Demande du {formatShortDate(r.createdAt)}</Text>
                        </View>
                        <Text style={styles.requestLink}>Voir le dossier</Text>
                        <ChevronRight size={18} color={colors.primary.DEFAULT} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {tab === 'gestion' && isFounder && (
            <View>
              <Text style={styles.groupTitle}>Gestion des membres</Text>
              <View style={styles.stack}>
                {sortedMembers.map((m) => {
                  const fullName = `${m.user.firstName} ${m.user.lastName}`;
                  return (
                    <View key={m.userId} style={[styles.card, styles.gestionCard]}>
                      <View style={styles.requestHeaderRow}>
                        <Avatar name={fullName} uri={m.user.avatarUrl} size={40} />
                        <View style={styles.flex}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {fullName}{m.userId === me.id ? ' (Moi)' : ''}
                          </Text>
                          <Text style={styles.rowSub}>Tour {m.turnOrder ?? '—'}</Text>
                        </View>
                      </View>
                      {m.userId !== me.id && (
                        <View style={styles.decisionRow}>
                          <TouchableOpacity
                            style={styles.actionBtn}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            onPress={() => setTurnPickerMember({ userId: m.userId, name: fullName })}
                          >
                            <Repeat size={15} color={colors.inkSoft} />
                            <Text style={styles.actionBtnText}>Changer le tour</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.actionBtnDanger]}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            onPress={() => handleRemoveMember(m.userId, fullName)}
                          >
                            <UserX size={15} color={colors.danger.DEFAULT} />
                            <Text style={[styles.actionBtnText, { color: colors.danger.DEFAULT }]}>Retirer</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <ListGroup title="Paramètres" style={styles.settingsGroup}>
                <ListRow icon={Settings2} tone="primary" title="Reparamétrer le cercle" onPress={handleOpenSettings} last />
              </ListGroup>
            </View>
          )}
        </ScrollView>

        {/* ── Menu fondateur ── */}
        <Sheet visible={showFounderMenu} onClose={() => setShowFounderMenu(false)} title="Options du cercle">
          <ListGroup>
            <ListRow icon={Settings2} tone="primary" title="Paramètres du cercle" onPress={handleSettings} last />
          </ListGroup>
        </Sheet>

        {/* ── Filtre par mois ── */}
        <Sheet visible={showMonthFilter} onClose={() => setShowMonthFilter(false)} title="Filtrer par mois">
          <ScrollView style={styles.monthList} showsVerticalScrollIndicator={false}>
            <ListGroup>
              <ListRow
                title="Tous les mois"
                value={monthFilter === null ? 'Sélectionné' : undefined}
                valueTone="success"
                chevron={false}
                onPress={() => { setMonthFilter(null); setVisibleCount(5); setShowMonthFilter(false); }}
                last={monthsWithActivity.length === 0}
              />
              {monthsWithActivity.map((mIdx, i) => (
                <ListRow
                  key={mIdx}
                  title={`${monthLabels[mIdx]} 2026`}
                  value={monthFilter === mIdx ? 'Sélectionné' : undefined}
                  valueTone="success"
                  chevron={false}
                  onPress={() => { setMonthFilter(mIdx); setVisibleCount(5); setShowMonthFilter(false); }}
                  last={i === monthsWithActivity.length - 1}
                />
              ))}
            </ListGroup>
          </ScrollView>
        </Sheet>

        {selectedTx && (
          <TransactionDetailModal
            visible={!!selectedTx}
            onClose={() => setSelectedTx(null)}
            isCredit={selectedTx.type !== TransactionType.PAYOUT}
            name={selectedTx.memberName}
            amount={formatXOF(selectedTx.amount).replace(' F CFA', ' F')}
            fields={[
              { label: 'Type', value: selectedTx.type === TransactionType.PAYOUT ? (isNature ? 'Bien remis' : 'Cagnotte reçue') : 'Cotisation' },
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
          visible={!!turnPickerMember}
          onClose={() => setTurnPickerMember(null)}
          title={`Nouveau tour pour ${turnPickerMember?.name ?? ''}`}
        >
          <Text style={styles.turnPickerSubtitle}>La personne qui occupe déjà ce tour prendra sa place actuelle.</Text>
          <View style={styles.turnPickerGrid}>
            {members.map((m) => (
              <TouchableOpacity
                key={m.userId}
                style={styles.turnPickerItem}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Tour ${m.turnOrder}`}
                onPress={() => handlePickTurn(m.turnOrder ?? 1)}
              >
                <Text style={styles.turnPickerItemText}>{m.turnOrder}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Annuler" variant="secondary" onPress={() => setTurnPickerMember(null)} style={styles.turnPickerCancel} />
        </Sheet>
      </SafeAreaView>
    </View>
  );
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof Receipt; title: string; text: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon size={24} color={colors.muted} strokeWidth={1.8} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  contentScroll: { flex: 1, backgroundColor: colors.fill },
  scrollContent: { padding: 16, paddingBottom: 48 },

  groupTitle: { ...typography.footnote, fontWeight: '600', color: colors.muted, marginBottom: 8, marginLeft: 4 },
  monthList: { flexGrow: 0 },

  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  stack: { gap: 10 },

  /* ── Lignes de liste ── */
  txGroup: { marginBottom: 16 },
  dateGroupLabel: { ...typography.footnote, fontWeight: '600', color: colors.muted, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, gap: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowIconRound: { borderRadius: 20 },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingRight: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  rowSub: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  rowSubInline: { ...typography.footnote, color: colors.muted, flexShrink: 1 },
  amountCol: { alignItems: 'flex-end' },
  amount: { ...typography.callout, fontWeight: '700' },
  txStatus: { ...typography.caption, color: colors.muted, marginTop: 2 },

  /* ── Membres ── */
  memberMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  roleTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: colors.accent.tint },
  roleTagText: { ...typography.caption, color: colors.accent.deep },

  /* ── Demandes et gestion ── */
  requestLink: { ...typography.footnote, fontWeight: '600', color: colors.primary.DEFAULT },
  requestHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  decisionRow: { flexDirection: 'row', gap: 8 },
  gestionCard: { padding: 14, gap: 14 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
  },
  actionBtnDanger: { borderColor: colors.danger.tint, backgroundColor: colors.danger.tint },
  actionBtnText: { ...typography.footnote, fontWeight: '600', color: colors.inkSoft },
  settingsGroup: { marginTop: 24 },

  /* ── Bien en nature ── */
  itemCard: { padding: 12 },
  itemImage: { width: '100%', height: 180, borderRadius: radius.lg, backgroundColor: colors.fill },
  itemImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  itemBody: { paddingHorizontal: 4, paddingTop: 12, paddingBottom: 2 },
  itemEyebrow: { ...typography.footnote, color: colors.muted },
  itemName: { ...typography.headline, color: colors.ink, marginTop: 2 },
  itemDetails: { ...typography.callout, color: colors.inkSoft, marginTop: 6 },
  itemFacts: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  itemFact: { flex: 1, minWidth: 0 },
  itemFactLabel: { ...typography.caption, fontWeight: '400', color: colors.muted },
  itemFactValue: { ...typography.bodyStrong, color: colors.ink, marginTop: 2 },

  /* ── Tour ── */
  tourProgressText: { ...typography.callout, fontWeight: '600', color: colors.primary.DEFAULT, textAlign: 'center' },
  tourDueText: { ...typography.footnote, color: colors.muted, textAlign: 'center', marginTop: -4 },
  tourListTitle: { marginTop: 24 },
  turnStatus: { ...typography.footnote, fontWeight: '600', color: colors.muted },

  /* ── État vide ── */
  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: { ...typography.headline, color: colors.ink, textAlign: 'center' },
  emptyText: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 4 },

  /* ── Sélecteur de tour ── */
  turnPickerSubtitle: { ...typography.footnote, color: colors.muted, marginBottom: 16 },
  turnPickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  turnPickerItem: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  turnPickerItemText: { ...typography.bodyStrong, color: colors.primary.dark },
  turnPickerCancel: { marginTop: 20 },
});
