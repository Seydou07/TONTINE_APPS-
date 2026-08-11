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
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { mockCircles, mockCycles, mockMemberships, mockUsers } from '@venega/types';
import { Role, PaymentStatus } from '@venega/types';

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
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id;

  const circle = mockCircles.find((c) => c.id === circleId) ?? mockCircles[0];

  if (!circle) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontFamily: 'WorkSans', fontSize: 14, color: '#64748B' }}>
          Cercle introuvable
        </Text>
      </View>
    );
  }

  const cycle = mockCycles.find((c) => c.circleId === circle.id && c.isActive) ?? mockCycles.find((c) => c.circleId === circle.id);
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

  // L'utilisateur connecté est le fondateur du cercle c1 uniquement
  const isFounder = circle.id === 'c1';

  const [showAllMembers, setShowAllMembers] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<number>(cycle?.currentTurn ?? 1);

  // Modales
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState('ORANGE');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [payoutValidated, setPayoutValidated] = useState(false);

  const [simulationModal, setSimulationModal] = useState<{ visible: boolean; title: string; desc: string } | null>(null);

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

  // Validation du versement
  const handleConfirmPayout = () => {
    setShowPayoutModal(false);
    setPayoutValidated(true);
    setShowReceiptModal(true);
  };

  const handleSimulateReminder = () => {
    setSimulationModal({
      visible: true,
      title: 'Relance des cotisations',
      desc: `Un message de relance a été envoyé aux ${orderedMembers.length - paidCount} membre(s) qui n'ont pas encore cotisé pour le Tour ${cycle?.currentTurn ?? 1}.`,
    });
  };

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

  // Détails par tour
  const getMemberTurnDetails = (userId: string, memberIndex: number) => {
    const isCurrentTurn = selectedTurn === (cycle?.currentTurn ?? 1);
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
                  {/* 4 Boutons d'action circulaires style Home (Relancer, Adhésion, Remplacer, Exclure) */}
                  <View style={styles.circleQuickActionsCard}>
                    <View style={styles.circleQuickActionsRow}>
                      <TouchableOpacity
                        style={styles.circleQuickActionItem}
                        activeOpacity={0.78}
                        onPress={handleSimulateReminder}
                      >
                        <View style={[styles.circularOutlineBtn, { borderColor: '#D97706' }]}>
                          <BellRing size={22} color="#D97706" strokeWidth={2} />
                        </View>
                        <Text style={styles.circleQuickActionLabel}>Relancer</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.circleQuickActionItem}
                        activeOpacity={0.78}
                        onPress={() => router.push(`/circle/${circle.id}/requests` as any)}
                      >
                        <View style={[styles.circularOutlineBtn, { borderColor: '#06B6D4' }]}>
                          <UserCheck size={22} color="#06B6D4" strokeWidth={2} />
                        </View>
                        <Text style={styles.circleQuickActionLabel}>Adhésion</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.circleQuickActionItem}
                        activeOpacity={0.78}
                        onPress={() => router.push(`/circle/${circle.id}/replacement` as any)}
                      >
                        <View style={[styles.circularOutlineBtn, { borderColor: '#6366F1' }]}>
                          <Users size={22} color="#6366F1" strokeWidth={2} />
                        </View>
                        <Text style={styles.circleQuickActionLabel}>Remplacer</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.circleQuickActionItem}
                        activeOpacity={0.78}
                        onPress={() => router.push(`/circle/${circle.id}/exclusion` as any)}
                      >
                        <View style={[styles.circularOutlineBtn, { borderColor: '#EF4444' }]}>
                          <UserX size={22} color="#EF4444" strokeWidth={2} />
                        </View>
                        <Text style={styles.circleQuickActionLabel}>Exclure</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Ligne principale Fondateur (en-dessous) : Verser la cagnotte & Cotiser */}
                  <View style={styles.pillsMainRow}>
                    <TouchableOpacity
                      style={[styles.actionPillMain, styles.actionPillVerser, payoutValidated && styles.actionPillVerserDone]}
                      activeOpacity={0.88}
                      onPress={() => setShowPayoutModal(true)}
                    >
                      <ArrowUpRight size={18} color="#FFFFFF" />
                      <Text style={styles.actionPillMainText}>
                        {payoutValidated ? 'Versé' : 'Verser'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionPillMain, styles.actionPillCotiser]}
                      activeOpacity={0.88}
                      onPress={() => router.push(`/payment?circleId=${circle.id}&amount=${totalAmountPerMember}` as any)}
                    >
                      <Wallet size={18} color="#FFFFFF" />
                      <Text style={styles.actionPillMainText}>Cotiser</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* Vue Membre : Uniquement le bouton Cotiser (Historique disponible dans les onglets du bas) */
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
                          {isFounderRole ? 'Fondateur' : `Passage : Tour ${m.turnOrder}`} • {details.operator}
                        </Text>
                        {details.isPaid && (
                          <Text style={styles.paymentDetailsText}>
                            Payé le {details.date} à {details.time} ({details.ref})
                          </Text>
                        )}
                      </View>

                      <View style={[styles.statusTag, details.isPaid ? styles.statusTagPaid : styles.statusTagPending]}>
                        {details.isPaid ? <CheckCircle2 size={12} color="#059669" /> : <Clock size={12} color="#EF4444" />}
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

            {/* 5. BOUTON DE PARTAGE DU CODE / LIEN */}
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

        {/* MODAL DE VERSEMENT DE LA CAGNOTTE (VENTILATION 3 COMPTES) */}
        <Modal visible={showPayoutModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Versement de la cagnotte</Text>
                <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Infos Bénéficiaire du Tour */}
              <View style={styles.beneficiaryCardBox}>
                <View style={styles.beneficiaryIconWrap}>
                  <User size={20} color="#074B36" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.beneficiaryLabelText}>Bénéficiaire (Tour {cycle?.currentTurn ?? 1})</Text>
                  <Text style={styles.beneficiaryNameText}>
                    {beneficiary?.user?.firstName} {beneficiary?.user?.lastName}
                  </Text>
                  <Text style={styles.beneficiaryPhoneText}>+226 70 12 34 56 (Mobile Money)</Text>
                </View>
              </View>

              {/* Récapitulatif financierVentilation 3 comptes */}
              <View style={styles.payoutBreakdownBox}>
                <Text style={styles.breakdownHeadingText}>Ventilation du virement ({membersList.length} cotisations)</Text>

                <View style={styles.payoutRow}>
                  <Text style={styles.payoutLabelText}>1. Cagnotte Bénéficiaire (100%) :</Text>
                  <Text style={styles.payoutValGreen}>{formatXOF(beneficiaryPotAmount)}</Text>
                </View>

                <View style={styles.payoutRow}>
                  <Text style={styles.payoutLabelText}>2. Frais Fondateur net (90%) :</Text>
                  <Text style={styles.payoutValText}>{formatXOF(netFounderFees)}</Text>
                </View>

                <View style={styles.payoutRow}>
                  <Text style={styles.payoutLabelText}>3. Commission Venega (10%) :</Text>
                  <Text style={styles.payoutValText}>{formatXOF(venegaCommission)}</Text>
                </View>

                <View style={styles.payoutDivider} />

                <View style={styles.payoutRow}>
                  <Text style={styles.payoutNetLabelText}>Total collecté du tour :</Text>
                  <Text style={styles.payoutNetValText}>{formatXOF(totalGrossCollected)}</Text>
                </View>
              </View>

              {/* Choix de l'opérateur Mobile Money */}
              <Text style={styles.opSelectLabelText}>Opérateur de versement</Text>
              <View style={styles.operatorsRow}>
                {OPERATORS.map((op) => {
                  const isSelected = op.id === selectedOperator;
                  return (
                    <TouchableOpacity
                      key={op.id}
                      style={[styles.operatorCard, isSelected && styles.operatorCardSelected]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedOperator(op.id)}
                    >
                      <Image source={operatorLogos[op.id]} style={styles.operatorLogo} contentFit="contain" />
                      <Text style={[styles.opNameText, isSelected && styles.opNameTextSelected]}>
                        {op.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Boutons simples : Confirmer et Annuler */}
              <View style={styles.modalFooterButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  activeOpacity={0.8}
                  onPress={() => setShowPayoutModal(false)}
                >
                  <Text style={styles.cancelModalBtnText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmModalBtn}
                  activeOpacity={0.88}
                  onPress={handleConfirmPayout}
                >
                  <Text style={styles.confirmModalBtnText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* MODAL REÇU DE VERSEMENT EFFECTUÉ */}
        <Modal visible={showReceiptModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              <View style={styles.receiptIconCircle}>
                <CheckCircle2 size={46} color="#10B981" />
              </View>
              <Text style={styles.receiptTitleText}>Versement Effectué !</Text>

              <View style={styles.receiptBox}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Cagnotte versée :</Text>
                  <Text style={styles.receiptValGreen}>{formatXOF(beneficiaryPotAmount)}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Bénéficiaire :</Text>
                  <Text style={styles.receiptVal}>{beneficiary?.user?.firstName} {beneficiary?.user?.lastName}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Frais Fondateur :</Text>
                  <Text style={styles.receiptVal}>{formatXOF(netFounderFees)}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Commission Venega :</Text>
                  <Text style={styles.receiptVal}>{formatXOF(venegaCommission)}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Référence :</Text>
                  <Text style={styles.receiptVal}>TX-{Math.floor(100000 + Math.random() * 900000)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryPillBtnFull}
                activeOpacity={0.88}
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={styles.primaryPillBtnText}>Fermer</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

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

        {/* Modal de Simulation */}
        {simulationModal && (
          <Modal visible={simulationModal.visible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
              <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>{simulationModal.title}</Text>
                  <TouchableOpacity onPress={() => setSimulationModal(null)}>
                    <X size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSubText}>{simulationModal.desc}</Text>

                <TouchableOpacity
                  style={styles.primaryPillBtnFull}
                  onPress={() => setSimulationModal(null)}
                >
                  <Text style={styles.primaryPillBtnText}>Fermer</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>
        )}
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
    backgroundColor: '#FAF7F1',
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
    backgroundColor: '#FAF7F1',
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
    color: '#059669',
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusTagPending: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusTagText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
  },
  statusTagTextPaid: {
    color: '#059669',
  },
  statusTagTextPending: {
    color: '#EF4444',
  },
  toggleMembersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAF7F1',
  },
  toggleMembersText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#074B36',
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
    backgroundColor: '#FAF7F1',
    borderRadius: 28,
    padding: 22,
    width: '100%',
    gap: 14,
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
    color: '#059669',
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
    color: '#059669',
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
