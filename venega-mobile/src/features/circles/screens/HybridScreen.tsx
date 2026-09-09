import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image, Alert, Modal, TextInput, PanResponder } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  HeartHandshake,
  Wallet,
  Calendar,
  Plus,
  UserPlus,
  Filter,
  Settings2,
  Repeat,
  UserX,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { mockTransactions, Role, TransactionType, TransactionStatus, Frequency, MembershipRequestStatus, AidRequestStatus, EventType } from '@venega/types';
import type { Transaction, MembershipRequest, SolidarityRequest, LedgerEntry } from '@venega/types';
import TransactionDetailModal from '../../../components/TransactionDetailModal';
import AvatarViewerModal from '../../../components/AvatarViewerModal';
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
  getLedgerEntries,
  getSolidarityTotals,
  getSolidarityRequests,
  submitSolidarityRequest,
  getSolidarityValidators,
  getBureauDecisions,
  setBureauDecision,
  isBureauFullyApproved,
} from '../circleStore';

const eventTypeLabel: Record<EventType, string> = {
  [EventType.MALADIE]: 'Maladie',
  [EventType.HOSPITALISATION]: 'Hospitalisation',
  [EventType.MARIAGE]: 'Mariage',
  [EventType.DECES]: 'Décès',
  [EventType.NAISSANCE]: 'Naissance',
  [EventType.AUTRE]: 'Autre',
};

const roleLabel: Record<Role, string> = {
  [Role.PRESIDENT]: 'Président',
  [Role.TREASURER]: 'Trésorier',
  [Role.SECRETARY]: 'Secrétaire',
  [Role.MEMBER]: 'Membre',
};

const roleBadgeStyle: Partial<Record<Role, { bg: string; color: string }>> = {
  [Role.PRESIDENT]: { bg: '#FBF1DD', color: '#B9852A' },
  [Role.TREASURER]: { bg: '#E4F0EB', color: '#0B6E4F' },
  [Role.SECRETARY]: { bg: '#EBF8FF', color: '#3182CE' },
};

const rolePriority: Record<Role, number> = {
  [Role.PRESIDENT]: 0,
  [Role.TREASURER]: 1,
  [Role.SECRETARY]: 2,
  [Role.MEMBER]: 3,
};

const monthLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

const avatarPalette = ['#D9A441', '#0B6E4F', '#7A4E9C', '#3182CE', '#B9852A', '#E53E3E'];
const avatarColor = (userId: string) => {
  const sum = userId.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length] ?? avatarPalette[0]!;
};

const initials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';

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

const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

const daysUntilNextSaturday = () => {
  const today = new Date();
  const diff = (6 - today.getDay() + 7) % 7;
  return diff === 0 ? 7 : diff;
};

type Tab = 'apercu' | 'tour' | 'solidarite' | 'membres' | 'demandes' | 'gestion';

const GAUGE_SIZE = 150;
const GAUGE_STROKE = 12;
const ARC_AVATAR_SIZE = 56;
const RING_GAP = 22;
const RING_RADIUS = GAUGE_SIZE / 2 + RING_GAP + ARC_AVATAR_SIZE / 2;
const RING_CAPACITY = 10;
const RING_DRAG_STEP_PX = 34;

type MergedActivityItem = {
  id: string;
  createdAt: string;
  isCredit: boolean;
  label: string;
  amount: number;
  kind: 'tontine' | 'solidarity';
};

