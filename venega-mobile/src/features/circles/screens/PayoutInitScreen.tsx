import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Copy,
  Check,
  Phone,
  Loader,
  CheckCircle2,
  History,
  X,
  Bell,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getCircle, getCircles, getActiveCycle, getCycles } from '../circleStore';
import { mockMemberships, mockPayoutRecords } from '@venega/types';
import type { PayoutRecord } from '@venega/types';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

const operatorLogos: Record<string, any> = {
  ORANGE: require('../../../../assets/operators/orange.png'),
  MOOV: require('../../../../assets/operators/moov.png'),
  WAVE: require('../../../../assets/operators/wave.png'),
};

const OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money' },
  { id: 'MOOV', name: 'Moov Money' },
  { id: 'WAVE', name: 'Wave' },
];

export default function PayoutInitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';

  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const cycle = getActiveCycle(circle) ?? getCycles(circle.id)[0];
  const memberships = mockMemberships.filter((m) => m.circleId === circle.id);
  const orderedMembers = [...memberships].sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  const notReceived = orderedMembers.filter((m) => !m.hasReceivedPayout);
  const beneficiary = notReceived[0] ?? orderedMembers[0];

  // Modèle financier (défini à la création du cercle)
  const baseTontineAmount = circle.tontineAmount || 10000;
  const founderManagementFeePerTurn = circle.managementFee || 500;
  const memberCount = orderedMembers.length;

  const totalGrossCollected = (baseTontineAmount + founderManagementFeePerTurn) * memberCount;
  const beneficiaryPotAmount = baseTontineAmount * memberCount;
  const totalFounderFeesCollected = founderManagementFeePerTurn * memberCount;
  const venegaCommission = Math.round(totalFounderFeesCollected * 0.1);
  const netFounderFees = totalFounderFeesCollected - venegaCommission;

  const scrollRef = useRef<ScrollView>(null);

  const [selectedOperator, setSelectedOperator] = useState('ORANGE');
  const [copied, setCopied] = useState(false);
  const [ussdModal, setUssdModal] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [ussdCode, setUssdCode] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const [history, setHistory] = useState<PayoutRecord[]>(() =>
    mockPayoutRecords
      .filter((p) => p.circleId === circle.id && p.status === 'PAID')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );

  const buildUssd = (op: string) =>
    `*${op === 'MOOV' ? '802' : op === 'WAVE' ? '888' : '800'}*${beneficiaryPotAmount}*${Math.floor(100 + Math.random() * 900)}#`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(ussdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInitiate = () => {
    setRefNumber(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
    setUssdCode(buildUssd(selectedOperator));
    setUssdModal(true);
  };

  const handleExecuteUssd = () => {
    Linking.openURL(`tel:${ussdCode.replace(/#$/, '%23')}`).catch(() => {
      Alert.alert('Code USSD', ussdCode);
    });
    // Système déjà armé : Venega détecte automatiquement le paiement exécuté
    setDetecting(true);
    setTimeout(() => {
      setDetecting(false);
      setUssdModal(false);
      const now = new Date();
      const newRecord: PayoutRecord = {
        id: `p${Date.now()}`,
        circleId: circle.id,
        cycleId: cycle?.id ?? 'cy1',
        beneficiaryName: `${beneficiary?.user?.firstName ?? ''} ${beneficiary?.user?.lastName ?? ''}`.trim(),
        beneficiaryAvatar: beneficiary?.user?.avatarUrl,
        totalAmount: totalGrossCollected,
        beneficiaryAmount: beneficiaryPotAmount,
        founderFees: netFounderFees,
        venegaCommission,
        operator: OPERATORS.find((o) => o.id === selectedOperator)?.name ?? 'Orange Money',
        status: 'PAID',
        createdAt: now.toISOString(),
      };
      setHistory((h) => [newRecord, ...h]);
      setShowNotification(true);
    }, 6000);
  };

  const handleViewHistory = () => {
    setShowNotification(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' à ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
  };

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
            <Text style={styles.headerTitle} numberOfLines={1}>Verser la cagnotte</Text>
            <View style={styles.backBtn} />
          </View>
          <Text style={styles.headerSub}>Compte hub Venega • CityNet Pay</Text>
        </View>

        {/* Corps crème */}
        <View style={styles.bodySheet}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Bénéficiaire */}
            <View style={styles.beneficiaryCard}>
              <Image source={{ uri: beneficiary?.user?.avatarUrl }} style={styles.beneficiaryAvatar} contentFit="cover" />
              <View style={styles.beneficiaryInfo}>
                <Text style={styles.beneficiaryLabel}>Bénéficiaire (Tour {cycle?.currentTurn ?? 1})</Text>
                <Text style={styles.beneficiaryName}>
                  {beneficiary?.user?.firstName} {beneficiary?.user?.lastName}
                </Text>
                <Text style={styles.beneficiaryPhone}>+226 70 12 34 56 (Mobile Money)</Text>
              </View>
              <Text style={styles.beneficiaryAmount}>{formatXOF(beneficiaryPotAmount)}</Text>
            </View>

            {/* Détails de la transaction */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Total</Text>
                <Text style={styles.breakdownVal}>{formatXOF(totalGrossCollected)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Frais</Text>
                <Text style={styles.breakdownVal}>{formatXOF(netFounderFees)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Commission</Text>
                <Text style={styles.breakdownVal}>{formatXOF(venegaCommission)}</Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownTotalLabel}>Somme à verser</Text>
                <Text style={styles.breakdownTotalValGreen}>{formatXOF(beneficiaryPotAmount)}</Text>
              </View>
            </View>

            {/* Opérateur */}
            <View style={styles.operatorCard}>
              <Text style={styles.operatorLabel}>Opérateur de versement</Text>
              <Text style={styles.operatorSub}>Choisissez l'opérateur qui exécutera le paiement</Text>
              <View style={styles.operatorsRow}>
                {OPERATORS.map((op) => {
                  const isSelected = op.id === selectedOperator;
                  return (
                    <TouchableOpacity
                      key={op.id}
                      style={[styles.operatorBox, isSelected && styles.operatorBoxSelected]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedOperator(op.id)}
                    >
                      <Image source={operatorLogos[op.id]} style={styles.operatorLogo} contentFit="contain" />
                      <Text style={[styles.operatorName, isSelected && styles.operatorNameSelected]}>
                        {op.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleInitiate}>
                <Phone size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Initier le paiement</Text>
              </TouchableOpacity>
            </View>

            {/* Historique des versements (seulement les payés) */}
            <View style={styles.historySection}>
              <View style={styles.historyHeaderRow}>
                <History size={18} color="#074B36" />
                <Text style={styles.historyTitle}>Historique des versements</Text>
              </View>
              <View style={styles.historyCard}>
                {history.length === 0 && (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      Aucun versement payé pour le moment.
                    </Text>
                  </View>
                )}
                {history.map((p: PayoutRecord, idx: number) => (
                  <View
                    key={p.id}
                    style={[styles.historyRow, idx === history.length - 1 && styles.historyRowLast]}
                  >
                    <Image source={{ uri: p.beneficiaryAvatar }} style={styles.historyAvatar} contentFit="cover" />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>{p.beneficiaryName}</Text>
                      <Text style={styles.historyMeta}>
                        {formatDate(p.createdAt)} • {p.operator}
                      </Text>
                      <Text style={styles.historyRef}>Réf. TX-{p.id.toUpperCase().slice(1)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.historyAmount}>−{formatXOF(p.beneficiaryAmount)}</Text>
                      <View style={styles.paidTag}>
                        <CheckCircle2 size={11} color="#0B6E4F" />
                        <Text style={styles.paidTagText}>Payé</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* MODALE USSD : Copier ou Exécuter (pas de bouton « J'ai effectué ») */}
        <Modal visible={ussdModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Code USSD à exécuter</Text>
                <TouchableOpacity onPress={() => setUssdModal(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.ussdSub}>
                {OPERATORS.find((o) => o.id === selectedOperator)?.name} • Compte hub Venega
              </Text>

              <View style={styles.ussdCodeBox}>
                <Text style={styles.ussdCodeText}>{ussdCode}</Text>
              </View>

              {!detecting ? (
                <>
                  <TouchableOpacity style={[styles.copyPillBtn, copied && styles.copyPillBtnDone]} activeOpacity={0.8} onPress={handleCopyCode}>
                    {copied ? <Check size={17} color="#FFFFFF" /> : <Copy size={17} color="#074B36" />}
                    <Text style={[styles.copyPillBtnText, copied && styles.copyPillBtnTextDone]}>
                      {copied ? 'Copié' : 'Copier le code'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleExecuteUssd}>
                    <Phone size={18} color="#FFFFFF" />
                    <Text style={styles.primaryBtnText}>Exécuter le code USSD</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.detectingBox}>
                  <Loader size={22} color="#074B36" />
                  <Text style={styles.detectingTitle}>Détection automatique du paiement…</Text>
                  <Text style={styles.detectingText}>
                    Le système a vu votre paiement de {formatXOF(beneficiaryPotAmount)}.
                    Venega vous enverra la notification dès que la transaction est validée.
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        </Modal>

        {/* NOTIFICATION VENEGA : versement détecté automatiquement */}
        <Modal visible={showNotification} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              <View style={styles.bellCircle}>
                <Bell size={34} color="#B47818" />
              </View>
              <Text style={styles.notifTag}>Notification Venega</Text>
              <Text style={styles.receiptTitle}>Versement effectué !</Text>

              <View style={styles.paidNoticeBox}>
                <Text style={styles.paidNoticeLine}>
                  ✓ Vous avez versé {formatXOF(beneficiaryPotAmount)} à {beneficiary?.user?.firstName}{' '}
                  {beneficiary?.user?.lastName}.
                </Text>
                <Text style={styles.paidNoticeLine}>
                  ✓ Vous avez reçu {formatXOF(netFounderFees)} (frais fondateur) sur votre compte.
                </Text>
              </View>

              <View style={styles.receiptBox}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Bénéficiaire</Text>
                  <Text style={styles.receiptVal}>
                    {beneficiary?.user?.firstName} {beneficiary?.user?.lastName}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Somme versée</Text>
                  <Text style={styles.receiptValGreen}>{formatXOF(beneficiaryPotAmount)}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Reçu (fondateur)</Text>
                  <Text style={styles.receiptVal}>{formatXOF(netFounderFees)}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Commission Venega</Text>
                  <Text style={styles.receiptVal}>{formatXOF(venegaCommission)}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Opérateur</Text>
                  <Text style={styles.receiptVal}>
                    {OPERATORS.find((o) => o.id === selectedOperator)?.name}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Référence</Text>
                  <Text style={styles.receiptVal}>{refNumber}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Date</Text>
                  <Text style={styles.receiptVal}>
                    {formatDate(new Date().toISOString())}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleViewHistory}>
                <History size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Voir l'historique complet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.8}
                onPress={() => setShowNotification(false)}
              >
                <Text style={styles.cancelBtnText}>Fermer</Text>
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
    backgroundColor: '#074B36',
  },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
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
    fontSize: 18,
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
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 16,
  },
  beneficiaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  beneficiaryAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryLabel: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#64748B',
  },
  beneficiaryName: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#0F172A',
  },
  beneficiaryPhone: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
    color: '#074B36',
    marginTop: 1,
  },
  beneficiaryAmount: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#E53E3E',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#64748B',
  },
  breakdownVal: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13,
    color: '#0F172A',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  breakdownTotalLabel: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#074B36',
  },
  breakdownTotalValGreen: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#E53E3E',
  },
  operatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  operatorLabel: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#0F172A',
  },
  operatorSub: {
    fontFamily: 'WorkSans',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: -6,
  },
  operatorsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  operatorBox: {
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
  operatorBoxSelected: {
    borderColor: '#074B36',
    backgroundColor: 'rgba(7, 75, 54, 0.05)',
  },
  operatorLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  operatorName: {
    fontFamily: 'WorkSansMedium',
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
  },
  operatorNameSelected: {
    fontFamily: 'WorkSansBold',
    color: '#074B36',
  },
  primaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#074B36',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  copyPillBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#074B36',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  copyPillBtnDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  copyPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#074B36',
  },
  copyPillBtnTextDone: {
    color: '#FFFFFF',
  },
  historySection: {
    gap: 10,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyTitle: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#074B36',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  historyAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  historyMeta: {
    fontFamily: 'WorkSans',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  historyRef: {
    fontFamily: 'WorkSans',
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  historyAmount: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#E53E3E',
  },
  paidTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(11, 110, 79, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paidTagText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 10.5,
    color: '#0B6E4F',
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
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
  ussdSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
    marginTop: -4,
  },
  ussdCodeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ussdCodeText: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#074B36',
    letterSpacing: 1,
    textAlign: 'center',
  },
  detectingBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  detectingTitle: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#074B36',
  },
  detectingText: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
  },
  bellCircle: {
    alignSelf: 'center',
    marginBottom: 2,
  },
  notifTag: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11,
    color: '#B47818',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  receiptTitle: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: '#074B36',
    textAlign: 'center',
  },
  paidNoticeBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  paidNoticeLine: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#0F172A',
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
    fontSize: 13.5,
    color: '#E53E3E',
  },
  cancelBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#64748B',
  },
});
