import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Modal, AppState, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check } from 'lucide-react-native';
import { getCircle, getCircles, getCurrentUser, buildUssdCode, activateCircle, CIRCLE_CREATION_FEE } from '../circleStore';
import { CircleType } from '@venega/types';

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

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ circleId?: string; amount?: string; type?: string }>();
  const circle = getCircle(params.circleId ?? '') ?? getCircles()[0]!;
  const paymentType = params.type === 'SOLIDARITY' ? 'SOLIDARITY' : params.type === 'ACTIVATION' ? 'ACTIVATION' : 'TONTINE';
  const amount = paymentType === 'ACTIVATION' ? CIRCLE_CREATION_FEE : (parseFloat(params.amount || '0') || circle.tontineAmount || 0);
  const me = getCurrentUser();

  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dialing, setDialing] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && dialing) {
        setDialing(false);
        if (paymentType === 'ACTIVATION') {
          activateCircle(circle.id);
          router.replace((circle.type === CircleType.SOLIDARITY_ONLY ? `/circle/${circle.id}/solidarity` : `/circle/${circle.id}`) as any);
        } else {
          router.back();
        }
      }
    });
    return () => subscription.remove();
  }, [dialing]);

  const handleOpenConfirm = () => {
    if (!selectedOperator) return;
    setShowConfirmModal(true);
  };

  const handleDial = () => {
    if (!selectedOperator) return;
    const ussdCode = buildUssdCode(selectedOperator, amount);
    setShowConfirmModal(false);
    setDialing(true);
    Linking.openURL(`tel:${encodeURIComponent(ussdCode)}`).catch(() => {
      setDialing(false);
    });
  };

  const typeLabel =
    paymentType === 'SOLIDARITY' ? 'Cotisation solidarité'
    : paymentType === 'ACTIVATION' ? "Frais d'activation"
    : 'Cotisation tontine';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1A202C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {paymentType === 'ACTIVATION' ? 'Activer le cercle' : 'Payer ma cotisation'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Montant — bloc héros */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Montant à payer</Text>
            <Text style={styles.heroValue}>{formatXOF(amount)}</Text>
          </View>

          {paymentType === 'ACTIVATION' && (
            <Text style={styles.reasonHint}>
              Votre cercle est créé mais pas encore actif. Réglez les frais d'activation pour le mettre en service.
            </Text>
          )}

          {/* Résumé */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cercle</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>{circle.name}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{paymentType === 'ACTIVATION' ? 'Type de frais' : 'Type de cotisation'}</Text>
              <Text style={styles.summaryValue}>{typeLabel}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Numéro Mobile Money</Text>
              <Text style={styles.summaryValue}>{me.phoneNumber}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Montant</Text>
              <Text style={styles.summaryValueGreen}>{formatXOF(amount)}</Text>
            </View>
          </View>
          <Text style={styles.reasonHint}>Le paiement est envoyé directement depuis votre numéro Mobile Money.</Text>

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
            <Text style={styles.confirmBtnText}>Payer {formatXOF(amount)}</Text>
          </TouchableOpacity>
        </View>

        {/* DEMANDE DE CONFIRMATION DE PAIEMENT */}
        <Modal visible={showConfirmModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Demande de confirmation de paiement</Text>
              <Text style={styles.modalText}>
                Vous êtes sur le point de payer {formatXOF(amount)} depuis le numéro{' '}
                <Text style={styles.modalTextBold}>{me.phoneNumber}</Text>.
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
  summaryDivider: { height: 1, backgroundColor: '#F1F3F6' },
  summaryLabel: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#94A3B8' },
  summaryValue: { fontFamily: 'WorkSansSemiBold', fontSize: 14, color: '#1A202C' },
  summaryValueGreen: { fontFamily: 'SoraBold', fontSize: 14.5, color: '#0B6E4F' },
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