export default function HybridScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const isFounder = getFounderCircleIds().includes(circle.id);
  const me = getCurrentUser();
  const cycle = getActiveCycle(circle);

  const [tab, setTab] = useState<Tab>('apercu');
  const [showFounderMenu, setShowFounderMenu] = useState(false);

  const [tourMonthFilter, setTourMonthFilter] = useState<number | null>(null);
  const [showTourMonthFilter, setShowTourMonthFilter] = useState(false);
  const [tourVisibleCount, setTourVisibleCount] = useState(5);

  const [solMonthFilter, setSolMonthFilter] = useState<number | null>(null);
  const [showSolMonthFilter, setShowSolMonthFilter] = useState(false);
  const [solVisibleCount, setSolVisibleCount] = useState(5);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [viewedProfile, setViewedProfile] = useState<{ name: string; photoUrl?: string; initials: string; color: string } | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    mockTransactions.filter((t) => t.circleId === circle.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>(() => getMembershipRequests(circle.id));
  const [requests, setRequests] = useState<SolidarityRequest[]>(() => getSolidarityRequests(circle.id));
  const [, forceRender] = useState(0);
  const [turnPickerMember, setTurnPickerMember] = useState<{ userId: string; name: string } | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqBeneficiaryId, setReqBeneficiaryId] = useState<string | null>(null);
  const [reqEventType, setReqEventType] = useState<EventType>(EventType.MALADIE);
  const [reqReason, setReqReason] = useState('');
  const [reqAmount, setReqAmount] = useState('');

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
  const refreshRequests = () => setRequests(getSolidarityRequests(circle.id));

  useFocusEffect(
    useCallback(() => {
      setTransactions(
        mockTransactions.filter((t) => t.circleId === circle.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      );
      refreshMembershipRequests();
      refreshRequests();
    }, [circle.id])
  );

  const members = [...getCircleMembers(circle.id)].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const sortedMembers = [...members].sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);
  const myMembership = members.find((m) => m.userId === me.id);
  const pendingMembership = membershipRequests.filter((r) => r.status === MembershipRequestStatus.PENDING);

  const validators = getSolidarityValidators(circle.id);
  const isValidator = validators.includes(me.id);
  const isTreasurer = myMembership?.role === Role.TREASURER;
  const totals = getSolidarityTotals(circle.id);
  const entries = getLedgerEntries(circle.id);

  const currentTurn = cycle?.currentTurn ?? 1;
  const tontineTx = transactions.filter((t) => t.type === TransactionType.TONTINE_CONTRIBUTION || t.type === TransactionType.PAYOUT);
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

  const tourMonthsWithActivity = [...new Set(tontineTx.map((t) => new Date(t.createdAt).getMonth()))].sort((a, b) => a - b);
  const filteredTourTx = tourMonthFilter === null ? tontineTx : tontineTx.filter((t) => new Date(t.createdAt).getMonth() === tourMonthFilter);
  const visibleTourTx = filteredTourTx.slice(0, tourVisibleCount);
  const tourGroups: { dateLabel: string; items: Transaction[] }[] = [];
  visibleTourTx.forEach((t) => {
    const label = formatDateHeader(t.createdAt);
    const group = tourGroups.find((g) => g.dateLabel === label);
    if (group) group.items.push(t);
    else tourGroups.push({ dateLabel: label, items: [t] });
  });

  const solMonthsWithActivity = [...new Set(entries.map((e) => new Date(e.createdAt).getMonth()))].sort((a, b) => a - b);
  const filteredSolEntries = solMonthFilter === null ? entries : entries.filter((e) => new Date(e.createdAt).getMonth() === solMonthFilter);

  const nextDueDays = circle.frequency === Frequency.WEEKLY ? daysUntilNextSaturday() : null;

  const getTurnNumber = (t: Transaction) => {
    if (t.type === TransactionType.PAYOUT) {
      return members.find((m) => m.userId === t.userId)?.turnOrder ?? '—';
    }
    const sameUserContribs = tontineTx
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

  const mergedActivity: MergedActivityItem[] = [
    ...tontineTx.map((t) => ({
      id: `t-${t.id}`,
      createdAt: t.createdAt,
      isCredit: t.type !== TransactionType.PAYOUT,
      label: txLabel(t),
      amount: t.amount,
      kind: 'tontine' as const,
    })),
    ...entries.map((e) => ({
      id: `s-${e.id}`,
      createdAt: e.createdAt,
      isCredit: e.type === 'CREDIT',
      label: e.type === 'CREDIT' ? `Cotisation solidarité — ${e.memberName ?? ''}` : e.description,
      amount: e.amount,
      kind: 'solidarity' as const,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const handleOpenActivityItem = (item: MergedActivityItem) => {
    if (item.kind === 'tontine') {
      const t = tontineTx.find((x) => `t-${x.id}` === item.id);
      if (t) setSelectedTx(t);
    } else {
      const e = entries.find((x) => `s-${x.id}` === item.id);
      if (e) setSelectedEntry(e);
    }
  };

  const handleDecideMembership = (id: string, approved: boolean) => {
    updateMembershipRequest(id, { status: approved ? MembershipRequestStatus.APPROVED : MembershipRequestStatus.REJECTED, decidedAt: new Date().toISOString() });
    refreshMembershipRequests();
  };

  const handleRemoveMember = (userId: string, name: string) => {
    Alert.alert(
      'Retirer du cercle ?',
      `${name} ne fera plus partie du cercle "${circle.name}".`,
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

  const handleSettings = () => {
    setShowFounderMenu(false);
    router.push(`/circle/${circle.id}/manage` as any);
  };

  const handleInvite = () => {
    router.push({ pathname: '/circle/[id]/invite', params: { id: circle.id } });
  };

  const handlePayTontine = () => {
    router.push(`/payment?circleId=${circle.id}&amount=${circle.tontineAmount}&type=TONTINE` as any);
  };

  const handlePaySolidarity = () => {
    router.push(`/payment?circleId=${circle.id}&amount=${circle.solidarityAmount || 1000}&type=SOLIDARITY` as any);
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
    refreshRequests();
  };

  const handleSetDecision = (requestId: string, approved: boolean) => {
    setBureauDecision(requestId, me.id, approved);
    refreshRequests();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>Hybride</Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {isFounder ? 'Vous êtes Fondateur' : `Vous êtes ${roleLabel[myMembership?.role ?? Role.MEMBER]}`}
                </Text>
              </View>
            </View>
            {isFounder ? (
              <TouchableOpacity style={styles.backBtn} onPress={() => setShowFounderMenu((v) => !v)}>
                <ChevronDown size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtn} />
            )}
          </View>

          <Text style={styles.circleName} numberOfLines={2}>{circle.name}</Text>
        </View>

        {showFounderMenu && (
          <>
            <TouchableOpacity
              style={styles.founderMenuBackdrop}
              activeOpacity={1}
              onPress={() => setShowFounderMenu(false)}
            />
            <View style={styles.founderMenu}>
              <TouchableOpacity style={styles.founderMenuItem} activeOpacity={0.8} onPress={handleSettings}>
                <Settings2 size={15} color="#074B36" />
                <Text style={styles.founderMenuItemText}>Paramètres du cercle</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.bodySheet}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabRow}
          >
            <TabButton label="Aperçu" active={tab === 'apercu'} onPress={() => setTab('apercu')} />
            <TabButton label="Tour" active={tab === 'tour'} onPress={() => setTab('tour')} />
            <TabButton label="Solidarité" active={tab === 'solidarite'} onPress={() => setTab('solidarite')} />
            <TabButton label="Membres" active={tab === 'membres'} onPress={() => setTab('membres')} />
            <TabButton label="Demandes" active={tab === 'demandes'} badge={pendingMembership.length} onPress={() => setTab('demandes')} />
            {isFounder && (
              <TabButton label="Gestion" active={tab === 'gestion'} onPress={() => setTab('gestion')} />
            )}
          </ScrollView>

          <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {tab === 'apercu' && (
              <Animated.View entering={FadeInDown.delay(75).duration(400)}>
                <View style={styles.dueCard}>
                  <View style={styles.dueIconWrap}>
                    <Calendar size={18} color="#0B6E4F" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dueLabel}>
                      Cotisation tontine{nextDueDays !== null ? ` · dans ${nextDueDays} jour${nextDueDays > 1 ? 's' : ''}` : ''}
                    </Text>
                    <Text style={styles.dueAmount}>{formatXOF(circle.tontineAmount)}</Text>
                  </View>
                  <TouchableOpacity style={styles.payBtn} activeOpacity={0.88} onPress={handlePayTontine}>
                    <Text style={styles.payBtnText}>Payer</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.dueCard, { marginTop: 10 }]}>
                  <View style={styles.dueIconWrap}>
                    <HeartHandshake size={18} color="#0B6E4F" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dueLabel}>Cotisation solidarité</Text>
                    <Text style={styles.dueAmount}>{formatXOF(circle.solidarityAmount || 1000)}</Text>
                  </View>
                  <TouchableOpacity style={styles.payBtn} activeOpacity={0.88} onPress={handlePaySolidarity}>
                    <Text style={styles.payBtnText}>Payer</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statChip}>
                    <Text style={styles.statChipLabel}>Solde caisse</Text>
                    <Text style={[styles.statChipValue, totals.balance < 0 && styles.balanceValueNegative]}>
                      {totals.balance < 0 ? '−' : ''}{formatXOF(Math.abs(totals.balance))}
                    </Text>
                  </View>
                  <View style={styles.statChip}>
                    <Text style={styles.statChipLabel}>Tour en cours</Text>
                    <Text style={styles.statChipValue}>Tour {currentTurn}</Text>
                  </View>
                </View>

                <Text style={styles.historyTitle}>Activité récente</Text>
                {mergedActivity.length === 0 && (
                  <Text style={styles.emptyText}>Aucune opération pour le moment.</Text>
                )}
                {mergedActivity.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => handleOpenActivityItem(item)}
                    style={styles.txRow}
                  >
                    <View style={[styles.txIcon, item.isCredit ? styles.txIconCredit : styles.txIconPayout]}>
                      {item.isCredit
                        ? <ArrowUp size={16} color="#0B6E4F" />
                        : <ArrowDown size={16} color="#E53E3E" />}
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txDesc} numberOfLines={2}>{item.label}</Text>
                      <Text style={styles.txMeta}>
                        {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={[styles.txAmount, item.isCredit ? styles.txAmountCredit : styles.txAmountPayout]}>
                      {formatXOF(item.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}

            {tab === 'tour' && (
              <Animated.View entering={FadeInDown.delay(75).duration(400)}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.sectionLabel}>Tour en cours</Text>

                  <View style={styles.tourRingRow}>
                    {ringCanRotate && (
                      <TouchableOpacity
                        style={styles.ringNavBtn}
                        activeOpacity={0.75}
                        onPress={() => setRingOffset((o) => o - 1)}
                      >
                        <ChevronLeft size={18} color="#334155" />
                      </TouchableOpacity>
                    )}

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
                            style={[styles.tourAvatarWrap, { left: x - ARC_AVATAR_SIZE / 2, top: y - ARC_AVATAR_SIZE / 2 }]}
                            onPress={() => setViewedProfile({ name: isMe ? 'Moi' : fullName, photoUrl: m.user.avatarUrl, initials: initialsText, color })}
                          >
                            <View
                              style={[
                                styles.tourAvatar,
                                !m.user.avatarUrl && { backgroundColor: m.hasReceivedPayout ? '#36E395' : color },
                                isCurrentTurn && styles.tourAvatarActive,
                              ]}
                            >
                              {m.user.avatarUrl ? (
                                <Image source={{ uri: m.user.avatarUrl }} style={styles.tourAvatarImage} />
                              ) : m.hasReceivedPayout ? (
                                <Check size={16} color="#FFFFFF" strokeWidth={3} />
                              ) : (
                                <Text style={styles.tourAvatarText}>{initialsText}</Text>
                              )}
                              {m.user.avatarUrl && m.hasReceivedPayout && (
                                <View style={styles.tourAvatarDoneBadge}>
                                  <Check size={10} color="#FFFFFF" strokeWidth={4} />
                                </View>
                              )}
                            </View>
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
                            stroke="#E2E8F0"
                            strokeWidth={GAUGE_STROKE}
                            fill="none"
                          />
                          <Circle
                            cx={GAUGE_SIZE / 2}
                            cy={GAUGE_SIZE / 2}
                            r={(GAUGE_SIZE - GAUGE_STROKE) / 2}
                            stroke="#D9A441"
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
                      <TouchableOpacity
                        style={styles.ringNavBtn}
                        activeOpacity={0.75}
                        onPress={() => setRingOffset((o) => o + 1)}
                      >
                        <ChevronRight size={18} color="#334155" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {ringCanRotate && (
                    <Text style={styles.tourPanHint}>
                      Faites glisser l'anneau (ou utilisez les flèches) pour voir tous les membres
                    </Text>
                  )}

                  <Text style={styles.tourProgressText}>
                    {turnCompletedCount}/{members.length} membres ont déjà cotisé pour ce tour
                  </Text>
                </View>

                <View style={styles.historyHeaderRow}>
                  <Text style={styles.historyTitle}>Historique tontine</Text>
                  {tourMonthsWithActivity.length > 1 && (
                    <View style={styles.filterWrap}>
                      <TouchableOpacity
                        style={styles.filterBtn}
                        activeOpacity={0.75}
                        onPress={() => setShowTourMonthFilter((v) => !v)}
                      >
                        <Filter size={13} color={tourMonthFilter !== null ? '#074B36' : '#64748B'} />
                        <Text style={[styles.filterBtnText, tourMonthFilter !== null && styles.filterBtnTextActive]}>
                          {tourMonthFilter !== null ? monthLabels[tourMonthFilter] : 'Filtrer'}
                        </Text>
                      </TouchableOpacity>

                      {showTourMonthFilter && (
                        <View style={styles.monthDropdown}>
                          <ScrollView style={styles.monthDropdownScroll} showsVerticalScrollIndicator={false}>
                            <TouchableOpacity
                              style={styles.monthDropdownItem}
                              onPress={() => { setTourMonthFilter(null); setTourVisibleCount(5); setShowTourMonthFilter(false); }}
                            >
                              <Text style={[styles.monthDropdownItemText, tourMonthFilter === null && styles.monthDropdownItemTextActive]}>
                                Tous les mois
                              </Text>
                            </TouchableOpacity>
                            {tourMonthsWithActivity.map((mIdx) => (
                              <TouchableOpacity
                                key={mIdx}
                                style={styles.monthDropdownItem}
                                onPress={() => { setTourMonthFilter(mIdx); setTourVisibleCount(5); setShowTourMonthFilter(false); }}
                              >
                                <Text style={[styles.monthDropdownItemText, tourMonthFilter === mIdx && styles.monthDropdownItemTextActive]}>
                                  {monthLabels[mIdx]} 2026
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {filteredTourTx.length === 0 && (
                  <Text style={styles.emptyText}>Aucune opération pour le moment.</Text>
                )}

                {tourGroups.map((group) => (
                  <View key={group.dateLabel} style={{ marginBottom: 10 }}>
                    <Text style={styles.dateGroupLabel}>{group.dateLabel}</Text>
                    {group.items.map((t) => {
                      const isCredit = t.type !== TransactionType.PAYOUT;
                      return (
                        <TouchableOpacity
                          key={t.id}
                          activeOpacity={0.7}
                          onPress={() => setSelectedTx(t)}
                          style={styles.txRow}
                        >
                          <View style={[styles.txIcon, isCredit ? styles.txIconCredit : styles.txIconPayout]}>
                            {isCredit
                              ? <ArrowUp size={16} color="#0B6E4F" />
                              : <ArrowDown size={16} color="#E53E3E" />}
                          </View>
                          <View style={styles.txInfo}>
                            <Text style={styles.txDesc} numberOfLines={2}>{txLabel(t)}</Text>
                            <Text style={styles.txMeta}>
                              {new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end', gap: 2 }}>
                            <Text style={[styles.txAmount, isCredit ? styles.txAmountCredit : styles.txAmountPayout]}>
                              {formatXOF(t.amount)}
                            </Text>
                            <Text style={[styles.txStatus, t.status === TransactionStatus.PENDING && styles.txStatusPending]}>
                              {txStatusLabel(t)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}

                {filteredTourTx.length > tourVisibleCount && (
                  <TouchableOpacity
                    style={styles.seeMoreBtn}
                    activeOpacity={0.75}
                    onPress={() => setTourVisibleCount((n) => n + 5)}
                  >
                    <Text style={styles.seeMoreBtnText}>Voir plus</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}

            {tab === 'solidarite' && (
              <Animated.View entering={FadeInDown.delay(75).duration(400)}>
                <View style={styles.balanceCard}>
                  <Text style={styles.balanceCardLabel}>Solde de la caisse</Text>
                  <Text style={[styles.balanceCardValue, totals.balance < 0 && styles.balanceValueNegative]}>
                    {totals.balance < 0 ? '−' : ''}{formatXOF(Math.abs(totals.balance))}
                  </Text>
                  <View style={styles.balanceMetaRow}>
                    <View style={styles.balanceMetaItem}>
                      <View style={[styles.balanceDot, { backgroundColor: '#0B6E4F' }]} />
                      <Text style={styles.balanceMetaText}>{formatXOF(totals.totalCredits)} cotisés</Text>
                    </View>
                    <View style={styles.balanceMetaItem}>
                      <View style={[styles.balanceDot, { backgroundColor: '#D9A441' }]} />
                      <Text style={styles.balanceMetaText}>{formatXOF(totals.totalDebits)} versés</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.historyHeaderRow}>
                  <Text style={styles.historyTitle}>Historique</Text>
                  {solMonthsWithActivity.length > 1 && (
                    <View style={styles.filterWrap}>
                      <TouchableOpacity
                        style={styles.filterBtn}
                        activeOpacity={0.75}
                        onPress={() => setShowSolMonthFilter((v) => !v)}
                      >
                        <Filter size={13} color={solMonthFilter !== null ? '#074B36' : '#64748B'} />
                        <Text style={[styles.filterBtnText, solMonthFilter !== null && styles.filterBtnTextActive]}>
                          {solMonthFilter !== null ? monthLabels[solMonthFilter] : 'Filtrer'}
                        </Text>
                      </TouchableOpacity>

                      {showSolMonthFilter && (
                        <View style={styles.monthDropdown}>
                          <ScrollView style={styles.monthDropdownScroll} showsVerticalScrollIndicator={false}>
                            <TouchableOpacity
                              style={styles.monthDropdownItem}
                              onPress={() => { setSolMonthFilter(null); setSolVisibleCount(5); setShowSolMonthFilter(false); }}
                            >
                              <Text style={[styles.monthDropdownItemText, solMonthFilter === null && styles.monthDropdownItemTextActive]}>
                                Tous les mois
                              </Text>
                            </TouchableOpacity>
                            {solMonthsWithActivity.map((mIdx) => (
                              <TouchableOpacity
                                key={mIdx}
                                style={styles.monthDropdownItem}
                                onPress={() => { setSolMonthFilter(mIdx); setSolVisibleCount(5); setShowSolMonthFilter(false); }}
                              >
                                <Text style={[styles.monthDropdownItemText, solMonthFilter === mIdx && styles.monthDropdownItemTextActive]}>
                                  {monthLabels[mIdx]} 2026
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {filteredSolEntries.length === 0 && (
                  <Text style={styles.emptyText}>Aucune opération pour le moment.</Text>
                )}
                {filteredSolEntries.slice(0, solVisibleCount).map((e) => {
                  const isCredit = e.type === 'CREDIT';
                  return (
                    <TouchableOpacity
                      key={e.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedEntry(e)}
                      style={styles.txRow}
                    >
                      <View style={[styles.txIcon, isCredit ? styles.entryIconCredit : styles.entryIconDebit]}>
                        {isCredit
                          ? <ArrowUp size={16} color="#0B6E4F" />
                          : <ArrowDown size={16} color="#E53E3E" />}
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={styles.txDesc} numberOfLines={2}>
                          {isCredit ? `Cotisation — ${e.memberName ?? ''}` : e.description}
                        </Text>
                        <Text style={styles.txMeta}>{formatDate(e.createdAt)}</Text>
                      </View>
                      <Text style={[styles.txAmount, isCredit ? styles.entryAmountCredit : styles.entryAmountDebit]}>
                        {isCredit ? '+' : '−'}{formatXOF(e.amount)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {filteredSolEntries.length > solVisibleCount && (
                  <TouchableOpacity
                    style={styles.seeMoreBtn}
                    activeOpacity={0.75}
                    onPress={() => setSolVisibleCount((n) => n + 5)}
                  >
                    <Text style={styles.seeMoreBtnText}>Voir plus</Text>
                  </TouchableOpacity>
                )}

                <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Décaissements</Text>

                {!isFounder && (
                  <Text style={styles.hintText}>
                    Un événement à annoncer ? Contactez le Président du cercle — lui seul peut initier une
                    demande d'aide. Vous pouvez suivre ici l'avancement de chaque décaissement.
                  </Text>
                )}

                {requests.length === 0 && (
                  <View style={styles.listCard}>
                    <View style={styles.emptyRow}>
                      <Text style={styles.emptyText}>Aucun décaissement pour le moment.</Text>
                    </View>
                  </View>
                )}

                {requests.map((r) => {
                  const decisions = getBureauDecisions(r.id);
                  const fullyApproved = isBureauFullyApproved(circle.id, r.id);
                  const approvedCount = validators.filter((v) => decisions[v] === true).length;
                  const myDecision = decisions[me.id];
                  const isExpanded = expandedRequestId === r.id;
                  const isPendingBureau = r.status === AidRequestStatus.APPROVED;

                  return (
                    <TouchableOpacity
                      key={r.id}
                      activeOpacity={0.8}
                      onPress={() => setExpandedRequestId((prev) => (prev === r.id ? null : r.id))}
                      style={styles.requestRow}
                    >
                      <View style={styles.requestRowTop}>
                        <View style={styles.requestIconWrap}>
                          <HeartHandshake size={17} color="#B9852A" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.requestName}>{r.requesterName}</Text>
                          <Text style={styles.requestMeta}>{eventTypeLabel[r.eventType]} · {formatXOF(r.amountRequested)}</Text>
                        </View>
                        <StatusPill status={r.status} />
                      </View>

                      {isExpanded && (
                        <View style={styles.requestExpanded}>
                          <Text style={styles.requestReason}>{r.reason}</Text>

                          {isPendingBureau && validators.length === 0 && isFounder && (
                            <Text style={styles.hintText}>
                              Aucun approbateur désigné — rendez-vous dans Gestion du cercle pour en choisir.
                            </Text>
                          )}

                          {isPendingBureau && validators.length > 0 && (
                            <>
                              <View style={styles.progressRow}>
                                <View style={styles.progressTrack}>
                                  <View style={[styles.progressFill, { width: `${(approvedCount / validators.length) * 100}%` }]} />
                                </View>
                                <Text style={styles.progressText}>{approvedCount}/{validators.length} approbateurs</Text>
                              </View>

                              {isValidator && (
                                <View style={styles.decisionRow}>
                                  <TouchableOpacity
                                    style={[styles.decisionBtn, myDecision === false && styles.decisionBtnRejectActive]}
                                    activeOpacity={0.8}
                                    onPress={() => handleSetDecision(r.id, false)}
                                  >
                                    <X size={16} color={myDecision === false ? '#FFFFFF' : '#E53E3E'} />
                                    <Text style={[styles.decisionBtnText, myDecision === false && styles.decisionBtnTextActive]}>
                                      Désapprouver
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[styles.decisionBtn, myDecision === true && styles.decisionBtnApproveActive]}
                                    activeOpacity={0.8}
                                    onPress={() => handleSetDecision(r.id, true)}
                                  >
                                    <Check size={16} color={myDecision === true ? '#FFFFFF' : '#0B6E4F'} strokeWidth={3} />
                                    <Text style={[styles.decisionBtnText, myDecision === true && styles.decisionBtnTextActive]}>
                                      Approuver
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}

                              {isTreasurer && (
                                <TouchableOpacity
                                  style={[styles.disburseBtn, !fullyApproved && styles.disburseBtnDisabled]}
                                  activeOpacity={0.85}
                                  disabled={!fullyApproved}
                                  onPress={() => router.push({ pathname: '/circle/[id]/solidarity-disburse/[requestId]', params: { id: circle.id, requestId: r.id } })}
                                >
                                  <Wallet size={15} color="#FFFFFF" />
                                  <Text style={styles.disburseBtnText}>
                                    {fullyApproved ? 'Décaisser' : 'En attente des approbateurs'}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>
            )}

            {tab === 'membres' && (
              <Animated.View entering={FadeInDown.delay(75).duration(400)}>
                <TouchableOpacity style={styles.inviteRow} activeOpacity={0.85} onPress={handleInvite}>
                  <UserPlus size={16} color="#074B36" />
                  <Text style={styles.inviteRowText}>Inviter un membre</Text>
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>{sortedMembers.length} membre(s)</Text>
                {sortedMembers.map((m, idx) => {
                  const badge = roleBadgeStyle[m.role];
                  const fullName = `${m.user.firstName} ${m.user.lastName}`;
                  const initialsText = initials(fullName);
                  const color = avatarColor(m.userId);
                  return (
                    <View
                      key={m.userId}
                      style={[styles.memberListRow, idx === sortedMembers.length - 1 && styles.memberListRowLast]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setViewedProfile({ name: m.userId === me.id ? 'Moi' : fullName, photoUrl: m.user.avatarUrl, initials: initialsText, color })}
                      >
                        {m.user.avatarUrl ? (
                          <Image source={{ uri: m.user.avatarUrl }} style={styles.memberListAvatar} />
                        ) : (
                          <View style={[styles.memberListAvatar, { backgroundColor: color }]}>
                            <Text style={styles.memberListAvatarText}>{initialsText}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberListName} numberOfLines={1}>
                          {m.user.firstName} {m.user.lastName}{m.userId === me.id ? ' (Moi)' : ''}
                        </Text>
                        <View style={styles.memberListMetaRow}>
                          {badge && (
                            <View style={[styles.roleBadgeTag, { backgroundColor: badge.bg }]}>
                              <Text style={[styles.roleBadgeTagText, { color: badge.color }]}>{roleLabel[m.role]}</Text>
                            </View>
                          )}
                          <Text style={styles.memberListSince}>Membre depuis {formatMonthYear(m.joinedAt)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </Animated.View>
            )}

            {tab === 'demandes' && (
              <Animated.View entering={FadeInDown.delay(75).duration(400)}>
                <Text style={styles.sectionLabel}>Demandes d'adhésion</Text>
                {pendingMembership.length === 0 ? (
                  <View style={styles.listCard}>
                    <View style={styles.emptyRow}>
                      <Text style={styles.emptyText}>Aucune demande d'adhésion en attente.</Text>
                    </View>
                  </View>
                ) : (
                  pendingMembership.map((r) => (
                    <View key={r.id} style={styles.requestCard}>
                      <View style={styles.requestHeaderRow}>
                        <View style={styles.requestIconWrap}>
                          <Text style={styles.requestIconText}>{initials(r.fullName)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.requestName}>{r.fullName}</Text>
                          <Text style={styles.requestMeta}>{r.phoneNumber}</Text>
                        </View>
                      </View>
                      <View style={styles.decisionRow}>
                        <TouchableOpacity style={styles.decisionBtn} activeOpacity={0.85} onPress={() => handleDecideMembership(r.id, false)}>
                          <Text style={styles.decisionBtnText}>Refuser</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.approveBtn} activeOpacity={0.85} onPress={() => handleDecideMembership(r.id, true)}>
                          <Text style={styles.approveBtnText}>Valider l'adhésion</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </Animated.View>
            )}

            {tab === 'gestion' && isFounder && (
              <Animated.View entering={FadeInDown.delay(75).duration(400)}>
                <Text style={styles.sectionLabel}>Gestion des membres</Text>
                {sortedMembers.map((m, idx) => {
                  const fullName = `${m.user.firstName} ${m.user.lastName}`;
                  return (
                    <View
                      key={m.userId}
                      style={[styles.gestionMemberCard, idx === sortedMembers.length - 1 && { marginBottom: 0 }]}
                    >
                      <View style={styles.gestionMemberRow}>
                        <View style={[styles.memberListAvatar, { backgroundColor: avatarColor(m.userId) }]}>
                          <Text style={styles.memberListAvatarText}>{initials(fullName)}</Text>
                        </View>
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberListName} numberOfLines={1}>
                            {fullName}{m.userId === me.id ? ' (Moi)' : ''}
                          </Text>
                          <Text style={styles.memberListSince}>Tour {m.turnOrder ?? '—'}</Text>
                        </View>
                      </View>
                      {m.userId !== me.id && (
                        <View style={styles.gestionActionRow}>
                          <TouchableOpacity
                            style={styles.gestionActionBtn}
                            activeOpacity={0.85}
                            onPress={() => setTurnPickerMember({ userId: m.userId, name: fullName })}
                          >
                            <Repeat size={14} color="#334155" />
                            <Text style={styles.gestionActionBtnText}>Changer le tour</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.gestionActionBtn, styles.gestionActionBtnDanger]}
                            activeOpacity={0.85}
                            onPress={() => handleRemoveMember(m.userId, fullName)}
                          >
                            <UserX size={14} color="#E53E3E" />
                            <Text style={[styles.gestionActionBtnText, styles.gestionActionBtnTextDanger]}>Retirer</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}

                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Paramètres</Text>
                <TouchableOpacity style={styles.gestionSettingsRow} activeOpacity={0.8} onPress={handleOpenSettings}>
                  <Settings2 size={17} color="#074B36" />
                  <Text style={styles.gestionSettingsText}>Reparamétrer le cercle</Text>
                  <ChevronRight size={18} color="#CBD5E1" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </ScrollView>
        </View>

        {isFounder && tab === 'solidarite' && (
          <TouchableOpacity style={styles.fab} activeOpacity={0.88} onPress={openRequestModal}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <Modal visible={showRequestModal} animationType="slide" transparent={true}>
          <View style={styles.formOverlay}>
            <View style={styles.formSheet}>
              <View style={styles.formHeaderRow}>
                <Text style={styles.formTitle}>Initier une demande</Text>
                <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.formIntro}>
                À utiliser une fois le membre contacté et son événement connu — la demande part directement
                en validation auprès des approbateurs désignés.
              </Text>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.formLabel}>Membre concerné</Text>
                <View style={styles.beneficiaryRow}>
                  {members.map((m) => {
                    const active = reqBeneficiaryId === m.userId;
                    return (
                      <TouchableOpacity
                        key={m.userId}
                        style={styles.beneficiaryChip}
                        activeOpacity={0.8}
                        onPress={() => setReqBeneficiaryId(m.userId)}
                      >
                        <View style={[styles.beneficiaryAvatar, active && styles.beneficiaryAvatarActive]}>
                          <Text style={[styles.beneficiaryAvatarText, active && styles.beneficiaryAvatarTextActive]}>
                            {initials(`${m.user.firstName} ${m.user.lastName}`)}
                          </Text>
                        </View>
                        <Text style={[styles.beneficiaryChipText, active && styles.beneficiaryChipTextActive]} numberOfLines={1}>
                          {m.user.firstName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.formLabel}>Type d'événement</Text>
                <View style={styles.eventTypeRow}>
                  {Object.values(EventType).map((et) => (
                    <TouchableOpacity
                      key={et}
                      style={[styles.eventTypeChip, reqEventType === et && styles.eventTypeChipActive]}
                      onPress={() => setReqEventType(et)}
                    >
                      <Text style={[styles.eventTypeChipText, reqEventType === et && styles.eventTypeChipTextActive]}>
                        {eventTypeLabel[et]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.formLabel}>Motif de la demande</Text>
                <TextInput
                  style={styles.formInputMultiline}
                  placeholder="Expliquez brièvement la situation aux membres du cercle…"
                  placeholderTextColor="#94A3B8"
                  value={reqReason}
                  onChangeText={setReqReason}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.formLabel}>Montant à décaisser (F CFA)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex : 45000"
                  placeholderTextColor="#94A3B8"
                  value={reqAmount}
                  onChangeText={setReqAmount}
                  keyboardType="numeric"
                />
              </ScrollView>

              <TouchableOpacity
                style={[styles.formSubmitBtn, (!reqBeneficiaryId || !reqReason.trim() || !reqAmount) && styles.formSubmitBtnDisabled]}
                activeOpacity={0.88}
                disabled={!reqBeneficiaryId || !reqReason.trim() || !reqAmount}
                onPress={handleSubmitRequest}
              >
                <Text style={styles.formSubmitBtnText}>Envoyer aux approbateurs</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {selectedTx && (
          <TransactionDetailModal
            visible={!!selectedTx}
            onClose={() => setSelectedTx(null)}
            isCredit={selectedTx.type !== TransactionType.PAYOUT}
            name={selectedTx.memberName}
            amount={formatXOF(selectedTx.amount)}
            fields={[
              { label: 'Type', value: selectedTx.type === TransactionType.PAYOUT ? 'Cagnotte reçue' : 'Cotisation tontine' },
              { label: 'Membre', value: selectedTx.memberName },
              { label: 'Tour', value: `Tour ${getTurnNumber(selectedTx)}` },
              ...(selectedTx.providerReference ? [{ label: 'Référence', value: selectedTx.providerReference }] : []),
              { label: 'Statut', value: txStatusLabel(selectedTx) },
              { label: 'Date', value: formatDate(selectedTx.createdAt) },
            ]}
          />
        )}

        {selectedEntry && (
          <TransactionDetailModal
            visible={!!selectedEntry}
            onClose={() => setSelectedEntry(null)}
            isCredit={selectedEntry.type === 'CREDIT'}
            name={selectedEntry.memberName ?? '—'}
            amount={formatXOF(selectedEntry.amount)}
            fields={[
              { label: 'Type', value: selectedEntry.type === 'CREDIT' ? 'Cotisation solidarité' : 'Aide versée' },
              { label: 'Membre', value: selectedEntry.memberName ?? '—' },
              ...(selectedEntry.reason ? [{ label: 'Motif', value: selectedEntry.reason }] : []),
              { label: 'Statut', value: selectedEntry.type === 'CREDIT' ? 'Confirmée' : 'Justifié' },
              { label: 'Date', value: formatDate(selectedEntry.createdAt) },
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

        <Modal visible={!!turnPickerMember} animationType="fade" transparent onRequestClose={() => setTurnPickerMember(null)}>
          <View style={styles.turnPickerOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setTurnPickerMember(null)} />
            <View style={styles.turnPickerCard}>
              <Text style={styles.turnPickerTitle}>Nouveau tour pour {turnPickerMember?.name}</Text>
              <Text style={styles.turnPickerSubtitle}>La personne qui occupe déjà ce tour prendra sa place actuelle.</Text>
              <View style={styles.turnPickerGrid}>
                {members.map((m) => (
                  <TouchableOpacity
                    key={m.userId}
                    style={styles.turnPickerItem}
                    activeOpacity={0.8}
                    onPress={() => handlePickTurn(m.turnOrder ?? 1)}
                  >
                    <Text style={styles.turnPickerItemText}>{m.turnOrder}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.turnPickerCancel} activeOpacity={0.8} onPress={() => setTurnPickerMember(null)}>
                <Text style={styles.turnPickerCancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

function TabButton({ label, active, badge, onPress }: { label: string; active: boolean; badge?: number; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      activeOpacity={0.75}
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

function StatusPill({ status }: { status: AidRequestStatus }) {
  const meta: Record<AidRequestStatus, { label: string; bg: string; color: string }> = {
    [AidRequestStatus.PENDING]: { label: 'En attente', bg: '#FBF1DD', color: '#B9852A' },
    [AidRequestStatus.VOTING]: { label: 'En attente', bg: '#FBF1DD', color: '#B9852A' },
    [AidRequestStatus.APPROVED]: { label: 'À valider', bg: '#FBF1DD', color: '#B9852A' },
    [AidRequestStatus.REJECTED]: { label: 'Rejetée', bg: '#FFECEC', color: '#E53E3E' },
    [AidRequestStatus.DISBURSED]: { label: 'Décaissée', bg: '#E4F0EB', color: '#0B6E4F' },
  };
  const m = meta[status];
  return (
    <View style={[pillStyles.pill, { backgroundColor: m.bg }]}>
      <Text style={[pillStyles.pillText, { color: m.color }]}>{m.label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  pillText: { fontFamily: 'WorkSansSemiBold', fontSize: 10.5 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#074B36' },
  topSection: { backgroundColor: '#074B36', paddingHorizontal: 20, paddingBottom: 24 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: { flexDirection: 'row', gap: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)' },
  typeBadgeText: { fontFamily: 'WorkSansSemiBold', fontSize: 11.5, color: '#FFFFFF' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)' },
  roleBadgeText: { fontFamily: 'WorkSansSemiBold', fontSize: 11.5, color: '#FFFFFF' },
  circleName: {
    fontFamily: 'SoraBold',
    fontSize: 21,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  founderMenuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 },
  founderMenu: {
    position: 'absolute',
    top: 58,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 190,
    zIndex: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  founderMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14 },
  founderMenuItemText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#1A202C' },
  bodySheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 20,
  },
  tabScroll: { flexGrow: 0, flexShrink: 0 },
  contentScroll: { flex: 1 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: { backgroundColor: '#074B36', borderColor: '#074B36' },
  tabBtnText: { fontFamily: 'WorkSansMedium', fontSize: 12, color: '#64748B' },
  tabBtnTextActive: { color: '#FFFFFF', fontFamily: 'WorkSansSemiBold' },
  tabBadge: { minWidth: 15, height: 15, borderRadius: 8, backgroundColor: '#E53E3E', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  tabBadgeText: { fontFamily: 'WorkSansBold', fontSize: 9, color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
  dueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
  },
  dueIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E4F0EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dueLabel: { fontFamily: 'WorkSans', fontSize: 12, color: '#94A3B8' },
  dueAmount: { fontFamily: 'SoraBold', fontSize: 17, color: '#1A202C', marginTop: 2 },
  payBtn: { backgroundColor: '#D9A441', borderRadius: 13, paddingHorizontal: 18, paddingVertical: 11 },
  payBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#0F172A' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 22 },
  statChip: { flex: 1, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, padding: 12 },
  statChipLabel: { fontFamily: 'WorkSans', fontSize: 11, color: '#94A3B8' },
  statChipValue: { fontFamily: 'SoraBold', fontSize: 15, color: '#1A202C', marginTop: 3 },
  balanceValueNegative: { color: '#E53E3E' },
  historyHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  historyTitle: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#1A202C',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  filterWrap: { zIndex: 20 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 8 },
  filterBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#64748B' },
  filterBtnTextActive: { color: '#074B36' },
  monthDropdown: {
    position: 'absolute',
    top: 34,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 4,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  monthDropdownScroll: { maxHeight: 240 },
  monthDropdownItem: { paddingVertical: 10, paddingHorizontal: 14 },
  monthDropdownItemText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#334155' },
  monthDropdownItemTextActive: { color: '#074B36' },
  emptyText: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#64748B' },
  hintText: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    lineHeight: 16,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  dateGroupLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 6,
  },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 11 },
  txIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  txIconCredit: { backgroundColor: 'rgba(49, 130, 206, 0.12)' },
  txIconPayout: { backgroundColor: 'rgba(185, 133, 42, 0.12)' },
  entryIconCredit: { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
  entryIconDebit: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  txInfo: { flex: 1, gap: 2 },
  txDesc: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, lineHeight: 17, color: '#0F172A' },
  txMeta: { fontFamily: 'WorkSans', fontSize: 11, color: '#94A3B8' },
  txAmount: { fontFamily: 'SoraBold', fontSize: 13.5 },
  txAmountCredit: { color: '#0B6E4F' },
  txAmountPayout: { color: '#E53E3E' },
  entryAmountCredit: { color: '#0B6E4F' },
  entryAmountDebit: { color: '#E53E3E' },
  txStatus: { fontFamily: 'WorkSansSemiBold', fontSize: 10.5, color: '#0B6E4F' },
  txStatusPending: { color: '#B9852A' },
  seeMoreBtn: { alignSelf: 'center', paddingVertical: 12, marginTop: 4 },
  seeMoreBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#0B6E4F' },

  sectionLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  emptyRow: { padding: 20, alignItems: 'center' },
  memberInfo: { flex: 1, gap: 2 },

  /* ── Solidarité : carte de solde ── */
  balanceCard: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 18, padding: 16, marginBottom: 20 },
  balanceCardLabel: { fontFamily: 'WorkSans', fontSize: 12, color: '#94A3B8' },
  balanceCardValue: { fontFamily: 'SoraBold', fontSize: 26, color: '#1A202C', marginTop: 4 },
  balanceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  balanceMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  balanceDot: { width: 6, height: 6, borderRadius: 3 },
  balanceMetaText: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#64748B' },

  /* ── Tour (anneau de profils autour de la jauge) ── */
  tourRingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ringNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F3F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourRingWrap: { position: 'relative', marginBottom: 16 },
  tourAvatarWrap: { position: 'absolute' },
  tourAvatar: {
    width: ARC_AVATAR_SIZE,
    height: ARC_AVATAR_SIZE,
    borderRadius: ARC_AVATAR_SIZE / 2,
    backgroundColor: '#E4F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tourAvatarActive: { borderWidth: 3.5, borderColor: '#D9A441' },
  tourAvatarImage: { width: '100%', height: '100%' },
  tourAvatarDoneBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#36E395',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  tourAvatarText: { fontFamily: 'SoraBold', fontSize: 16, color: '#FFFFFF' },
  tourGaugeWrap: { position: 'absolute', width: GAUGE_SIZE, height: GAUGE_SIZE, alignItems: 'center', justifyContent: 'center' },
  tourGaugeCenter: { position: 'absolute', alignItems: 'center' },
  tourGaugeLabel: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4 },
  tourGaugeNumber: { fontFamily: 'SoraBold', fontSize: 36, color: '#1A202C', marginTop: 2 },
  tourProgressText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#0B6E4F', textAlign: 'center' },
  tourPanHint: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#94A3B8', textAlign: 'center', marginTop: 4, marginBottom: 10 },

  /* ── Décaissements ── */
  requestRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F3F6' },
  requestRowTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  requestCard: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 18, padding: 14, gap: 12, marginBottom: 12 },
  requestHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  requestIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FBF1DD', justifyContent: 'center', alignItems: 'center' },
  requestIconText: { fontFamily: 'SoraBold', fontSize: 13, color: '#B9852A' },
  requestName: { fontFamily: 'SoraBold', fontSize: 13.5, color: '#0F172A' },
  requestMeta: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#94A3B8', marginTop: 1 },
  requestExpanded: { marginTop: 10, marginLeft: 47, gap: 12 },
  requestReason: { fontFamily: 'WorkSans', fontSize: 12.5, lineHeight: 18, color: '#475569' },
  progressRow: { gap: 6 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#F1F3F6', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0B6E4F' },
  progressText: { fontFamily: 'WorkSansSemiBold', fontSize: 11, color: '#94A3B8' },
  decisionRow: { flexDirection: 'row', gap: 8 },
  decisionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  decisionBtnApproveActive: { backgroundColor: '#0B6E4F', borderColor: '#0B6E4F' },
  decisionBtnRejectActive: { backgroundColor: '#E53E3E', borderColor: '#E53E3E' },
  decisionBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#334155' },
  decisionBtnTextActive: { color: '#FFFFFF' },
  disburseBtn: { flexDirection: 'row', gap: 7, height: 42, borderRadius: 12, backgroundColor: '#0B6E4F', justifyContent: 'center', alignItems: 'center' },
  disburseBtnDisabled: { backgroundColor: '#CBD5E1' },
  disburseBtnText: { fontFamily: 'SoraBold', fontSize: 12.5, color: '#FFFFFF' },
  approveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#FFFFFF' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#074B36',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },

  /* ── Membres (onglet) ── */
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inviteRowText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#074B36' },
  memberListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F6',
    gap: 12,
  },
  memberListRowLast: { borderBottomWidth: 0 },
  memberListAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  memberListAvatarText: { fontFamily: 'SoraBold', fontSize: 13, color: '#FFFFFF' },
  memberListName: { fontFamily: 'SoraBold', fontSize: 14, color: '#0F172A' },
  memberListMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 3 },
  roleBadgeTag: { paddingHorizontal: 9, paddingVertical: 2.5, borderRadius: 7 },
  roleBadgeTagText: { fontFamily: 'WorkSansSemiBold', fontSize: 10.5 },
  memberListSince: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#94A3B8' },

  /* ── Gestion (onglet, fondateur uniquement) ── */
  gestionMemberCard: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  gestionMemberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gestionActionRow: { flexDirection: 'row', gap: 8 },
  gestionActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  gestionActionBtnDanger: { borderColor: '#FBD5D5' },
  gestionActionBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#334155' },
  gestionActionBtnTextDanger: { color: '#E53E3E' },
  gestionSettingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  gestionSettingsText: { flex: 1, fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#1A202C' },

  /* ── Sélecteur de tour (modale) ── */
  turnPickerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: 24 },
  turnPickerCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, gap: 14 },
  turnPickerTitle: { fontFamily: 'SoraBold', fontSize: 15.5, color: '#1A202C' },
  turnPickerSubtitle: { fontFamily: 'WorkSans', fontSize: 12, color: '#64748B', marginTop: -8 },
  turnPickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  turnPickerItem: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  turnPickerItemText: { fontFamily: 'SoraBold', fontSize: 15, color: '#074B36' },
  turnPickerCancel: { alignSelf: 'center', paddingVertical: 8, marginTop: 4 },
  turnPickerCancelText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#64748B' },

  /* ── Modale : initier une demande ── */
  formOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  formSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, gap: 10 },
  formHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formTitle: { fontFamily: 'SoraBold', fontSize: 18, color: '#074B36' },
  formIntro: { fontFamily: 'WorkSans', fontSize: 12, lineHeight: 17, color: '#64748B' },
  formLabel: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#1A202C', marginTop: 10, marginBottom: 6 },
  beneficiaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  beneficiaryChip: { alignItems: 'center', gap: 5, width: 62 },
  beneficiaryAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  beneficiaryAvatarActive: { backgroundColor: '#074B36', borderColor: '#074B36' },
  beneficiaryAvatarText: { fontFamily: 'SoraBold', fontSize: 14, color: '#074B36' },
  beneficiaryAvatarTextActive: { color: '#FFFFFF' },
  beneficiaryChipText: { fontFamily: 'WorkSans', fontSize: 11, color: '#64748B' },
  beneficiaryChipTextActive: { fontFamily: 'WorkSansSemiBold', color: '#074B36' },
  eventTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  eventTypeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0' },
  eventTypeChipActive: { backgroundColor: '#074B36', borderColor: '#074B36' },
  eventTypeChipText: { fontFamily: 'WorkSansMedium', fontSize: 12, color: '#64748B' },
  eventTypeChipTextActive: { color: '#FFFFFF', fontFamily: 'WorkSansSemiBold' },
  formInputMultiline: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, padding: 12, fontFamily: 'WorkSans', fontSize: 13, color: '#0F172A', minHeight: 80, textAlignVertical: 'top' },
  formInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, height: 48, paddingHorizontal: 14, fontFamily: 'WorkSans', fontSize: 13.5, color: '#0F172A' },
  formSubmitBtn: { height: 52, borderRadius: 14, backgroundColor: '#074B36', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  formSubmitBtnDisabled: { backgroundColor: '#CBD5E1' },
  formSubmitBtnText: { fontFamily: 'SoraBold', fontSize: 14.5, color: '#FFFFFF' },
});
