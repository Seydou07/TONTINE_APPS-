import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image, Alert, PanResponder } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Check,
  ChevronRight,
  ChevronLeft,
  Filter,
  MoreVertical,
  Settings2,
  Repeat,
  UserPlus,
  UserX,
  Receipt,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { mockTransactions, Role, TransactionType, TransactionStatus, Frequency, MembershipRequestStatus } from '@venega/types';
import type { Transaction, MembershipRequest } from '@venega/types';
import TransactionDetailModal from '../../../components/TransactionDetailModal';
import AvatarViewerModal from '../../../components/AvatarViewerModal';
import { Button, IconButton, ListGroup, ListRow, Sheet } from '../../../components/ui';
import {
  getCircle,
  getCircles,
  getFounderCircleIds,
  getCurrentUser,
  getCircleMembers,
  getActiveCycle,
  getMembershipRequests,
  updateMembershipRequest,
  removeMember,
  setMemberTurnOrder,
} from '../circleStore';

const roleLabel: Record<Role, string> = {
  [Role.PRESIDENT]: 'Président',
  [Role.TREASURER]: 'Trésorier',
  [Role.SECRETARY]: 'Secrétaire',
  [Role.MEMBER]: 'Membre',
};

const roleBadgeStyle: Partial<Record<Role, { bg: string; color: string }>> = {
  [Role.PRESIDENT]: { bg: colors.accent.tint, color: colors.accent.deep },
  [Role.TREASURER]: { bg: colors.primary.tint, color: colors.primary.DEFAULT },
  [Role.SECRETARY]: { bg: colors.info.tint, color: colors.info.DEFAULT },
};

const rolePriority: Record<Role, number> = {
  [Role.PRESIDENT]: 0,
  [Role.TREASURER]: 1,
  [Role.SECRETARY]: 2,
  [Role.MEMBER]: 3,
};

const monthLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

const avatarPalette: string[] = [
  colors.accent.DEFAULT,
  colors.primary.DEFAULT,
  colors.purple.DEFAULT,
  colors.info.DEFAULT,
  colors.accent.dark,
  colors.danger.DEFAULT,
];
const avatarColor = (userId: string) => {
  const sum = userId.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length] ?? avatarPalette[0]!;
};

const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

type Tab = 'apercu' | 'tour' | 'membres' | 'demandes' | 'gestion';

const GAUGE_SIZE = 150;
const GAUGE_STROKE = 12;
const ARC_AVATAR_SIZE = 56;
const RING_GAP = 22;
const RING_RADIUS = GAUGE_SIZE / 2 + RING_GAP + ARC_AVATAR_SIZE / 2;
const RING_CAPACITY = 10;
const RING_DRAG_STEP_PX = 34;

