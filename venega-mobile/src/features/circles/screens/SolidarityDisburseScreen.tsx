import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal, AppState, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check } from 'lucide-react-native';
import {
  getCircle,
  getCircles,
  getSolidarityRequests,
  getSolidarityTotals,
  getCircleMembers,
  disburseSolidarityRequest,
  buildUssdCode,
} from '../circleStore';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

const operatorLogos: Record<string, any> = {
  ORANGE: require('../../../../assets/operators/orange.png'),
  MOOV: require('../../../../assets/operators/moov.png'),
  WAVE: require('../../../../assets/operators/wave.png'),
};

const OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money' },
  { id: 'MOOV', name: 'Moov Africa' },
  { id: 'WAVE', name: 'Wave' },
];

const avatarPalette = ['#D9A441', '#0B6E4F', '#7A4E9C', '#3182CE', '#B9852A', '#E53E3E'];
const avatarColor = (userId: string) => {
  const sum = userId.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length];
};

const initials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};

export default function SolidarityDisburseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; requestId: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircles()[0]!;
  const request = getSolidarityRequests(circle.id).find((r) => r.id === params.requestId);
  const totals = getSolidarityTotals(circle.id);
  const beneficiary = request ? getCircleMembers(circle.id).find((m) => m.userId === request.userId) : undefined;

  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dialing, setDialing] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && dialing && request) {
        setDialing(false);
        disburseSolidarityRequest(request.id);
        router.back();
      }
    });
    return () => subscription.remove();
  }, [dialing, request]);

  const handleOpenConfirm = () => {
    if (!selectedOperator) return;
    setShowConfirmModal(true);
  };

  const handleDial = () => {
    if (!request || !selectedOperator) return;
    const ussdCode = buildUssdCode(selectedOperator, request.amountRequested);
    setShowConfirmModal(false);
    setDialing(true);
    Linking.openURL(`tel:${encodeURIComponent(ussdCode)}`).catch(() => {
      setDialing(false);
    });
  };

  if (!request) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
          <TouchableOpacity style={styles.notFoundBack} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1A202C" />
          </TouchableOpacity>
          <Text style={styles.notFoundText}>Demande introuvable.</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1A202C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Décaisser un secours</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Solde — bloc héros */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Solde disponible</Text>
            <Text style={styles.heroValue}>{formatXOF(totals.balance)}</Text>
          </View>

          {/* Résumé */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bénéficiaire</Text>
              <View style={styles.summaryBeneficiary}>
                <View style={[styles.avatar, { backgroundColor: avatarColor(request.userId) }]}>
                  <Text style={styles.avatarText}>{initials(request.requesterName)}</Text>
                </View>
                <Text style={styles.summaryValue}>{request.requesterName}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Numéro Mobile Money</Text>
              <Text style={styles.summaryValue}>{beneficiary?.user.phoneNumber ?? '—'}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryBlock}>
              <Text style={styles.summaryLabel}>Motif</Text>
              <Text style={styles.summaryReasonText}>{request.reason}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Montant à verser</Text>
              <Text style={styles.summaryValueGreen}>{formatXOF(request.amountRequested)}</Text>
            </View>
          </View>
          <Text style={styles.reasonHint}>Ce motif sera visible par tous les membres, avec le montant.</Text>

          {/* Opérateur */}
          <Text style={styles.sectionLabel}>Choisissez l'opérateur</Text>
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
                  <View style={[styles.operatorCheck, isSelected && styles.operatorCheckSelected]}>
                    {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3.2} />}
                  </View>
                  <Image source={operatorLogos[op.id]} style={styles.operatorLogo} contentFit="contain" />
                  <Text style={[styles.opNameText, isSelected && styles.opNameTextSelected]}>{op.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmBtn, !selectedOperator && styles.confirmBtnDisabled]}
            activeOpacity={0.88}
            disabled={!selectedOperator}
            onPress={handleOpenConfirm}
          >
            <Text style={styles.confirmBtnText}>Verser {formatXOF(request.amountRequested)}</Text>
          </TouchableOpacity>
        </View>

        {/* DEMANDE DE CONFIRMATION DE VERSEMENT */}
        <Modal visible={showConfirmModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Demande de confirmation de versement</Text>
              <Text style={styles.modalText}>
                Vous êtes sur le point de verser {formatXOF(request.amountRequested)} au numéro{' '}
                <Text style={styles.modalTextBold}>{beneficiary?.user.phoneNumber ?? '—'}</Text>.
              </Text>

              {selectedOperator && (
                <View style={styles.modalPayVia}>
                  <Text style={styles.modalPayViaLabel}>Paiement via</Text>
                  <Image source={operatorLogos[selectedOperator]} style={styles.modalPayViaLogo} contentFit="contain" />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  activeOpacity={0.85}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} activeOpacity={0.85} onPress={handleDial}>
                  <Text style={styles.modalConfirmBtnText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  notFoundBack: { margin: 20, width: 38, height: 38, justifyContent: 'center' },
  notFoundText: { fontFamily: 'WorkSans', fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10 },
  backBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginLeft: -6 },
  headerTitle: { fontFamily: 'SoraBold', fontSize: 18, color: '#1A202C' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  heroCard: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E4F0EB',
    borderRadius: 20,
    paddingVertical: 22,
    marginBottom: 18,
  },
  heroLabel: { fontFamily: 'WorkSansMedium', fontSize: 12.5, color: '#0B6E4F' },
  heroValue: { fontFamily: 'SoraBold', fontSize: 30, color: '#074B36', letterSpacing: -0.5 },
  summaryCard: {
    borderWidth: 1.5,
    borderColor: '#E7EAEE',
    borderRadius: 18,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  summaryBlock: { paddingVertical: 14, paddingHorizontal: 16, gap: 6 },
  summaryDivider: { height: 1, backgroundColor: '#F1F3F6' },
  summaryLabel: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#94A3B8' },
  summaryValue: { fontFamily: 'WorkSansSemiBold', fontSize: 14, color: '#1A202C' },
  summaryValueGreen: { fontFamily: 'SoraBold', fontSize: 14.5, color: '#0B6E4F' },
  summaryBeneficiary: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryReasonText: { fontFamily: 'WorkSans', fontSize: 13.5, lineHeight: 19, color: '#334155' },
  avatar: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: 'SoraBold', fontSize: 10.5, color: '#FFFFFF' },
  reasonHint: { fontFamily: 'WorkSans', fontSize: 10.5, color: '#94A3B8', marginTop: 8, marginBottom: 20 },
  sectionLabel: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 11.5,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  operatorsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  operatorCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E7EAEE',
  },
  operatorCardSelected: {
    borderColor: '#074B36',
    backgroundColor: 'rgba(7, 75, 54, 0.04)',
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  operatorCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.5,
    borderColor: '#E7EAEE',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  operatorCheckSelected: { backgroundColor: '#074B36', borderColor: '#074B36' },
  operatorLogo: { width: 34, height: 34, borderRadius: 9, marginTop: 4 },
  opNameText: { fontFamily: 'WorkSansMedium', fontSize: 11, color: '#64748B', textAlign: 'center' },
  opNameTextSelected: { fontFamily: 'WorkSansBold', color: '#074B36' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F3F6' },
  confirmBtn: { height: 52, borderRadius: 26, backgroundColor: '#074B36', justifyContent: 'center', alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#CBD5E1' },
  confirmBtnText: { fontFamily: 'SoraBold', fontSize: 14.5, color: '#FFFFFF' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    width: '100%',
    gap: 14,
  },
  modalTitle: { fontFamily: 'SoraBold', fontSize: 16, color: '#1A202C' },
  modalText: { fontFamily: 'WorkSans', fontSize: 13.5, lineHeight: 19, color: '#334155' },
  modalTextBold: { fontFamily: 'WorkSansBold' },
  modalPayVia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalPayViaLabel: { fontFamily: 'WorkSansSemiBold', fontSize: 12.5, color: '#64748B' },
  modalPayViaLogo: { width: 30, height: 30, borderRadius: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#64748B' },
  modalConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#FFFFFF' },
});
