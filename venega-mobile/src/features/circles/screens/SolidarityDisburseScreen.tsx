import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, AppState, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchX } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Button, Sheet } from '../../../components/ui';
import OperatorPicker, { operatorLogos } from '../components/OperatorPicker';
import { Avatar, EmptyState, ScreenHeader, cardStyle } from '../components/SolidarityParts';
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

const OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money' },
  { id: 'MOOV', name: 'Moov Africa' },
  { id: 'WAVE', name: 'Wave' },
];

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
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScreenHeader title="Décaisser un secours" onBack={() => router.back()} />
          <EmptyState icon={SearchX} title="Demande introuvable" text="Cette demande n'existe plus ou a été retirée." style={styles.notFound} />
        </SafeAreaView>
      </View>
    );
  }

  const operatorName = OPERATORS.find((o) => o.id === selectedOperator)?.name;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScreenHeader title="Décaisser un secours" subtitle={circle.name} onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Solde */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceValue}>{formatXOF(totals.balance)}</Text>
          </View>

          {/* Résumé */}
          <View style={[cardStyle, styles.summaryCard]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bénéficiaire</Text>
              <View style={styles.summaryBeneficiary}>
                <Avatar name={request.requesterName} userId={request.userId} size={28} />
                <Text style={styles.summaryValue}>{request.requesterName}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Numéro Mobile Money</Text>
              <Text style={styles.summaryValue}>{beneficiary?.user.phoneNumber ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryLabel}>Motif</Text>
              <Text style={styles.summaryReason}>{request.reason}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Montant à verser</Text>
              <Text style={styles.summaryValueStrong}>{formatXOF(request.amountRequested)}</Text>
            </View>
          </View>
          <Text style={styles.hint}>Ce motif sera visible par tous les membres, avec le montant.</Text>

          {/* Opérateur */}
          <Text style={styles.sectionTitle}>Choisissez l'opérateur</Text>
          <OperatorPicker operators={OPERATORS} value={selectedOperator} onChange={setSelectedOperator} />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={`Verser ${formatXOF(request.amountRequested)}`}
            disabled={!selectedOperator}
            onPress={handleOpenConfirm}
          />
        </View>

        {/* Confirmation du versement */}
        <Sheet visible={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirmer le versement">
          <Text style={styles.sheetText}>
            Vous êtes sur le point de verser{' '}
            <Text style={styles.sheetTextBold}>{formatXOF(request.amountRequested)}</Text> au numéro{' '}
            <Text style={styles.sheetTextBold}>{beneficiary?.user.phoneNumber ?? '—'}</Text>.
          </Text>

          {selectedOperator && (
            <View style={styles.payVia}>
              <Image source={operatorLogos[selectedOperator]} style={styles.payViaLogo} contentFit="contain" />
              <View style={styles.flex}>
                <Text style={styles.payViaLabel}>Paiement via</Text>
                <Text style={styles.payViaName}>{operatorName}</Text>
              </View>
            </View>
          )}

          <View style={styles.sheetActions}>
            <Button title="Annuler" variant="secondary" onPress={() => setShowConfirmModal(false)} style={styles.flex} />
            <Button title="Confirmer" onPress={handleDial} style={styles.flex} />
          </View>
        </Sheet>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  notFound: { marginTop: 40 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },

  balanceCard: {
    backgroundColor: colors.primary.dark,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  balanceLabel: { ...typography.footnote, color: 'rgba(255,255,255,0.72)' },
  balanceValue: { ...typography.display, color: '#FFFFFF', marginTop: 4 },

  summaryCard: { overflow: 'hidden' },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  summaryBlock: { paddingVertical: 14, paddingHorizontal: 16, gap: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginLeft: 16 },
  summaryLabel: { ...typography.footnote, color: colors.muted },
  summaryValue: { ...typography.callout, fontWeight: '600', color: colors.ink, flexShrink: 1, textAlign: 'right' },
  summaryValueStrong: { ...typography.bodyStrong, color: colors.primary.DEFAULT },
  summaryBeneficiary: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  summaryReason: { ...typography.callout, color: colors.inkSoft },
  hint: { ...typography.footnote, color: colors.muted, marginTop: 8, marginBottom: 24 },

  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginBottom: 12 },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },

  sheetText: { ...typography.body, color: colors.inkSoft },
  sheetTextBold: { fontWeight: '600', color: colors.ink },
  payVia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  payViaLogo: { width: 36, height: 36, borderRadius: 8 },
  payViaLabel: { ...typography.caption, fontWeight: '400', color: colors.muted },
  payViaName: { ...typography.callout, fontWeight: '600', color: colors.ink },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
