import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  LayoutChangeEvent,
  Modal,
  Linking,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Check,
  UserPlus,
  Wallet,
  Users,
  BadgeCheck,
  Clock,
  CheckCircle2,
  History,
  Crown,
  ChevronDown,
  ChevronUp,
  BellRing,
  UserCheck,
  UserX,
  X,
  Copy,
  MessageCircle,
  Send,
  Share2,
  ArrowUpRight,
  User,
  ShieldCheck,
  Building2,
  Coins,
  ArrowDownLeft,
  CircleDollarSign,
  Settings2,
  ChevronRight,
  Phone,
  Loader,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  cancelAnimation,
  FadeInDown,
} from 'react-native-reanimated';
import {
  getCircle,
  getCircles,
  getActiveCycle,
  getCycles,
  getFounderCircleIds,
} from '../circleStore';
import { mockMemberships, mockUsers, mockCurrentUser, mockTransactions } from '@venega/types';
import { Role, PaymentStatus, TransactionType, TransactionStatus, PaymentMethod, CircleType } from '@venega/types';

const WHEEL_SIZE = 240;
const CENTER_SIZE = 120;
const AVATAR_SIZE = 42;
const AVATAR_RADIUS = 98;

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

// Logos opérateurs réels pour le versement
const operatorLogos: Record<string, any> = {
  ORANGE: require('../../../../assets/operators/orange.png'),
  MOOV: require('../../../../assets/operators/moov.png'),
  WAVE: require('../../../../assets/operators/wave.png'),
};

const OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money', color: '#FF7900' },
  { id: 'MOOV', name: 'Moov Africa', color: '#005CA9' },
  { id: 'WAVE', name: 'Wave', color: '#1DC3F6' },
];

