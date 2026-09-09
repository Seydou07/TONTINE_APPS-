import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  HeartHandshake,
  CalendarDays,
  Users,
  ShieldCheck,
  Check,
  X,
  Wallet,
  Eye,
  EyeOff,
  User,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  mockAidAppeal,
  mockAidContributions,
  PaymentMethod,
  ContributorVisibility,
} from '@venega/types';

const PAGE_SIZE = 15;
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

const OPERATORS = [
  { id: PaymentMethod.ORANGE_MONEY, name: 'Orange Money', color: '#FF7900', short: 'OM' },
  { id: PaymentMethod.MOOV_MONEY, name: 'Moov Money', color: '#005CA9', short: 'Moov' },
  { id: PaymentMethod.WAVE, name: 'Wave', color: '#1DC3F6', short: 'Wave' },
  { id: PaymentMethod.MTN_MOBILE_MONEY, name: 'MTN MoMo', color: '#FFCC00', short: 'MTN' },
];

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

export default function AidAppealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const appeal = mockAidAppeal;

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showContribute, setShowContribute] = useState(false);
  const [contributed, setContributed] = useState(false);
  const [localCollected, setLocalCollected] = useState(0);

  // Formulaire de contribution (sans compte)
  const [anonymous, setAnonymous] = useState(false);
  const [contributorName, setContributorName] = useState('');
  const [contributorPhone, setContributorPhone] = useState('');
  const [amount, setAmount] = useState(2000);
  const [operator, setOperator] = useState<PaymentMethod>(PaymentMethod.ORANGE_MONEY);

  const goal = appeal.goalAmount;
  const collected = appeal.collectedAmount + localCollected;
  const progress = Math.min(collected / goal, 1);
  const remaining = Math.max(goal - collected, 0);

  const visibleContributions = mockAidContributions.slice(0, visibleCount);
  const hasMore = visibleCount < mockAidContributions.length;
  const totalContributors = appeal.contributorCount + (contributed ? 1 : 0);

  const deadlineLabel = appeal.deadline
    ? new Date(appeal.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  const handleContribute = () => {
    setShowContribute(false);
    setContributed(true);
    setLocalCollected((prev) => prev + amount);
  };

  const amountDisplay = (n: number) =>
    new Intl.NumberFormat('fr-FR').format(n) + ' F';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C2D12" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête */}
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>Appel à l'aide</Text>
            <View style={styles.backBtnPlaceholder} />
          </View>
        </View>

        {/* Corps crème */}
        <View style={styles.bodySheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Carte bénéficiaire */}
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <Image
                  source={{ uri: appeal.beneficiaryPhoto }}
                  style={styles.heroAvatar}
                  contentFit="cover"
                />
                <View style={styles.heroInfo}>
                  <Text style={styles.heroName}>{appeal.beneficiaryName}</Text>
                  <Text style={styles.heroMeta}>Bénéficiaire • {appeal.beneficiaryNumber}</Text>
                </View>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>En cours</Text>
                </View>
              </View>

              <Text style={styles.reasonText}>{appeal.reason}</Text>

              {/* Progression */}
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressGoalText}>{formatXOF(collected)}</Text>
                <Text style={styles.progressRemainingText}>Objectif {formatXOF(goal)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
              <View style={styles.progressFooterRow}>
                <Text style={styles.progressPctText}>{Math.round(progress * 100)}% atteint</Text>
                <Text style={styles.progressRemainingText}>{remaining > 0 ? `Reste ${formatXOF(remaining)}` : 'Objectif atteint'}</Text>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Users size={16} color="#D9A441" />
                  <Text style={styles.statValue}>{totalContributors}</Text>
                  <Text style={styles.statLabel}>Contributeurs</Text>
                </View>
                <View style={styles.statBox}>
                  <Wallet size={16} color="#D9A441" />
                  <Text style={styles.statValue}>{amountDisplay(appeal.collectedAmount)}</Text>
                  <Text style={styles.statLabel}>Déjà collecté</Text>
                </View>
                <View style={styles.statBox}>
                  <CalendarDays size={16} color="#D9A441" />
                  <Text style={styles.statValue}>{deadlineLabel}</Text>
                  <Text style={styles.statLabel}>Date limite</Text>
                </View>
              </View>
            </View>

            {/* Confiance */}
            <View style={styles.trustCard}>
              <ShieldCheck size={18} color="#0B6E4F" />
              <Text style={styles.trustText}>
                Collecte vérifiée : les fonds sont bloqués sur le compte sécurisé Venega et
                reversés uniquement au bénéficiaire après vérification.
              </Text>
            </View>

            {/* Liste des contributeurs */}
            <View style={styles.contribSection}>
              <View style={styles.contribHeaderRow}>
                <Text style={styles.sectionHeading}>Contributeurs récents</Text>
                <Text style={styles.contribCount}>{appeal.contributorCount}+</Text>
              </View>

              <View style={styles.contribListCard}>
                {visibleContributions.map((c, idx) => {
                  const op = OPERATORS.find((o) => o.id === c.paymentMethod);
                  return (
                    <View
                      key={c.id}
                      style={[styles.contribRow, idx === visibleContributions.length - 1 && styles.contribRowLast]}
                    >
                      <View style={styles.contribAvatarWrap}>
                        {c.visibility === ContributorVisibility.ANONYMOUS ? (
                          <EyeOff size={15} color="#64748B" />
                        ) : (
                          <Text style={styles.contribInitial}>
                            {(c.contributorName ?? '?').charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={styles.contribInfo}>
                        <Text style={styles.contribName}>
                          {c.visibility === ContributorVisibility.ANONYMOUS
                            ? 'Anonyme'
                            : c.contributorName}
                        </Text>
                        <Text style={styles.contribMeta}>
                          {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          {' '}• {op?.short ?? 'Mobile Money'}
                        </Text>
                      </View>
                      <Text style={styles.contribAmount}>+{amountDisplay(c.amount)}</Text>
                    </View>
                  );
                })}

                {hasMore ? (
                  <TouchableOpacity
                    style={styles.loadMoreBtn}
                    activeOpacity={0.8}
                    onPress={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  >
                    <Text style={styles.loadMoreText}>
                      Charger plus ({mockAidContributions.length - visibleCount} autres)
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.listEndBox}>
                    <Text style={styles.listEndText}>Toutes les contributions sont affichées</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Barre CTA en bas */}
          <View style={styles.ctaBar}>
            <View style={styles.ctaInfo}>
              <Text style={styles.ctaTitle}>Soutenez {appeal.beneficiaryName.split(' ')[0]}</Text>
              <Text style={styles.ctaSub}>Contribution à partir de {amountDisplay(500)}</Text>
            </View>
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.88}
              onPress={() => setShowContribute(true)}
            >
              <HeartHandshake size={18} color="#FFFFFF" />
              <Text style={styles.ctaButtonText}>Contribuer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de contribution (sans compte) */}
        <Modal visible={showContribute} animationType="fade" transparent={true}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Contribuer à la collecte</Text>
                <TouchableOpacity onPress={() => setShowContribute(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>
                Pour {appeal.beneficiaryName} • {appeal.beneficiaryNumber}
              </Text>

              {/* Anonyme ou non */}
              <TouchableOpacity
                style={styles.anonToggleRow}
                activeOpacity={0.8}
                onPress={() => setAnonymous(!anonymous)}
              >
                <View style={[styles.anonToggleTrack, anonymous && styles.anonToggleTrackOn]}>
                  <View style={[styles.anonToggleThumb, anonymous && styles.anonToggleThumbOn]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.anonToggleLabel}>Rester anonyme</Text>
                  <Text style={styles.anonToggleSub}>Votre nom n'apparaîtra pas dans la liste</Text>
                </View>
              </TouchableOpacity>

              {!anonymous && (
                <>
                  <View style={styles.inputWrap}>
                    <User size={17} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Votre nom complet"
                      placeholderTextColor="#94A3B8"
                      value={contributorName}
                      onChangeText={setContributorName}
                    />
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputPrefix}>+226</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Votre numéro (facultatif)"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={contributorPhone}
                      onChangeText={setContributorPhone}
                    />
                  </View>
                </>
              )}

              {/* Montant */}
              <Text style={styles.fieldLabel}>Montant de votre contribution</Text>
              <View style={styles.amountChipsRow}>
                {QUICK_AMOUNTS.map((a) => {
                  const selected = amount === a;
                  return (
                    <TouchableOpacity
                      key={a}
                      style={[styles.amountChip, selected && styles.amountChipSelected]}
                      activeOpacity={0.8}
                      onPress={() => setAmount(a)}
                    >
                      <Text style={[styles.amountChipText, selected && styles.amountChipTextSelected]}>
                        {amountDisplay(a)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Moyen de paiement */}
              <Text style={styles.fieldLabel}>Moyen de paiement</Text>
              <View style={styles.operatorsRow}>
                {OPERATORS.map((op) => {
                  const selected = operator === op.id;
                  return (
                    <TouchableOpacity
                      key={op.id}
                      style={[styles.operatorCard, selected && styles.operatorCardSelected]}
                      activeOpacity={0.8}
                      onPress={() => setOperator(op.id)}
                    >
                      <View style={[styles.operatorDot, { backgroundColor: op.color }]} />
                      <Text style={[styles.operatorText, selected && styles.operatorTextSelected]}>{op.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.confirmButton} activeOpacity={0.88} onPress={handleContribute}>
                <HeartHandshake size={18} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Donner {amountDisplay(amount)}</Text>
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Confirmation */}
        <Modal visible={contributed} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              <View style={styles.successIconWrap}>
                <Check size={40} color="#10B981" strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>Merci pour votre générosité !</Text>
              <Text style={styles.successSub}>
                Votre contribution de {amountDisplay(amount)} est en attente de validation.
                Un message sera envoyé au numéro indiqué pour confirmer le paiement.
              </Text>
              <View style={styles.successBox}>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Bénéficiaire</Text>
                  <Text style={styles.successVal}>{appeal.beneficiaryName}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Moyen de paiement</Text>
                  <Text style={styles.successVal}>{OPERATORS.find((o) => o.id === operator)?.name}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Référence</Text>
                  <Text style={styles.successVal}>TX-{Math.floor(100000 + Math.random() * 900000)}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.confirmButton}
                activeOpacity={0.88}
                onPress={() => setContributed(false)}
              >
                <Text style={styles.confirmButtonText}>Fermer</Text>
              </TouchableOpacity>
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
    backgroundColor: '#7C2D12',
  },
  topSection: {
    backgroundColor: '#7C2D12',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnPlaceholder: {
    width: 38,
    height: 38,
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
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
    paddingBottom: 24,
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#0F172A',
  },
  heroMeta: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(217, 164, 65, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D9A441',
  },
  liveBadgeText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
    color: '#B07D14',
  },
  reasonText: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    lineHeight: 20,
    color: '#334155',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  progressGoalText: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: '#074B36',
  },
  progressRemainingText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#64748B',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#D9A441',
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPctText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#B07D14',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#0F172A',
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: 'WorkSans',
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(11, 110, 79, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(11, 110, 79, 0.2)',
    padding: 12,
  },
  trustText: {
    flex: 1,
    fontFamily: 'WorkSans',
    fontSize: 12,
    lineHeight: 17,
    color: '#0B6E4F',
  },
  contribSection: {
    gap: 10,
  },
  contribHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#074B36',
  },
  contribCount: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#D9A441',
  },
  contribListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  contribRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contribRowLast: {
    borderBottomWidth: 0,
  },
  contribAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contribInitial: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#074B36',
  },
  contribInfo: {
    flex: 1,
  },
  contribName: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  contribMeta: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  contribAmount: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#059669',
  },
  loadMoreBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadMoreText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#074B36',
  },
  listEndBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  listEndText: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#94A3B8',
  },
  ctaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
  },
  ctaInfo: {
    flex: 1,
  },
  ctaTitle: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
  },
  ctaSub: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#7C2D12',
    borderRadius: 24,
    paddingHorizontal: 18,
    height: 46,
    shadowColor: '#7C2D12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#FFFFFF',
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
  modalSub: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
  },
  anonToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  anonToggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    padding: 3,
  },
  anonToggleTrackOn: {
    backgroundColor: '#074B36',
  },
  anonToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  anonToggleThumbOn: {
    transform: [{ translateX: 18 }],
  },
  anonToggleLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#0F172A',
  },
  anonToggleSub: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 50,
  },
  inputPrefix: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13.5,
    color: '#0F172A',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: '#0F172A',
  },
  fieldLabel: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#0F172A',
    marginTop: 2,
  },
  amountChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amountChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  amountChipSelected: {
    borderColor: '#D9A441',
    backgroundColor: 'rgba(217, 164, 65, 0.12)',
  },
  amountChipText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#64748B',
  },
  amountChipTextSelected: {
    color: '#B07D14',
  },
  operatorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  operatorCardSelected: {
    borderColor: '#074B36',
    backgroundColor: 'rgba(7, 75, 54, 0.05)',
  },
  operatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  operatorText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 12,
    color: '#64748B',
  },
  operatorTextSelected: {
    fontFamily: 'WorkSansBold',
    color: '#074B36',
  },
  confirmButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#074B36',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  confirmButtonText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  successIconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: 'SoraBold',
    fontSize: 19,
    color: '#074B36',
    textAlign: 'center',
  },
  successSub: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  successLabel: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
  },
  successVal: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#0F172A',
    flexShrink: 1,
    textAlign: 'right',
  },
});
