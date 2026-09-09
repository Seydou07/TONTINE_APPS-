import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronRight,
  Wallet,
  BellRing,
  UserCheck,
  Users,
  UserX,
  Calculator,
  Settings2,
  ShieldCheck,
  LogOut,
  X,
  Check,
  Send,
  Loader,
  CheckCircle2,
  Coins,
  UserCog,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  getCircles,
  getCircle,
  getActiveCycle,
  getCycles,
  getMembershipRequests,
  getDepartureRequests,
} from '../circleStore';
import {
  mockMemberships,
  MembershipRequestStatus,
  DepartureRequestStatus,
  CircleType,
  RefundRule,
  ReplacementRule,
  UnlockRule,
  PaymentStatus,
} from '@venega/types';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

export default function ManageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';

  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const cycle = getActiveCycle(circle) ?? getCycles(circle.id)[0];
  const memberships = mockMemberships.filter((m) => m.circleId === circle.id);

  const orderedMembers = [...memberships].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const notReceived = orderedMembers.filter((m) => !m.hasReceivedPayout);
  const beneficiary = notReceived[0] ?? orderedMembers[0];

  const pendingRequests = getMembershipRequests(circle.id).filter(
    (r) => r.status === MembershipRequestStatus.PENDING
  );
  const pendingDepartures = getDepartureRequests(circle.id).filter(
    (r) => r.status === DepartureRequestStatus.PENDING
  );
  const paidCount = orderedMembers.filter((m) => m.paymentStatus === 'PAID').length;
  const unpaidCount = Math.max(orderedMembers.length - paidCount, 0);

  const lateMembers = orderedMembers.filter((m) => m.paymentStatus !== PaymentStatus.PAID);

  const delayDaysOf = (m: (typeof orderedMembers)[number], idx: number) =>
    m.paymentStatus === PaymentStatus.LATE ? 5 + idx : 2 + idx;

  const rules = circle.rules;

  const refundLabel =
    rules?.refundRule === RefundRule.IMMEDIATE
      ? 'Remboursement immédiat'
      : rules?.refundRule === RefundRule.AT_CYCLE_END
      ? 'Attente de la fin du cycle'
      : '—';

  const replacementLabel =
    rules?.replacementRule === ReplacementRule.PAY_PAST_TURNS
      ? 'Le nouveau paie les tours passés'
      : rules?.replacementRule === ReplacementRule.REDUCED_POT
      ? 'Prise réduite des tours manqués'
      : rules?.replacementRule === ReplacementRule.NONE
      ? 'Réajustement sans remplacement'
      : '—';

  const unlockLabel =
    rules?.unlockRule === UnlockRule.ALL_APPROVERS
      ? 'Tous les approbateurs doivent valider'
      : rules?.unlockRule === UnlockRule.MAJORITY
      ? 'Majorité des approbateurs'
      : '—';

  const isAidAppeal = circle.type === CircleType.AID_APPEAL;
  const isNature = circle.type === CircleType.NATURE;

  const openPayout = () => router.push(`/circle/${circle.id}/payout` as any);

  const [showRemindModal, setShowRemindModal] = useState(false);
  const [selectedLate, setSelectedLate] = useState<Record<string, boolean>>({});
  const [remindSending, setRemindSending] = useState(false);
  const [remindSent, setRemindSent] = useState(false);

  const openRemind = () => {
    const init: Record<string, boolean> = {};
    lateMembers.forEach((m) => {
      init[m.userId] = true;
    });
    setSelectedLate(init);
    setRemindSending(false);
    setRemindSent(false);
    setShowRemindModal(true);
  };

  const selectedRemindCount = lateMembers.filter((m) => selectedLate[m.userId]).length;

  const toggleLateMember = (userId: string) => {
    setSelectedLate((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleSendReminders = () => {
    if (selectedRemindCount === 0) return;
    setRemindSending(true);
    setTimeout(() => {
      setRemindSending(false);
      setRemindSent(true);
    }, 1500);
  };

  const menuItem = (
    key: string,
    icon: any,
    title: string,
    subtitle: string,
    onPress: () => void,
    badge?: number,
    danger?: boolean,
    last?: boolean
  ) => (
    <TouchableOpacity
      key={key}
      style={[styles.menuRow, last && styles.menuRowLast]}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View style={[styles.menuIconWrap, danger ? styles.menuIconWrapDanger : styles.menuIconWrapDefault]}>
        {React.createElement(icon, { size: 19, color: danger ? '#EF4444' : '#074B36', strokeWidth: 2 })}
      </View>
      <View style={styles.menuRowInfo}>
        <Text style={[styles.menuRowTitle, danger && styles.menuRowTitleDanger]}>{title}</Text>
        <Text style={styles.menuRowSub} numberOfLines={1}>{subtitle}</Text>
      </View>
      {badge != null && badge > 0 && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <ChevronRight size={18} color="#94A3B8" />
    </TouchableOpacity>
  );

  const sectionLabel = (text: string) => (
    <Text style={styles.sectionLabel}>{text}</Text>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête */}
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Gérer le cercle</Text>
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Settings2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCircleCard}>
            <View style={styles.headerCircleInfo}>
              <Text style={styles.headerCircleName} numberOfLines={1}>{circle.name}</Text>
              <Text style={styles.headerCircleMeta}>
                {isAidAppeal
                  ? `Objectif ${formatXOF(circle.rules?.goalAmount ?? 0)}`
                  : isNature
                  ? `Objectif : ${circle.rules?.goalItem ?? '—'}`
                  : `Cotisation ${formatXOF(circle.tontineAmount || circle.solidarityAmount)}`}
                {' • '}{orderedMembers.length} membre(s)
              </Text>
            </View>
            <Image
              source={{ uri: beneficiary?.user?.avatarUrl }}
              style={styles.headerBeneficiaryAvatar}
              contentFit="cover"
            />
          </View>
        </View>

        {/* Corps crème */}
        <View style={styles.bodySheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 1. TOUR & VERSEMENTS */}
            {sectionLabel('Tour & Versements')}
            <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.menuCard}>
              {menuItem(
                'payout',
                Wallet,
                'Verser la cagnotte',
                `Bénéficiaire : ${beneficiary?.user?.firstName ?? '—'} ${beneficiary?.user?.lastName ?? ''} (Tour ${cycle?.currentTurn ?? 1})`,
                openPayout
              )}
              {menuItem(
                'remind',
                BellRing,
                'Relancer les cotisations',
                unpaidCount > 0
                  ? `${unpaidCount} membre(s) n'ont pas encore cotisé`
                  : 'Tous les membres ont cotisé',
                openRemind
              )}
            </Animated.View>

            {/* 2. MEMBRES */}
            {sectionLabel('Membres')}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.menuCard}>
              {menuItem(
                'requests',
                UserCheck,
                'Demandes d\'adhésion',
                'Approuver ou refuser les entrées',
                () => router.push(`/circle/${circle.id}/requests` as any),
                pendingRequests.length
              )}
              {menuItem(
                'departure-requests',
                UserX,
                'Demandes de départ',
                'Approuver un départ, recalculer les cagnottes',
                () => router.push(`/circle/${circle.id}/departure-requests` as any),
                pendingDepartures.length
              )}
              {menuItem(
                'replacement',
                Users,
                'Remplacer un membre',
                'Rachat des tours passés ou prise réduite',
                () => router.push(`/circle/${circle.id}/replacement` as any)
              )}
              {menuItem(
                'exclusion',
                UserX,
                'Exclure un membre',
                'Retirer un membre du cercle',
                () => router.push(`/circle/${circle.id}/exclusion` as any),
                undefined,
                false,
                true
              )}
            </Animated.View>

            {/* 2bis. BUREAU & GOUVERNANCE */}
            {sectionLabel('Bureau & Gouvernance')}
            <Animated.View entering={FadeInDown.delay(130).duration(400)} style={styles.menuCard}>
              {menuItem(
                'governance',
                UserCog,
                'Trésorier & validateurs',
                'Nommer le Trésorier, désigner qui approuve un décaissement',
                () => router.push(`/circle/${circle.id}/governance` as any)
              )}
            </Animated.View>

            {/* 3. TONTINE & CALCULS */}
            {sectionLabel('Tontine & Calculs')}
            <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.menuCard}>
              {menuItem(
                'recalculate',
                Calculator,
                'Recalcul des cotisations',
                'Réajuster les montants après un départ',
                () => router.push(`/circle/${circle.id}/recalculate` as any),
                undefined,
                false,
                true
              )}
            </Animated.View>

            {/* 3bis. CAISSE DE SOLIDARITÉ */}
            {circle.solidarityAmount > 0 && (
              <>
                {sectionLabel('Solidarité')}
                <Animated.View entering={FadeInDown.delay(170).duration(400)} style={styles.menuCard}>
                  {menuItem(
                    'solidarity',
                    Coins,
                    'Caisse de solidarité',
                    'Contributions par membre, traces et justificatifs',
                    () => router.push(`/circle/${circle.id}/solidarity` as any),
                    undefined,
                    false,
                    true
                  )}
                </Animated.View>
              </>
            )}

            {/* 4. RÈGLES DU CERCLE */}
            {sectionLabel('Règles du cercle')}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.menuCard}>
              {menuItem(
                'edit',
                Settings2,
                'Modifier le cercle',
                'Nom, conditions, règles de remplacement, adhésion',
                () => router.push(`/circle/${circle.id}/edit` as any)
              )}
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(225).duration(400)} style={styles.rulesCard}>
              <View style={styles.rulesHeaderRow}>
                <ShieldCheck size={17} color="#074B36" />
                <Text style={styles.rulesHeaderText}>Paramètres de gestion</Text>
              </View>

              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Remboursement au départ</Text>
                <Text style={styles.ruleValue}>{refundLabel}</Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Remplacement d'un membre</Text>
                <Text style={styles.ruleValue}>{replacementLabel}</Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Déblocage caisse solidarité</Text>
                <Text style={styles.ruleValue}>{unlockLabel}</Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Approbateurs requis</Text>
                <Text style={styles.ruleValue}>{rules?.approversRequired ?? 0} approbateur(s)</Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Réserve de sécurité</Text>
                <Text style={styles.ruleValue}>{rules?.reservePercent ?? 0} %</Text>
              </View>
              {isAidAppeal && (
                <View style={styles.ruleRow}>
                  <Text style={styles.ruleLabel}>Contributions publiques</Text>
                  <Text style={styles.ruleValue}>
                    {rules?.allowPublicContributions ? 'Ouvert sans adhésion' : 'Membres uniquement'}
                  </Text>
                </View>
              )}
              {isAidAppeal && rules?.minContribution ? (
                <View style={styles.ruleRow}>
                  <Text style={styles.ruleLabel}>Montant minimum</Text>
                  <Text style={styles.ruleValue}>{formatXOF(rules.minContribution)}</Text>
                </View>
              ) : null}
            </Animated.View>

            {/* 5. QUITTER */}
            <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.menuCard}>
              {menuItem(
                'departure',
                LogOut,
                'Quitter ce cercle',
                'Règles de départ et remboursement',
                () => router.push(`/circle/${circle.id}/departure` as any),
                undefined,
                true,
                true
              )}
            </Animated.View>
          </ScrollView>
        </View>

        {/* MODALE RELANCE DES COTISATIONS (reste sur la page de gestion) */}
        <Modal visible={showRemindModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              {lateMembers.length === 0 ? (
                <>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>Relancer les cotisations</Text>
                    <TouchableOpacity onPress={() => setShowRemindModal(false)}>
                      <X size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.emptyBox}>
                    <View style={styles.emptyIcon}>
                      <UserCheck size={32} color="#10B981" />
                    </View>
                    <Text style={styles.emptyTitle}>Aucun membre en retard</Text>
                    <Text style={styles.emptyText}>
                      Tous les membres ont cotisé pour le Tour {cycle?.currentTurn ?? 1}.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    activeOpacity={0.88}
                    onPress={() => setShowRemindModal(false)}
                  >
                    <Text style={styles.primaryBtnText}>Fermer</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>Relancer les cotisations</Text>
                    <TouchableOpacity onPress={() => setShowRemindModal(false)}>
                      <X size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalSub}>
                    {lateMembers.length} membre(s) en retard • Tour {cycle?.currentTurn ?? 1} — décochez
                    ceux que vous ne voulez pas relancer
                  </Text>

                  <ScrollView
                    style={styles.lateList}
                    contentContainerStyle={{ gap: 0 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {lateMembers.map((m, idx) => {
                      const isChecked = !!selectedLate[m.userId];
                      return (
                        <TouchableOpacity
                          key={m.userId}
                          style={[styles.lateRow, idx === lateMembers.length - 1 && styles.lateRowLast]}
                          activeOpacity={0.7}
                          onPress={() => toggleLateMember(m.userId)}
                        >
                          <Image source={{ uri: m.user?.avatarUrl }} style={styles.lateAvatar} contentFit="cover" />
                          <View style={styles.lateInfo}>
                            <Text style={styles.lateName}>
                              {m.user?.firstName} {m.user?.lastName}
                            </Text>
                            <Text style={styles.lateMeta}>
                              {delayDaysOf(m, idx)} jour(s) de retard • {m.user?.phoneNumber}
                            </Text>
                          </View>
                          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                            {isChecked && <Check size={14} color="#FFFFFF" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {!remindSent ? (
                    <TouchableOpacity
                      style={[
                        styles.primaryBtn,
                        (remindSending || selectedRemindCount === 0) && styles.primaryBtnDisabled,
                      ]}
                      activeOpacity={0.88}
                      onPress={handleSendReminders}
                      disabled={remindSending || selectedRemindCount === 0}
                    >
                      {remindSending ? (
                        <>
                          <Loader size={18} color="#FFFFFF" />
                          <Text style={styles.primaryBtnText}>Envoi des rappels…</Text>
                        </>
                      ) : (
                        <>
                          <Send size={18} color="#FFFFFF" />
                          <Text style={styles.primaryBtnText}>
                            Envoyer ({selectedRemindCount})
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <>
                      <View style={styles.successBanner}>
                        <CheckCircle2 size={18} color="#059669" />
                        <Text style={styles.successBannerText}>
                          Rappel envoyé à {selectedRemindCount} membre(s). Les notifications sont parties.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.primaryBtn}
                        activeOpacity={0.88}
                        onPress={() => setShowRemindModal(false)}
                      >
                        <Text style={styles.primaryBtnText}>Fermer</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
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
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 14,
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
    fontSize: 18,
    color: '#FFFFFF',
  },
  headerCircleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  headerCircleInfo: {
    flex: 1,
  },
  headerCircleName: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  headerCircleMeta: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
  },
  headerBeneficiaryAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  bodySheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  sectionLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconWrapDefault: {
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
  },
  menuIconWrapDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  menuRowInfo: {
    flex: 1,
    marginRight: 8,
  },
  menuRowTitle: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
  },
  menuRowTitleDanger: {
    color: '#EF4444',
  },
  menuRowSub: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  menuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D9A441',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 6,
  },
  menuBadgeText: {
    fontFamily: 'WorkSansBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  rulesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  rulesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  rulesHeaderText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#074B36',
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  ruleLabel: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
    flex: 1,
  },
  ruleValue: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#0F172A',
    textAlign: 'right',
    flexShrink: 1,
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
    gap: 12,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#074B36',
  },
  modalSub: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
  },
  lateList: {
    maxHeight: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  lateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  lateRowLast: {
    borderBottomWidth: 0,
  },
  lateAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  lateInfo: {
    flex: 1,
    gap: 2,
  },
  lateName: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  lateMeta: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#64748B',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#074B36',
    borderColor: '#074B36',
  },
  primaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#074B36',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 14,
    padding: 12,
  },
  successBannerText: {
    flex: 1,
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#065F46',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#0F172A',
  },
  emptyText: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
  },
});