export default function CircleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; action?: string }>();
  const circleId = params.id;
  const action = params.action;

  const circle = getCircle(circleId) ?? getCircles()[0];

  if (!circle) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontFamily: 'WorkSans', fontSize: 14, color: '#64748B' }}>
          Cercle introuvable
        </Text>
      </View>
    );
  }

  if (circle.type === CircleType.SOLIDARITY_ONLY) {
    return <Redirect href={`/circle/${circle.id}/solidarity` as any} />;
  }

  if (circle.type === CircleType.TONTINE_ONLY) {
    return <Redirect href={`/circle/${circle.id}/tontine` as any} />;
  }

  if (circle.type === CircleType.HYBRID) {
    return <Redirect href={`/circle/${circle.id}/hybrid` as any} />;
  }

  const cycle = getActiveCycle(circle) ?? getCycles(circle.id)[0];
  const memberships = mockMemberships.filter((m) => m.circleId === circle.id);

  const [membersList, setMembersList] = useState(
    memberships.length > 0
      ? memberships
      : mockUsers.slice(0, Math.min(circle.memberCount, 8)).map((u, idx) => ({
          userId: u.id,
          circleId: circle.id,
          role: idx === 0 ? Role.PRESIDENT : Role.MEMBER,
          turnOrder: idx + 1,
          paymentStatus: idx === 0 || idx === 1 ? PaymentStatus.PAID : PaymentStatus.PENDING,
          joinedAt: '',
          user: u,
          reliabilityScore: 88,
          hasReceivedPayout: idx < 2,
          hasDeposit: true,
        }))
  );

  // L'utilisateur connecté est le fondateur des cercles de sa liste
  const isFounder = getFounderCircleIds().includes(circle.id);

  const [showAllMembers, setShowAllMembers] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<number>(cycle?.currentTurn ?? 1);

  // Modales
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const orderedMembers = [...membersList].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const notReceived = orderedMembers.filter((m) => !m.hasReceivedPayout);
  const beneficiary = notReceived[0] ?? orderedMembers[0];

  const displayedMembers = showAllMembers ? orderedMembers : orderedMembers.slice(0, 3);
  const inviteCode = circle.inviteCode || 'VENE2026';
  const inviteLink = `https://venega.app/join/${inviteCode}`;

  const stepAngle = 360 / Math.max(orderedMembers.length, 1);
  const paidCount = orderedMembers.filter((m) => m.paymentStatus === PaymentStatus.PAID).length;

  // Modèle financier exact :
  // Cotisation tontine de base (ex: 10 000 F) + Frais de gestion fondateur (ex: 500 F)
  const baseTontineAmount = circle.tontineAmount || 10000;
  const founderManagementFeePerTurn = circle.managementFee || 500;
  const totalAmountPerMember = baseTontineAmount + founderManagementFeePerTurn;

  // Total collecté pour le tour (ex: 6 x 10 500 = 63 000 F)
  const totalGrossCollected = totalAmountPerMember * membersList.length;
  // 1. Cagnotte bénéficiaire (ex: 6 x 10 000 = 60 000 F)
  const beneficiaryPotAmount = baseTontineAmount * membersList.length;
  // 2. Frais totaux récoltés (ex: 6 x 500 = 3 000 F)
  const totalFounderFeesCollected = founderManagementFeePerTurn * membersList.length;
  // 3. Commission Venega (10% sur les frais du fondateur = 300 F)
  const venegaCommission = Math.round(totalFounderFeesCollected * 0.10);
  // 4. Frais net du Fondateur (90% des frais = 2 700 F)
  const netFounderFees = totalFounderFeesCollected - venegaCommission;

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Rejoins notre cercle "${circle.name}" sur Venega ! Code: ${inviteCode} \nLien: ${inviteLink}`);
    Linking.openURL(`whatsapp://send?text=${text}`).catch(() => {
      Alert.alert('Partage', `Lien d'invitation : ${inviteLink}`);
    });
  };

  const handleShareSMS = () => {
    const text = encodeURIComponent(`Rejoins mon cercle Venega "${circle.name}" avec le code ${inviteCode} : ${inviteLink}`);
    Linking.openURL(`sms:?body=${text}`).catch(() => {
      Alert.alert('Partage', `Code : ${inviteCode}`);
    });
  };

  const handleShareNative = async () => {
    try {
      await Share.share({
        message: `Rejoins mon cercle Venega "${circle.name}" !\nCode : ${inviteCode}\nLien : ${inviteLink}`,
      });
    } catch (e) {}
  };

  // Historique personnel de l'utilisateur connecté dans ce cercle
  const myTxns = mockTransactions
    .filter((t) => t.circleId === circle.id && t.userId === mockCurrentUser.id && !!t.paymentMethod)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const myPaid = myTxns.filter((t) => t.type === TransactionType.TONTINE_CONTRIBUTION || t.type === TransactionType.SOLIDARITY_CONTRIBUTION);
  const myReceived = myTxns.filter((t) => t.type === TransactionType.PAYOUT);
  const totalPaid = myPaid.reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalReceived = myReceived.reduce((s, t) => s + (t.amount ?? 0), 0);

  const paymentMethodLabel = (m?: PaymentMethod) =>
    m === PaymentMethod.ORANGE_MONEY ? 'Orange Money'
    : m === PaymentMethod.MOOV_MONEY ? 'Moov Money'
    : m === PaymentMethod.WAVE ? 'Wave'
    : m === PaymentMethod.MTN_MOBILE_MONEY ? 'MTN MoMo'
    : 'Mobile Money';

  // Détails par tour
  const getMemberTurnDetails = (userId: string, memberIndex: number) => {    const isCurrentTurn = selectedTurn === (cycle?.currentTurn ?? 1);
    if (isCurrentTurn) {
      const isPaid = membersList.find((m) => m.userId === userId)?.paymentStatus === PaymentStatus.PAID;
      return {
        isPaid,
        date: isPaid ? '11/08/2026' : '—',
        time: isPaid ? '10:15' : '—',
        ref: isPaid ? `PAY-${884900 + memberIndex * 13}` : '—',
        operator: memberIndex % 2 === 0 ? 'Orange Money' : 'Moov Africa',
      };
    } else {
      return {
        isPaid: true,
        date: selectedTurn === 1 ? '01/06/2026' : '01/07/2026',
        time: `09:${15 + memberIndex * 10}`,
        ref: `PAY-${774200 + selectedTurn * 100 + memberIndex}`,
        operator: memberIndex % 2 === 0 ? 'Orange Money' : 'Moov Africa',
      };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert émeraude */}
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <MarqueeTitle text={circle.name} />
            </View>
            <TouchableOpacity style={styles.shareHeaderBtn} onPress={() => setShowInviteModal(true)}>
              <UserPlus size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerMetaRow}>
            <View style={styles.typeBadgeTag}>
              <Text style={styles.typeBadgeTagText}>
                {(circle.type as string) === 'HYBRID' ? 'Hybride' : (circle.type as string) === 'NATURE' ? 'Nature' : (circle.type as string) === 'TONTINE_ONLY' ? 'Tontine' : 'Solidarité'}
              </Text>
            </View>
            {isFounder && (
              <View style={styles.creatorBadgeTag}>
                <Crown size={12} color="#074B36" />
                <Text style={styles.creatorBadgeTagText}>Fondateur</Text>
              </View>
            )}
          </View>
        </View>

        {/* Corps emboîté fond crème */}
        <View style={styles.formCardSheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* 1. LA ROUE DU TOUR ACTUEL EST TOUT EN HAUT */}
            <View style={styles.wheelWrap}>
              <Text style={styles.sectionHeading}>Tour actuel de rotation</Text>
              <View style={styles.wheel}>
                <View style={styles.wheelCenter}>
                  <Text style={styles.centerLabel}>BÉNÉFICIAIRE</Text>
                  <Text style={styles.centerName} numberOfLines={1}>
                    {beneficiary?.user?.firstName ?? '—'}
                  </Text>
                  <Text style={styles.centerCycle}>
                    Tour {cycle?.currentTurn ?? 1} / {membersList.length}
                  </Text>
                </View>

                {orderedMembers.map((member, index) => {
                  const angle = (index * stepAngle - 90) * (Math.PI / 180);
                  const cx = WHEEL_SIZE / 2 + AVATAR_RADIUS * Math.cos(angle);
                  const cy = WHEEL_SIZE / 2 + AVATAR_RADIUS * Math.sin(angle);
                  const isBeneficiary = member.userId === beneficiary?.userId;
                  const hasReceived = member.hasReceivedPayout;

                  return (
                    <WheelAvatar
                      key={member.userId}
                      avatarUrl={member.user?.avatarUrl}
                      cx={cx}
                      cy={cy}
                      index={index}
                      isBeneficiary={isBeneficiary}
                      hasReceived={hasReceived}
                    />
                  );
                })}
              </View>

              {/* Légende de la roue */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#36E395' }]} />
                  <Text style={styles.legendText}>Bénéficiaire du tour</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#D9A441' }]} />
                  <Text style={styles.legendText}>Déjà servi</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
                  <Text style={styles.legendText}>En attente</Text>
                </View>
              </View>
            </View>

            {/* 2. BOUTONS D'ACTION DIRECTEMENT SOUS LA ROUE DU CERCLE */}
            <View style={styles.actionPillsSection}>
              {isFounder ? (
                <>
                  {/* Menu Gestion du cercle (unique) — toutes les actions admin */}
                  <View style={styles.circleQuickActionsCard}>
                    <TouchableOpacity
                      style={styles.manageCircleBtn}
                      activeOpacity={0.82}
                      onPress={() => router.push(`/circle/${circle.id}/manage` as any)}
                    >
                      <View style={styles.manageCircleIconWrap}>
                        <Settings2 size={20} color="#FFFFFF" strokeWidth={2} />
                      </View>
                      <View style={styles.manageCircleInfo}>
                        <Text style={styles.manageCircleTitle}>Gérer le cercle</Text>
                        <Text style={styles.manageCircleSub}>
                          Versements, membres, adhésions, règles⬦
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#074B36" />
                    </TouchableOpacity>
                  </View>

                  {/* Cotiser (le fondateur cotise aussi) */}
                  <View style={styles.pillsMainRow}>
                    <TouchableOpacity
                      style={[styles.actionPillMain, styles.actionPillCotiser]}
                      activeOpacity={0.88}
                      onPress={() => router.push(`/payment?circleId=${circle.id}&amount=${totalAmountPerMember}` as any)}
                    >
                      <Wallet size={18} color="#FFFFFF" />
                      <Text style={styles.actionPillMainText}>Cotiser ({formatXOF(totalAmountPerMember)})</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* Vue Membre : bouton Cotiser + accès à la caisse de solidarité (si le cercle en a une) */
                <View style={styles.pillsMainRow}>
                  <TouchableOpacity
                    style={[styles.actionPillMain, styles.actionPillCotiser, { flex: 1 }]}
                    activeOpacity={0.88}
                    onPress={() => router.push(`/payment?circleId=${circle.id}&amount=${totalAmountPerMember}` as any)}
                  >
                    <Wallet size={18} color="#FFFFFF" />
                    <Text style={styles.actionPillMainText}>Cotiser ({formatXOF(totalAmountPerMember)})</Text>
                  </TouchableOpacity>
                </View>
              )}
              {circle.solidarityAmount > 0 && (
                <View style={styles.pillsMainRow}>
                  <TouchableOpacity
                    style={[styles.actionPillMain, styles.actionPillSolidarity, { flex: 1 }]}
                    activeOpacity={0.88}
                    onPress={() => router.push(`/circle/${circle.id}/solidarity` as any)}
                  >
                    <Coins size={18} color="#FFFFFF" />
                    <Text style={styles.actionPillMainText}>Caisse de solidarité</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 4. HISTORIQUE DES COTISATIONS PAR TOUR */}
            <View style={styles.historySection}>
              <View style={styles.historyHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <History size={18} color="#074B36" />
                  <Text style={styles.sectionHeadingNoMargin}>Historique des cotisations</Text>
                </View>

                <View style={styles.turnsTabRow}>
                  {[1, 2, 3].map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.turnTabBtn, selectedTurn === t && styles.turnTabBtnActive]}
                      onPress={() => setSelectedTurn(t)}
                    >
                      <Text style={[styles.turnTabBtnText, selectedTurn === t && styles.turnTabBtnTextActive]}>
                        Tour {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.membersListCard}>
                {displayedMembers.map((m, idx) => {
                  const details = getMemberTurnDetails(m.userId, idx);
                  const isFounderRole = m.role === Role.PRESIDENT;
                  const memberName = `${m.user?.firstName} ${m.user?.lastName}`;

                  return (
                    <View
                      key={m.userId}
                      style={[styles.memberRow, idx === displayedMembers.length - 1 && styles.memberRowLast]}
                    >
                      <Image
                        source={{ uri: m.user?.avatarUrl }}
                        style={styles.memberAvatar}
                        contentFit="cover"
                      />
                      <View style={styles.memberInfoCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={styles.memberNameText}>{memberName}</Text>
                          {m.user?.kycStatus === 'VERIFIED' && (
                            <BadgeCheck size={14} color="#10B981" />
                          )}
                        </View>
                        <Text style={styles.memberRoleText}>
                          {isFounderRole ? 'Fondateur' : `Passage : Tour ${m.turnOrder}`} ⬢ {details.operator}
                        </Text>
                        {details.isPaid && (
                          <Text style={styles.paymentDetailsText}>
                            Payé le {details.date} à {details.time} ({details.ref})
                          </Text>
                        )}
                      </View>

                      <View style={[styles.statusTag, details.isPaid ? styles.statusTagPaid : styles.statusTagPending]}>
                        {details.isPaid ? <CheckCircle2 size={12} color="#0B6E4F" /> : <Clock size={12} color="#E53E3E" />}
                        <Text style={[styles.statusTagText, details.isPaid ? styles.statusTagTextPaid : styles.statusTagTextPending]}>
                          {details.isPaid ? formatXOF(totalAmountPerMember) : 'En attente'}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {orderedMembers.length > 3 && (
                  <TouchableOpacity
                    style={styles.toggleMembersBtn}
                    onPress={() => setShowAllMembers(!showAllMembers)}
                  >
                    <Text style={styles.toggleMembersText}>
                      {showAllMembers
                        ? 'Réduire la liste'
                        : `Voir les ${orderedMembers.length - 3} autres membres`}
                    </Text>
                    {showAllMembers ? <ChevronUp size={16} color="#074B36" /> : <ChevronDown size={16} color="#074B36" />}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 5. MES TRANSACTIONS (paiements + réceptions de l'utilisateur connecté) */}
            <View style={styles.historySection}>
              <View style={styles.historyHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CircleDollarSign size={18} color="#074B36" />
                  <Text style={styles.sectionHeadingNoMargin}>Mes transactions</Text>
                </View>
              </View>

              <View style={styles.myTxnSummaryRow}>
                <View style={styles.myTxnSummaryCard}>
                  <Text style={styles.myTxnSummaryLabel}>Total cotisé</Text>
                  <Text style={styles.myTxnSummaryVal}>{formatXOF(totalPaid)}</Text>
                  <Text style={styles.myTxnSummarySub}>{myPaid.length} paiement(s)</Text>
                </View>
                <View style={styles.myTxnSummaryCard}>
                  <Text style={styles.myTxnSummaryLabel}>Total reçu</Text>
                  <Text style={[styles.myTxnSummaryVal, { color: '#E53E3E' }]}>{formatXOF(totalReceived)}</Text>
                  <Text style={styles.myTxnSummarySub}>{myReceived.length} cagnotte(s)</Text>
                </View>
              </View>

              <View style={styles.membersListCard}>
                {myTxns.length === 0 && (
                  <View style={styles.myTxnEmptyBox}>
                    <Text style={styles.myTxnEmptyText}>
                      Aucune transaction pour vous dans ce cercle pour le moment.
                    </Text>
                  </View>
                )}
                {myTxns.map((t, idx) => {
                  const isReceived = t.type === TransactionType.PAYOUT;
                  const label = isReceived
                    ? 'Cagnotte reçue'
                    : t.type === TransactionType.SOLIDARITY_CONTRIBUTION
                    ? 'Cotisation solidarité'
                    : 'Cotisation tontine';
                  const date = new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                  return (
                    <View
                      key={t.id}
                      style={[styles.memberRow, idx === myTxns.length - 1 && styles.memberRowLast]}
                    >
                      <View style={[styles.myTxnIconWrap, isReceived ? styles.myTxnIconWrapReceived : styles.myTxnIconWrapPaid]}>
                        {isReceived
                          ? <ArrowDownLeft size={17} color="#E53E3E" />
                          : <ArrowUpRight size={17} color="#0B6E4F" />}
                      </View>
                      <View style={styles.memberInfoCol}>
                        <Text style={styles.memberNameText}>{label}</Text>
                        <Text style={styles.memberRoleText}>
                          {date} ⬢ {paymentMethodLabel(t.paymentMethod)}
                        </Text>
                        {t.providerReference && (
                          <Text style={styles.paymentDetailsText}>
                            Réf. {t.providerReference}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.myTxnAmountText, isReceived ? styles.myTxnAmountReceived : styles.myTxnAmountPaid]}>
                        {isReceived ? '−' : '+'}{formatXOF(t.amount ?? 0)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 6. BOUTON DE PARTAGE DU CODE / LIEN */}
            <TouchableOpacity style={styles.inviteLinkBtn} activeOpacity={0.8} onPress={() => setShowInviteModal(true)}>
              <UserPlus size={18} color="#074B36" />
              <Text style={styles.inviteLinkText}>Partager le cercle ({inviteCode})</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* BOUTON FLOTTANT DE CHAT DU CERCLE (FAB MESSAGE) EN BAS À DROITE */}
          <TouchableOpacity
            style={styles.floatingChatFab}
            activeOpacity={0.88}
            onPress={() => router.push(`/circle/${circle.id}/chat` as any)}
          >
            <MessageCircle size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* MODAL D'INVITATION AVEC SEULEMENT LES ICÔNES DE PARTAGE */}
        <Modal visible={showInviteModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Inviter des membres</Text>
                <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.inviteRowItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inviteItemLabel}>Code du cercle</Text>
                  <Text style={styles.inviteItemValCode}>{inviteCode}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.iconCopyBtn, copiedCode && styles.iconCopyBtnDone]}
                  onPress={handleCopyCode}
                  activeOpacity={0.8}
                >
                  {copiedCode ? <Check size={18} color="#FFFFFF" /> : <Copy size={18} color="#074B36" />}
                </TouchableOpacity>
              </View>

              <View style={styles.inviteRowItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inviteItemLabel}>Lien d'invitation</Text>
                  <Text style={styles.inviteItemValLink} numberOfLines={1}>{inviteLink}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.iconCopyBtn, copiedLink && styles.iconCopyBtnDone]}
                  onPress={handleCopyLink}
                  activeOpacity={0.8}
                >
                  {copiedLink ? <Check size={18} color="#FFFFFF" /> : <Copy size={18} color="#074B36" />}
                </TouchableOpacity>
              </View>

              {/* Icônes de partage directes : WhatsApp, SMS, Partage natif (Facebook, etc.) */}
              <View style={styles.iconOnlyShareRow}>
                <TouchableOpacity style={[styles.iconShareSquare, { backgroundColor: '#25D366' }]} onPress={handleShareWhatsApp}>
                  <MessageCircle size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.iconShareSquare, { backgroundColor: '#0084FF' }]} onPress={handleShareSMS}>
                  <Send size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.iconShareSquare, { backgroundColor: '#074B36' }]} onPress={handleShareNative}>
                  <Share2 size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

/** Marquee auto-scroll pour les titres longs */
function MarqueeTitle({ text }: { text: string }) {
  const translateX = useSharedValue(0);
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const onTextLayout = useCallback((e: LayoutChangeEvent) => {
    setTextWidth(e.nativeEvent.layout.width);
  }, []);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const needsScroll = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    if (!needsScroll) {
      translateX.value = 0;
      return;
    }

    const overflow = textWidth - containerWidth + 12;
    const scrollDuration = Math.max(overflow * 25, 2000);

    translateX.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(-overflow, { duration: scrollDuration, easing: Easing.linear }),
          withDelay(1200, withTiming(0, { duration: scrollDuration, easing: Easing.linear })),
          withDelay(1500, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      )
    );

    return () => {
      cancelAnimation(translateX);
    };
  }, [needsScroll, textWidth, containerWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ flex: 1, overflow: 'hidden', justifyContent: 'center' }} onLayout={onContainerLayout}>
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'center' }, animatedStyle]}>
        <Text
          style={[styles.headerTitle, { textAlign: 'left' }]}
          onLayout={onTextLayout}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}

