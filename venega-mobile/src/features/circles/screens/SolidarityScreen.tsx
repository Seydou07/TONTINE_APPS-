import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  X,
  Check,
  HeartHandshake,
  Wallet,
  Calendar,
  Plus,
  UserPlus,
  Filter,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import TransactionDetailModal from '../../../components/TransactionDetailModal';
import AvatarViewerModal from '../../../components/AvatarViewerModal';
import {
  getCircle,
  getCircles,
  getFounderCircleIds,
  getCurrentUser,
  getLedgerEntries,
  getSolidarityTotals,
  getSolidarityRequests,
  submitSolidarityRequest,
  getSolidarityValidators,
  getBureauDecisions,
  setBureauDecision,
  isBureauFullyApproved,
  getCircleMembers,
  getMembershipRequests,
  updateMembershipRequest,
} from '../circleStore';
import { AidRequestStatus, EventType, Role, MembershipRequestStatus } from '@venega/types';
import type { SolidarityRequest, LedgerEntry, MembershipRequest } from '@venega/types';

const eventTypeLabel: Record<EventType, string> = {
  [EventType.MALADIE]: 'Maladie',
  [EventType.HOSPITALISATION]: 'Hospitalisation',
  [EventType.MARIAGE]: 'Mariage',
  [EventType.DECES]: 'Décès',
  [EventType.NAISSANCE]: 'Naissance',
  [EventType.AUTRE]: 'Autre',
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

const monthLabels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

const initials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};

const roleLabel: Record<Role, string> = {
  [Role.PRESIDENT]: 'Présidente',
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

const avatarPalette = ['#D9A441', '#0B6E4F', '#7A4E9C', '#3182CE', '#B9852A', '#E53E3E'];
const avatarColor = (userId: string) => {
  const sum = userId.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length] ?? avatarPalette[0]!;
};

const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

type Tab = 'apercu' | 'decaissements' | 'membres' | 'demandes';