const initials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
};

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

  const [tab, setTab] = useState<Tab>('apercu');
  const [showFounderMenu, setShowFounderMenu] = useState(false);
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [viewedProfile, setViewedProfile] = useState<{ name: string; photoUrl?: string; initials: string; color: string } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    mockTransactions.filter((t) => t.circleId === circle.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>(() => getMembershipRequests(circle.id));
  const [, forceRender] = useState(0);
  const [turnPickerMember, setTurnPickerMember] = useState<{ userId: string; name: string } | null>(null);
  const [ringOffset, setRingOffset] = useState(0);
  const ringDragStart = useRef(0);

  const ringPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderGrant: () => {
        ringDragStart.current = 0;
      },
      onPanResponderMove: (_, g) => {
        const steps = Math.trunc((g.dx - ringDragStart.current) / RING_DRAG_STEP_PX);
        if (steps !== 0) {
          ringDragStart.current += steps * RING_DRAG_STEP_PX;
          setRingOffset((o) => o - steps);
        }
      },
    })
  ).current;

  const refreshMembershipRequests = () => setMembershipRequests(getMembershipRequests(circle.id));

  useFocusEffect(
    useCallback(() => {
      setTransactions(
        mockTransactions.filter((t) => t.circleId === circle.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      );
      refreshMembershipRequests();
    }, [circle.id])
  );

  const handleDecideMembership = (id: string, approved: boolean) => {
    updateMembershipRequest(id, { status: approved ? MembershipRequestStatus.APPROVED : MembershipRequestStatus.REJECTED, decidedAt: new Date().toISOString() });
    refreshMembershipRequests();
  };

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

  const members = [...getCircleMembers(circle.id)].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const sortedMembers = [...members].sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);
  const pendingMembership = membershipRequests.filter((r) => r.status === MembershipRequestStatus.PENDING);
  const myMembership = members.find((m) => m.userId === me.id);

  const currentTurn = cycle?.currentTurn ?? 1;
  const completedContribByUser: Record<string, number> = {};
  transactions.forEach((t) => {
    if (t.type === TransactionType.TONTINE_CONTRIBUTION && t.status === TransactionStatus.COMPLETED) {
      completedContribByUser[t.userId] = (completedContribByUser[t.userId] ?? 0) + 1;
    }
  });
  const turnCompletedCount = members.filter((m) => (completedContribByUser[m.userId] ?? 0) >= currentTurn).length;
  const turnProgress = members.length > 0 ? turnCompletedCount / members.length : 0;

  const gaugeCircumference = 2 * Math.PI * ((GAUGE_SIZE - GAUGE_STROKE) / 2);
  const gaugeDashoffset = gaugeCircumference * (1 - turnProgress);

  // Anneau de profils fermé autour de la jauge, comme un collier — la jauge
  // (le pendentif) reste au centre. Jusqu'à RING_CAPACITY membres, chacun a
  // sa place fixe sur l'anneau. Au-delà, seuls RING_CAPACITY profils sont
  // affichés à la fois : glisser (ou les flèches) fait tourner l'anneau et
  // fait apparaître/disparaître les membres, comme un chapelet qu'on tourne.
  const arcContainerSize = RING_RADIUS * 2 + ARC_AVATAR_SIZE;
  const arcCenter = arcContainerSize / 2;
  const ringVisibleCount = Math.min(members.length, RING_CAPACITY);
  const ringCanRotate = members.length > RING_CAPACITY;
  const ringNormalizedOffset = members.length > 0 ? ((ringOffset % members.length) + members.length) % members.length : 0;
  const arcPositions = Array.from({ length: ringVisibleCount }, (_, i) => {
    const m = members[(ringNormalizedOffset + i) % members.length]!;
    const angleDeg = -90 + (i * 360) / ringVisibleCount;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      member: m,
      x: arcCenter + RING_RADIUS * Math.cos(rad),
      y: arcCenter + RING_RADIUS * Math.sin(rad),
    };
  });

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
    if (t.type === TransactionType.PAYOUT) return `Cagnotte reçue par ${t.memberName} · Tour ${turn}`;
    const base = t.userId === me.id ? 'Cotisation tontine versée' : `Cotisation de ${t.memberName}`;
    return `${base} · Tour ${turn}`;
  };

  const txStatusLabel = (t: Transaction) => {
    if (t.type === TransactionType.PAYOUT) return 'Versée';
    return t.status === TransactionStatus.PENDING ? 'En attente' : t.status === TransactionStatus.FAILED ? 'Échouée' : 'Payé';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── En-tête ── */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {circle.name}
            </Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              Tontine · {isFounder ? 'Vous êtes fondateur' : `Vous êtes ${roleLabel[myMembership?.role ?? Role.MEMBER].toLowerCase()}`}
            </Text>
          </View>
          {isFounder ? (
            <IconButton
              icon={MoreVertical}
              variant="plain"
              accessibilityLabel="Options du cercle"
              onPress={() => setShowFounderMenu((v) => !v)}
            />
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {/* ── Onglets ── */}
        <View style={styles.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            <TabButton label="Aperçu" active={tab === 'apercu'} onPress={() => setTab('apercu')} />
            <TabButton label="Tour" active={tab === 'tour'} onPress={() => setTab('tour')} />
            <TabButton label="Membres" active={tab === 'membres'} onPress={() => setTab('membres')} />
            <TabButton label="Demandes" active={tab === 'demandes'} badge={pendingMembership.length} onPress={() => setTab('demandes')} />
            {isFounder && (
              <TabButton label="Gestion" active={tab === 'gestion'} onPress={() => setTab('gestion')} />
            )}
          </ScrollView>
        </View>

        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {tab === 'apercu' && (
            <View>
              {/* ── Prochain versement ── */}
              <View style={styles.dueCard}>
                <View style={styles.dueTop}>
                  <Calendar size={16} color="rgba(255,255,255,0.72)" />
                  <Text style={styles.dueLabel}>
                    Prochain versement{nextDueDays !== null ? ` · dans ${nextDueDays} jour${nextDueDays > 1 ? 's' : ''}` : ''}
                  </Text>
                </View>
                <Text style={styles.dueAmount}>{formatXOF(circle.tontineAmount)}</Text>
                <View style={styles.dueBottom}>
                  <Text style={styles.dueMeta}>
                    Tour {currentTurn} · {turnCompletedCount}/{members.length} ont cotisé
                  </Text>
                  <Button title="Payer" size="sm" variant="secondary" onPress={handlePayNow} style={styles.payBtn} />
                </View>
              </View>

              {/* ── Historique ── */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Historique</Text>
                {monthsWithActivity.length > 1 && (
                  <TouchableOpacity
                    style={[styles.filterBtn, monthFilter !== null && styles.filterBtnActive]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Filtrer par mois"
                    onPress={() => setShowMonthFilter((v) => !v)}
                  >
                    <Filter size={14} color={monthFilter !== null ? colors.primary.DEFAULT : colors.muted} />
                    <Text style={[styles.filterBtnText, monthFilter !== null && styles.filterBtnTextActive]}>
                      {monthFilter !== null ? monthLabels[monthFilter] : 'Filtrer'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {filteredTx.length === 0 && (
                <EmptyState icon={Receipt} title="Aucune opération" text="Les cotisations et cagnottes apparaîtront ici." />
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
            <View style={[styles.card, styles.tourCard]}>
              <Text style={styles.tourTitle}>Tour en cours</Text>

              <View
                style={[styles.tourRingWrap, { width: arcContainerSize, height: arcContainerSize }]}
                {...(ringCanRotate ? ringPanResponder.panHandlers : {})}
              >
                {arcPositions.map(({ member: m, x, y }) => {
                  const isMe = m.userId === me.id;
                  const isCurrentTurn = m.turnOrder === currentTurn;
                  const fullName = `${m.user.firstName} ${m.user.lastName}`;
                  const initialsText = initials(fullName);
                  const color = avatarColor(m.userId);
                  return (
                    <TouchableOpacity
                      key={m.userId}
                      activeOpacity={0.8}
                      accessibilityLabel={`Voir le profil de ${isMe ? 'Moi' : fullName}`}
                      style={[styles.tourAvatarWrap, { left: x - ARC_AVATAR_SIZE / 2, top: y - ARC_AVATAR_SIZE / 2 }]}
                      onPress={() => setViewedProfile({ name: isMe ? 'Moi' : fullName, photoUrl: m.user.avatarUrl, initials: initialsText, color })}
                    >
                      <View
                        style={[
                          styles.tourAvatar,
                          !m.user.avatarUrl && { backgroundColor: m.hasReceivedPayout ? colors.primary.soft : color },
                          isCurrentTurn && styles.tourAvatarActive,
                        ]}
                      >
                        {m.user.avatarUrl ? (
                          <Image source={{ uri: m.user.avatarUrl }} style={styles.tourAvatarImage} />
                        ) : m.hasReceivedPayout ? (
                          <Check size={18} color={colors.primary.dark} strokeWidth={3} />
                        ) : (
                          <Text style={styles.tourAvatarText}>{initialsText}</Text>
                        )}
                      </View>
                      {m.user.avatarUrl && m.hasReceivedPayout && (
                        <View style={styles.tourAvatarDoneBadge}>
                          <Check size={10} color="#FFFFFF" strokeWidth={4} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                <View
                  style={[styles.tourGaugeWrap, { left: arcCenter - GAUGE_SIZE / 2, top: arcCenter - GAUGE_SIZE / 2 }]}
                  pointerEvents="none"
                >
                  <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
                    <Circle
                      cx={GAUGE_SIZE / 2}
                      cy={GAUGE_SIZE / 2}
                      r={(GAUGE_SIZE - GAUGE_STROKE) / 2}
                      stroke={colors.line}
                      strokeWidth={GAUGE_STROKE}
                      fill="none"
                    />
                    <Circle
                      cx={GAUGE_SIZE / 2}
                      cy={GAUGE_SIZE / 2}
                      r={(GAUGE_SIZE - GAUGE_STROKE) / 2}
                      stroke={colors.accent.DEFAULT}
                      strokeWidth={GAUGE_STROKE}
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${gaugeCircumference} ${gaugeCircumference}`}
                      strokeDashoffset={gaugeDashoffset}
                      transform={`rotate(-90 ${GAUGE_SIZE / 2} ${GAUGE_SIZE / 2})`}
                    />
                  </Svg>
                  <View style={styles.tourGaugeCenter}>
                    <Text style={styles.tourGaugeLabel}>Tour</Text>
                    <Text style={styles.tourGaugeNumber}>{currentTurn}</Text>
                  </View>
                </View>
              </View>

              {ringCanRotate && (
                <View style={styles.ringNavRow}>
                  <IconButton icon={ChevronLeft} accessibilityLabel="Membres précédents" onPress={() => setRingOffset((o) => o - 1)} />
                  <Text style={styles.tourPanHint}>Faites glisser l’anneau pour voir tous les membres</Text>
                  <IconButton icon={ChevronRight} accessibilityLabel="Membres suivants" onPress={() => setRingOffset((o) => o + 1)} />
                </View>
              )}

              <View style={styles.tourProgress}>
                <Text style={styles.tourProgressText}>
                  {turnCompletedCount}/{members.length} membres ont déjà cotisé pour ce tour
                </Text>
              </View>
            </View>
          )}

          {tab === 'membres' && (
            <View>
              <Text style={styles.groupTitle}>{sortedMembers.length} membre(s)</Text>
              <View style={styles.card}>
                {sortedMembers.map((m, idx) => {
                  const badge = roleBadgeStyle[m.role];
                  const fullName = `${m.user.firstName} ${m.user.lastName}`;
                  const initialsText = initials(fullName);
                  const color = avatarColor(m.userId);
                  return (
                    <View key={m.userId} style={styles.row}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        accessibilityLabel={`Voir le profil de ${fullName}`}
                        onPress={() => setViewedProfile({ name: m.userId === me.id ? 'Moi' : fullName, photoUrl: m.user.avatarUrl, initials: initialsText, color })}
                      >
                        {m.user.avatarUrl ? (
                          <Image source={{ uri: m.user.avatarUrl }} style={styles.avatar} />
                        ) : (
                          <View style={[styles.avatar, { backgroundColor: color }]}>
                            <Text style={styles.avatarText}>{initialsText}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <View style={[styles.rowBody, idx < sortedMembers.length - 1 && styles.rowBorder]}>
                        <View style={styles.flex}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {m.user.firstName} {m.user.lastName}{m.userId === me.id ? ' (Moi)' : ''}
                          </Text>
                          <View style={styles.memberMetaRow}>
                            {badge && (
                              <View style={[styles.roleTag, { backgroundColor: badge.bg }]}>
                                <Text style={[styles.roleTagText, { color: badge.color }]}>{roleLabel[m.role]}</Text>
                              </View>
                            )}
                            <Text style={styles.rowSubInline}>Membre depuis {formatMonthYear(m.joinedAt)}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
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
                <View style={styles.stack}>
                  {pendingMembership.map((r) => (
                    <View key={r.id} style={[styles.card, styles.requestCard]}>
                      <View style={styles.requestHeaderRow}>
                        <View style={styles.requestAvatar}>
                          <Text style={styles.requestAvatarText}>{initials(r.fullName)}</Text>
                        </View>
                        <View style={styles.flex}>
                          <Text style={styles.rowTitle}>{r.fullName}</Text>
                          <Text style={styles.rowSub}>{r.phoneNumber}</Text>
                        </View>
                      </View>
                      <View style={styles.decisionRow}>
                        <Button
                          title="Refuser"
                          variant="secondary"
                          size="sm"
                          onPress={() => handleDecideMembership(r.id, false)}
                          style={styles.flex}
                        />
                        <Button
                          title="Valider"
                          size="sm"
                          onPress={() => handleDecideMembership(r.id, true)}
                          style={styles.flex}
                        />
                      </View>
                    </View>
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
                        <View style={[styles.avatar, { backgroundColor: avatarColor(m.userId) }]}>
                          <Text style={styles.avatarText}>{initials(fullName)}</Text>
                        </View>
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
              { label: 'Type', value: selectedTx.type === TransactionType.PAYOUT ? 'Cagnotte reçue' : 'Cotisation' },
              { label: 'Membre', value: selectedTx.memberName },
              { label: 'Tour', value: `Tour ${getTurnNumber(selectedTx)}` },
              ...(selectedTx.providerReference ? [{ label: 'Référence', value: selectedTx.providerReference }] : []),
              { label: 'Statut', value: txStatusLabel(selectedTx) },
              { label: 'Date', value: formatDate(selectedTx.createdAt) },
            ]}
          />
        )}

        {viewedProfile && (
          <AvatarViewerModal
            visible={!!viewedProfile}
            onClose={() => setViewedProfile(null)}
            name={viewedProfile.name}
            photoUrl={viewedProfile.photoUrl}
            initials={viewedProfile.initials}
            color={viewedProfile.color}
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

function TabButton({ label, active, badge, onPress }: { label: string; active: boolean; badge?: number; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
    >
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
      {!!badge && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
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

  /* ── En-tête ── */
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: colors.bg,
  },
  headerText: { flex: 1, alignItems: 'center' },
  headerTitle: { ...typography.headline, color: colors.ink },
  headerSub: { ...typography.caption, fontWeight: '400', color: colors.muted },
  headerSpacer: { width: 40 },

  /* ── Onglets ── */
  tabBar: {
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  tabRow: { paddingHorizontal: 12, gap: 4 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.primary.DEFAULT },
  tabBtnText: { ...typography.callout, fontWeight: '500', color: colors.muted },
  tabBtnTextActive: { color: colors.primary.DEFAULT, fontWeight: '600' },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: { fontSize: 11, lineHeight: 14, fontWeight: '700', color: '#FFFFFF' },

  contentScroll: { flex: 1, backgroundColor: colors.fill },
  scrollContent: { padding: 16, paddingBottom: 48 },

  /* ── Carte du prochain versement ── */
  dueCard: { backgroundColor: colors.primary.dark, borderRadius: 24, padding: 20 },
  dueTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dueLabel: { ...typography.footnote, color: 'rgba(255,255,255,0.72)', flexShrink: 1 },
  dueAmount: { ...typography.display, color: '#FFFFFF', marginTop: 6 },
  dueBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  dueMeta: { ...typography.footnote, color: '#FFFFFF', flex: 1 },
  payBtn: { borderWidth: 0, paddingHorizontal: 24 },

  /* ── Sections ── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: { ...typography.headline, color: colors.ink },
  groupTitle: { ...typography.footnote, fontWeight: '600', color: colors.muted, marginBottom: 8, marginLeft: 4 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  filterBtnActive: { borderColor: colors.primary.soft, backgroundColor: colors.primary.tint },
  filterBtnText: { ...typography.footnote, fontWeight: '600', color: colors.muted },
  filterBtnTextActive: { color: colors.primary.DEFAULT },
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
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { ...typography.footnote, fontWeight: '700', color: '#FFFFFF' },
  memberMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  roleTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  roleTagText: { ...typography.caption },

  /* ── Demandes et gestion ── */
  requestCard: { padding: 14, gap: 14 },
  requestHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestAvatarText: { ...typography.footnote, fontWeight: '700', color: colors.accent.deep },
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

  /* ── Tour (anneau de profils autour de la jauge) ── */
  tourCard: { alignItems: 'center', paddingTop: 16, paddingBottom: 16 },
  tourTitle: { ...typography.headline, color: colors.ink, alignSelf: 'flex-start', marginLeft: 16, marginBottom: 8 },
  tourRingWrap: { position: 'relative' },
  tourAvatarWrap: { position: 'absolute', width: ARC_AVATAR_SIZE, height: ARC_AVATAR_SIZE },
  tourAvatar: {
    width: ARC_AVATAR_SIZE,
    height: ARC_AVATAR_SIZE,
    borderRadius: ARC_AVATAR_SIZE / 2,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tourAvatarActive: { borderWidth: 3, borderColor: colors.accent.DEFAULT },
  tourAvatarImage: { width: '100%', height: '100%' },
  tourAvatarDoneBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary.DEFAULT,
    borderWidth: 2,
    borderColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourAvatarText: { ...typography.bodyStrong, color: '#FFFFFF' },
  tourGaugeWrap: { position: 'absolute', width: GAUGE_SIZE, height: GAUGE_SIZE, alignItems: 'center', justifyContent: 'center' },
  tourGaugeCenter: { position: 'absolute', alignItems: 'center' },
  tourGaugeLabel: { ...typography.footnote, color: colors.muted },
  tourGaugeNumber: { ...typography.display, color: colors.ink },
  ringNavRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 8 },
  tourPanHint: { ...typography.footnote, color: colors.muted, textAlign: 'center', flex: 1 },
  tourProgress: {
    alignSelf: 'stretch',
    marginTop: 12,
    marginHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  tourProgressText: { ...typography.callout, fontWeight: '600', color: colors.primary.DEFAULT, textAlign: 'center' },

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