function WheelAvatar({
  avatarUrl,
  cx,
  cy,
  index,
  isBeneficiary,
  hasReceived,
}: {
  avatarUrl?: string;
  cx: number;
  cy: number;
  index: number;
  isBeneficiary: boolean;
  hasReceived: boolean;
}) {
  const progress = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 60,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })
    );
    if (isBeneficiary) {
      halo.value = withRepeat(
        withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
        -1,
        false
      );
    }
  }, []);

  const avatarStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 0.5, 1], [0, 1.15, 1]);
    return {
      opacity: progress.value,
      transform: [
        { translateX: cx - AVATAR_SIZE / 2 },
        { translateY: cy - AVATAR_SIZE / 2 },
        { scale },
      ],
    };
  });

  const haloStyle = useAnimatedStyle(() => ({
    opacity: (1 - halo.value) * 0.7,
    transform: [
      { translateX: cx - AVATAR_SIZE / 2 },
      { translateY: cy - AVATAR_SIZE / 2 },
      { scale: 1 + halo.value * 0.45 },
    ],
  }));

  const borderColor = isBeneficiary ? '#36E395' : hasReceived ? '#D9A441' : '#FFFFFF';

  return (
    <>
      {isBeneficiary && <Animated.View pointerEvents="none" style={[styles.haloRing, haloStyle]} />}
      <Animated.View style={[styles.avatarWrap, { borderColor }, avatarStyle]}>
        <Image source={{ uri: avatarUrl }} style={styles.avatarImg} contentFit="cover" />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
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
  shareHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: 10,
    height: 28,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  typeBadgeTag: {
    backgroundColor: 'rgba(54, 227, 149, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeBadgeTagText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#36E395',
  },
  creatorBadgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  creatorBadgeTagText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
    color: '#074B36',
  },
  formCardSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 70,
    gap: 16,
  },
  wheelWrap: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#074B36',
    marginBottom: 12,
  },
  sectionHeadingNoMargin: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#074B36',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    marginVertical: 10,
  },
  wheelCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -CENTER_SIZE / 2,
    marginTop: -CENTER_SIZE / 2,
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  centerLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 9.5,
    color: '#64748B',
    letterSpacing: 0.8,
  },
  centerName: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#074B36',
    marginTop: 2,
  },
  centerCycle: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
    color: '#0B6E4F',
    marginTop: 2,
  },
  avatarWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImg: {
    width: AVATAR_SIZE - 5,
    height: AVATAR_SIZE - 5,
    borderRadius: (AVATAR_SIZE - 5) / 2,
  },
  haloRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: '#36E395',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
    paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#64748B',
  },
  circleQuickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: -18,
    zIndex: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  circleQuickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  circleQuickActionItem: {
    alignItems: 'center',
    gap: 6,
  },
  circularOutlineBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  circleQuickActionLabel: {
    fontFamily: 'WorkSansMedium',
    fontSize: 12,
    color: '#0F172A',
  },
  manageCircleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  manageCircleIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  manageCircleInfo: {
    flex: 1,
  },
  manageCircleTitle: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#0F172A',
  },
  manageCircleSub: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  actionPillsSection: {
    gap: 10,
    marginVertical: 4,
  },
  pillsMainRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPillMain: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionPillVerser: {
    backgroundColor: '#074B36',
  },
  actionPillVerserDone: {
    backgroundColor: '#10B981',
  },
  actionPillCotiser: {
    backgroundColor: '#074B36',
  },
  actionPillSolidarity: {
    backgroundColor: '#059669',
  },
  actionPillSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionPillMainText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  pillsAdminScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 10,
    paddingVertical: 2,
  },
  actionPillSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  actionPillDanger: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  actionPillSubText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#074B36',
  },
  historySection: {
    gap: 10,
  },
  historyHeaderRow: {
    gap: 8,
  },
  turnsTabRow: {
    flexDirection: 'row',
    gap: 6,
  },
  turnTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  turnTabBtnActive: {
    backgroundColor: '#074B36',
    borderColor: '#074B36',
  },
  turnTabBtnText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 11.5,
    color: '#64748B',
  },
  turnTabBtnTextActive: {
    color: '#FFFFFF',
    fontFamily: 'WorkSansSemiBold',
  },
  membersListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  memberRowLast: {
    borderBottomWidth: 0,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  memberInfoCol: {
    flex: 1,
  },
  memberNameText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
  },
  memberRoleText: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  paymentDetailsText: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#0B6E4F',
    marginTop: 2,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusTagPaid: {
    backgroundColor: 'rgba(11, 110, 79, 0.1)',
  },
  statusTagPending: {
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
  },
  statusTagText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
  },
  statusTagTextPaid: {
    color: '#0B6E4F',
  },
  statusTagTextPending: {
    color: '#E53E3E',
  },
  toggleMembersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  toggleMembersText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#074B36',
  },
  myTxnSummaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  myTxnSummaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  myTxnSummaryLabel: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
  },
  myTxnSummaryVal: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#074B36',
    marginTop: 2,
  },
  myTxnSummarySub: {
    fontFamily: 'WorkSans',
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  myTxnIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  myTxnIconWrapReceived: {
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
  },
  myTxnIconWrapPaid: {
    backgroundColor: 'rgba(7, 75, 54, 0.1)',
  },
  myTxnAmountText: {
    fontFamily: 'SoraBold',
    fontSize: 13,
  },
  myTxnAmountReceived: {
    color: '#E53E3E',
  },
  myTxnAmountPaid: {
    color: '#0B6E4F',
  },
  myTxnEmptyBox: {
    padding: 20,
    alignItems: 'center',
  },
  myTxnEmptyText: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  inviteLinkBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  inviteLinkText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#074B36',
  },
  floatingChatFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    width: '100%',
    maxHeight: '88%',
  },
  modalScrollBody: {
    flexGrow: 0,
  },
  modalScrollContent: {
    gap: 14,
    paddingBottom: 4,
  },
  simpleBenefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  simpleBenefAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  ussdCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 12,
  },
  ussdCodeText: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#074B36',
    letterSpacing: 1,
  },
  copyBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBtnDone: {
    backgroundColor: '#10B981',
  },
  armedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(217, 164, 65, 0.12)',
    borderRadius: 14,
    padding: 12,
  },
  armedBannerText: {
    flex: 1,
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#B47818',
  },
  dialBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#074B36',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dialBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#074B36',
  },
  checkPaymentBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkPaymentBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  paidNoticeBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 12,
    gap: 6,
  },
  paidNoticeLine: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    lineHeight: 18,
    color: '#0F172A',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#074B36',
  },
  modalSubText: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  beneficiaryCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  beneficiaryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beneficiaryLabelText: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#64748B',
  },
  beneficiaryNameText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#0F172A',
  },
  beneficiaryPhoneText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#074B36',
    marginTop: 1,
  },
  payoutBreakdownBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  breakdownHeadingText: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#074B36',
    marginBottom: 2,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutLabelText: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
  },
  payoutValText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#0F172A',
  },
  payoutValGreen: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#E53E3E',
  },
  payoutDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  payoutNetLabelText: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#074B36',
  },
  payoutNetValText: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#074B36',
  },
  opSelectLabelText: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#0F172A',
    marginTop: 2,
  },
  operatorsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  operatorCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  operatorCardSelected: {
    borderColor: '#074B36',
    backgroundColor: 'rgba(7, 75, 54, 0.05)',
  },
  operatorLogo: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  opNameText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  opNameTextSelected: {
    fontFamily: 'WorkSansBold',
    color: '#074B36',
  },
  modalFooterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelModalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#64748B',
  },
  confirmModalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  receiptIconCircle: {
    alignSelf: 'center',
    marginBottom: 4,
  },
  receiptTitleText: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: '#074B36',
    textAlign: 'center',
  },
  receiptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
  },
  receiptVal: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#0F172A',
  },
  receiptValGreen: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#E53E3E',
  },
  inviteRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  inviteItemLabel: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
  },
  inviteItemValCode: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#074B36',
    letterSpacing: 1.5,
    marginTop: 1,
  },
  inviteItemValLink: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#074B36',
    marginTop: 1,
  },
  iconCopyBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCopyBtnDone: {
    backgroundColor: '#10B981',
  },
  iconOnlyShareRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 6,
  },
  iconShareSquare: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryPillBtnFull: {
    height: 48,
    backgroundColor: '#074B36',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  primaryPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
});