export default function SolidarityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';

  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const isFounder = getFounderCircleIds().includes(circle.id);
  const me = getCurrentUser();

  const entries = getLedgerEntries(circle.id);
  const totals = getSolidarityTotals(circle.id);
  const monthsWithActivity = [...new Set(entries.map((e) => new Date(e.createdAt).getMonth()))].sort((a, b) => a - b);

  const [tab, setTab] = useState<Tab>('apercu');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [viewedProfile, setViewedProfile] = useState<{ name: string; photoUrl?: string; initials: string; color: string } | null>(null);
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [requests, setRequests] = useState<SolidarityRequest[]>(() => getSolidarityRequests(circle.id));
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>(() => getMembershipRequests(circle.id));
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqBeneficiaryId, setReqBeneficiaryId] = useState<string | null>(null);
  const [reqEventType, setReqEventType] = useState<EventType>(EventType.MALADIE);
  const [reqReason, setReqReason] = useState('');
  const [reqAmount, setReqAmount] = useState('');

  const filteredEntries = monthFilter === null
    ? entries
    : entries.filter((e) => new Date(e.createdAt).getMonth() === monthFilter);

  const members = getCircleMembers(circle.id);
  const sortedMembers = [...members].sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);
  const validators = getSolidarityValidators(circle.id);
  const myMembership = members.find((m) => m.userId === me.id);
  const isValidator = validators.includes(me.id);
  const isTreasurer = myMembership?.role === Role.TREASURER;
  const pendingMembership = membershipRequests.filter((r) => r.status === MembershipRequestStatus.PENDING);

  const refreshRequests = () => setRequests(getSolidarityRequests(circle.id));
  const refreshMembershipRequests = () => setMembershipRequests(getMembershipRequests(circle.id));

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
      refreshMembershipRequests();
    }, [circle.id])
  );

  const handleDecideMembership = (id: string, approved: boolean) => {
    updateMembershipRequest(id, { status: approved ? MembershipRequestStatus.APPROVED : MembershipRequestStatus.REJECTED, decidedAt: new Date().toISOString() });
    refreshMembershipRequests();
  };

  const openRequestModal = () => {
    setReqBeneficiaryId(null);
    setReqEventType(EventType.MALADIE);
    setReqReason('');
    setReqAmount('');
    setShowRequestModal(true);
  };

  const handleInvite = () => {
    router.push({ pathname: '/circle/[id]/invite', params: { id: circle.id } });
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
    refreshRequests();
  };

  const handleSetDecision = (requestId: string, approved: boolean) => {
    setBureauDecision(requestId, me.id, approved);
    refreshRequests();
  };

  const handlePayNow = () => {
    router.push(`/payment?circleId=${circle.id}&amount=${circle.solidarityAmount || 5000}&type=SOLIDARITY` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête — une seule zone verte continue, du titre jusqu'au solde */}
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>Caisse de solidarité</Text>
            <TouchableOpacity style={styles.backBtn} onPress={handleInvite}>
              <UserPlus size={19} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSub}>{circle.name}</Text>

          <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.balanceBlock}>
            <Text style={styles.balanceLabel}>Solde de la caisse</Text>
            <Text style={[styles.balanceValue, totals.balance < 0 && styles.balanceValueNegative]}>
              {totals.balance < 0 ? '−' : ''}{formatXOF(Math.abs(totals.balance))}
            </Text>
            <View style={styles.balanceMetaRow}>
              <View style={styles.balanceMetaItem}>
                <View style={[styles.balanceDot, { backgroundColor: '#36E395' }]} />
                <Text style={styles.balanceMetaText}>{formatXOF(totals.totalCredits)} cotisés</Text>
              </View>
              <View style={styles.balanceMetaItem}>
                <View style={[styles.balanceDot, { backgroundColor: '#D9A441' }]} />
                <Text style={styles.balanceMetaText}>{formatXOF(totals.totalDebits)} versés</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Corps blanc */}
        <View style={styles.bodySheet}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabRow}
          >
            <TabButton label="Aperçu" active={tab === 'apercu'} onPress={() => setTab('apercu')} />
            <TabButton label="Décaissements" active={tab === 'decaissements'} onPress={() => setTab('decaissements')} />
            <TabButton label="Membres" active={tab === 'membres'} onPress={() => setTab('membres')} />
            <TabButton label="Demandes" active={tab === 'demandes'} badge={pendingMembership.length} onPress={() => setTab('demandes')} />
          </ScrollView>

          <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {tab === 'apercu' && (
              <>
                {/* ACTION RAPIDE — cotiser */}
                <Animated.View entering={FadeInDown.delay(75).duration(400)}>
                  <View style={styles.dueCard}>
                    <View style={styles.dueIconWrap}>
                      <Calendar size={18} color="#0B6E4F" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dueLabel}>Prochain versement</Text>
                      <Text style={styles.dueAmount}>{formatXOF(circle.solidarityAmount || 1000)}</Text>
                    </View>
                    <TouchableOpacity style={styles.payBtn} activeOpacity={0.88} onPress={handlePayNow}>
                      <Text style={styles.payBtnText}>Payer</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>

                {/* HISTORIQUE DES OPÉRATIONS (traces visibles par tous) */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                  <View style={styles.historyHeaderRow}>
                    <Text style={styles.historyTitle}>Historique</Text>
                    {monthsWithActivity.length > 1 && (
                      <View style={styles.filterWrap}>
                        <TouchableOpacity
                          style={styles.filterBtn}
                          activeOpacity={0.75}
                          onPress={() => setShowMonthFilter((v) => !v)}
                        >
                          <Filter size={13} color={monthFilter !== null ? '#074B36' : '#64748B'} />
                          <Text style={[styles.filterBtnText, monthFilter !== null && styles.filterBtnTextActive]}>
                            {monthFilter !== null ? monthLabels[monthFilter] : 'Filtrer'}
                          </Text>
                        </TouchableOpacity>

                        {showMonthFilter && (
                          <View style={styles.monthDropdown}>
                            <ScrollView style={styles.monthDropdownScroll} showsVerticalScrollIndicator={false}>
                              <TouchableOpacity
                                style={styles.monthDropdownItem}
                                onPress={() => { setMonthFilter(null); setVisibleCount(5); setShowMonthFilter(false); }}
                              >
                                <Text style={[styles.monthDropdownItemText, monthFilter === null && styles.monthDropdownItemTextActive]}>
                                  Tous les mois
                                </Text>
                              </TouchableOpacity>
                              {monthsWithActivity.map((mIdx) => (
                                <TouchableOpacity
                                  key={mIdx}
                                  style={styles.monthDropdownItem}
                                  onPress={() => { setMonthFilter(mIdx); setVisibleCount(5); setShowMonthFilter(false); }}
                                >
                                  <Text style={[styles.monthDropdownItemText, monthFilter === mIdx && styles.monthDropdownItemTextActive]}>
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

                  {filteredEntries.length === 0 && (
                    <Text style={styles.emptyText}>Aucune opération pour le moment.</Text>
                  )}
                  {filteredEntries.slice(0, visibleCount).map((e) => {
                    const isCredit = e.type === 'CREDIT';
                    return (
                      <TouchableOpacity
                        key={e.id}
                        activeOpacity={0.7}
                        onPress={() => setSelectedEntry(e)}
                        style={styles.entryRow}
                      >
                        <View style={styles.entryRowTop}>
                          <View style={[styles.entryIcon, isCredit ? styles.entryIconCredit : styles.entryIconDebit]}>
                            {isCredit
                              ? <ArrowUp size={16} color="#0B6E4F" />
                              : <ArrowDown size={16} color="#E53E3E" />}
                          </View>
                          <View style={styles.memberInfo}>
                            <Text style={styles.entryDesc} numberOfLines={2}>
                              {isCredit ? `Cotisation — ${e.memberName ?? ''}` : e.description}
                            </Text>
                            <Text style={styles.entryMeta}>{formatDate(e.createdAt)}</Text>
                          </View>
                          <Text style={[styles.entryAmount, isCredit ? styles.entryAmountCredit : styles.entryAmountDebit]}>
                            {isCredit ? '+' : '−'}{formatXOF(e.amount)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {filteredEntries.length > visibleCount && (
                    <TouchableOpacity
                      style={styles.seeMoreBtn}
                      activeOpacity={0.75}
                      onPress={() => setVisibleCount((n) => n + 5)}
                    >
                      <Text style={styles.seeMoreBtnText}>Voir plus</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.hintText}>
                    La caisse est transparente : chaque cotisation et chaque déboursement est tracé et visible
                    de tous les membres du cercle.
                  </Text>
                </Animated.View>
              </>
            )}

            {tab === 'decaissements' && (
              <>
                {/* DÉCAISSEMENTS — initiés par le Président, validés par les approbateurs désignés */}
                <Animated.View entering={FadeInDown.delay(75).duration(400)}>
                  <Text style={styles.sectionLabel}>Décaissements</Text>

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
              </>
            )}

            {tab === 'membres' && (
              <Animated.View entering={FadeInDown.delay(75).duration(400)}>
                <Text style={styles.sectionLabel}>{sortedMembers.length} membre(s)</Text>
                {sortedMembers.map((m, idx) => {
                  const badge = roleBadgeStyle[m.role];
                  const fullName = `${m.user.firstName} ${m.user.lastName}`;
                  const initialsText = initials(fullName);
                  const color = avatarColor(m.userId);
                  return (
                    <TouchableOpacity
                      key={m.userId}
                      activeOpacity={0.75}
                      style={[styles.memberListRow, idx === sortedMembers.length - 1 && styles.memberListRowLast]}
                      onPress={() => router.push({ pathname: '/circle/[id]/solidarity-member/[userId]', params: { id: circle.id, userId: m.userId } })}
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
                      <ChevronRight size={18} color="#CBD5E1" />
                    </TouchableOpacity>
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
          </ScrollView>
        </View>

        {isFounder && tab === 'decaissements' && (
          <TouchableOpacity style={styles.fab} activeOpacity={0.88} onPress={openRequestModal}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* INITIER UNE DEMANDE (Président uniquement) */}
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
                        style={[styles.beneficiaryChip, active && styles.beneficiaryChipActive]}
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

        {selectedEntry && (
          <TransactionDetailModal
            visible={!!selectedEntry}
            onClose={() => setSelectedEntry(null)}
            isCredit={selectedEntry.type === 'CREDIT'}
            name={selectedEntry.memberName ?? '—'}
            amount={formatXOF(selectedEntry.amount)}
            fields={[
              { label: 'Type', value: selectedEntry.type === 'CREDIT' ? 'Cotisation' : 'Aide versée' },
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
  topSection: { backgroundColor: '#074B36', paddingHorizontal: 20, paddingBottom: 30 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bodySheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 18,
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60, gap: 14 },
  balanceBlock: {
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  balanceLabel: { fontFamily: 'WorkSans', fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  balanceValue: { fontFamily: 'SoraBold', fontSize: 34, color: '#FFFFFF', letterSpacing: -0.5 },
  balanceValueNegative: { color: '#FFB4B4' },
  balanceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  balanceMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  balanceDot: { width: 6, height: 6, borderRadius: 3 },
  balanceMetaText: { fontFamily: 'WorkSans', fontSize: 11.5, color: 'rgba(255,255,255,0.75)' },
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
  historyHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  historyTitle: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#1A202C',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
  memberInfo: { flex: 1, gap: 2 },
  entryRow: {
    paddingVertical: 10,
  },
  entryRowTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  entryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryIconCredit: { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
  entryIconDebit: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  entryDesc: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, lineHeight: 17, color: '#0F172A' },
  entryMeta: { fontFamily: 'WorkSans', fontSize: 11, color: '#94A3B8', marginTop: 1 },
  entryAmount: { fontFamily: 'SoraBold', fontSize: 13.5 },
  entryAmountCredit: { color: '#0B6E4F' },
  entryAmountDebit: { color: '#E53E3E' },
  emptyRow: { padding: 20, alignItems: 'center' },
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
  seeMoreBtn: { alignSelf: 'center', paddingVertical: 10, marginTop: 4 },
  seeMoreBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#0B6E4F' },
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

  /* ── Décaissements ── */
  requestRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F3F6' },
  requestRowTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  requestCard: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 18, padding: 14, gap: 12, marginBottom: 12 },
  requestHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  requestIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FBF1DD', justifyContent: 'center', alignItems: 'center' },
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
  requestIconText: { fontFamily: 'SoraBold', fontSize: 13, color: '#B9852A' },
  approveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#FFFFFF' },

  /* ── Membres (onglet) ── */
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

  /* ── Modale : initier une demande ── */
  formOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  formSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, gap: 10 },
  formHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formTitle: { fontFamily: 'SoraBold', fontSize: 18, color: '#074B36' },
  formIntro: { fontFamily: 'WorkSans', fontSize: 12, lineHeight: 17, color: '#64748B' },
  formLabel: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#1A202C', marginTop: 10, marginBottom: 6 },
  beneficiaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  beneficiaryChip: { alignItems: 'center', gap: 5, width: 62 },
  beneficiaryChipActive: {},
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
