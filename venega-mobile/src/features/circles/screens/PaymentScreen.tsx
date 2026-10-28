import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, AppState, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Info } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { getCircle, getCircles, getCurrentUser, buildUssdCode, activateCircle, CIRCLE_CREATION_FEE } from '../circleStore';
import { CircleType } from '@venega/types';
import { Button, IconButton, Sheet } from '../../../components/ui';
import OperatorPicker, { operatorLogos } from '../components/OperatorPicker';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

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
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {paymentType === 'ACTIVATION' ? 'Activer le cercle' : 'Payer ma cotisation'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Montant */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Montant à payer</Text>
            <Text style={styles.amountValue}>{formatXOF(amount)}</Text>
            <Text style={styles.amountSub} numberOfLines={1}>{circle.name}</Text>
          </View>

          {paymentType === 'ACTIVATION' && (
            <View style={styles.notice}>
              <Info size={18} color={colors.accent.deep} />
              <Text style={styles.noticeText}>
                Votre cercle est créé mais pas encore actif. Réglez les frais d'activation pour le mettre en service.
              </Text>
            </View>
          )}

          {/* Résumé */}
          <View style={styles.card}>
            <SummaryRow label="Cercle" value={circle.name} />
            <SummaryRow label={paymentType === 'ACTIVATION' ? 'Type de frais' : 'Type de cotisation'} value={typeLabel} />
            <SummaryRow label="Numéro Mobile Money" value={me.phoneNumber} />
            <SummaryRow label="Montant" value={formatXOF(amount)} strong last />
          </View>
          <Text style={styles.hint}>Le paiement est envoyé directement depuis votre numéro Mobile Money.</Text>

          {/* Opérateur */}
          <Text style={styles.sectionTitle}>Choisissez l'opérateur</Text>
          <OperatorPicker operators={OPERATORS} value={selectedOperator} onChange={setSelectedOperator} />
        </ScrollView>

        <View style={styles.footer}>
          <Button title={`Payer ${formatXOF(amount)}`} disabled={!selectedOperator} onPress={handleOpenConfirm} />
        </View>
      </SafeAreaView>

      {/* Confirmation du paiement */}
      <Sheet visible={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirmer le paiement">
        <Text style={styles.sheetText}>
          Vous êtes sur le point de payer <Text style={styles.sheetStrong}>{formatXOF(amount)}</Text> depuis le numéro{' '}
          <Text style={styles.sheetStrong}>{me.phoneNumber}</Text>.
        </Text>

        {selectedOperator && (
          <View style={styles.payVia}>
            <Image source={operatorLogos[selectedOperator]} style={styles.payViaLogo} contentFit="contain" />
            <Text style={styles.payViaText}>
              Paiement via {OPERATORS.find((o) => o.id === selectedOperator)?.name}
            </Text>
          </View>
        )}

        <View style={styles.sheetActions}>
          <Button title="Annuler" variant="secondary" onPress={() => setShowConfirmModal(false)} style={styles.flex} />
          <Button title="Confirmer" onPress={handleDial} style={styles.flex} />
        </View>
      </Sheet>
    </View>
  );
}

function SummaryRow({ label, value, strong, last }: { label: string; value: string; strong?: boolean; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowValueStrong]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { flex: 1, ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSpacer: { width: 40 },

  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },

  amountCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.primary.dark,
    marginBottom: 20,
  },
  amountLabel: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8 },
  amountValue: { ...typography.display, color: '#FFFFFF', marginTop: 4 },
  amountSub: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8, marginTop: 4 },

  notice: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.accent.tint,
    marginBottom: 20,
  },
  noticeText: { flex: 1, ...typography.footnote, color: colors.inkSoft },

  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowLabel: { ...typography.callout, color: colors.muted },
  rowValue: { flexShrink: 1, ...typography.callout, fontWeight: '500', color: colors.ink, textAlign: 'right' },
  rowValueStrong: { fontWeight: '700', color: colors.primary.dark },
  hint: { ...typography.footnote, color: colors.muted, marginTop: 8 },

  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginTop: 28, marginBottom: 12 },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },

  sheetText: { ...typography.body, color: colors.inkSoft },
  sheetStrong: { fontWeight: '600', color: colors.ink },
  payVia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  payViaLogo: { width: 32, height: 32, borderRadius: 8 },
  payViaText: { flex: 1, ...typography.callout, fontWeight: '600', color: colors.ink },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
