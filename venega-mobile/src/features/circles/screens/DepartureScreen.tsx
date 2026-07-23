import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, AlertTriangle, LogOut, Check, ShieldAlert, TrendingDown } from 'lucide-react-native';
import { mockCircles, mockMemberships, mockCycles, mockTransactions, mockUsers } from '@venega/types';
import { TransactionType } from '@venega/types';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

export default function DepartureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = mockCircles.find((c) => c.id === circleId) ?? mockCircles[0];
  const cycle = mockCycles.find((c) => c.circleId === circleId && c.isActive);
  const memberships = mockMemberships.filter((m) => m.circleId === circleId);
  const currentMembership = memberships.find((m) => m.userId === 'u1');
  const user = mockUsers[0];

  const [confirmed, setConfirmed] = useState(false);

  if (!circle || !currentMembership || !user) return null;

  const hasReceivedPayout = currentMembership.hasReceivedPayout;
  const pastTurns = cycle ? cycle.currentTurn - 1 : 0;
  const totalContributed = pastTurns * circle.tontineAmount;
  const remainingTurns = cycle ? cycle.totalTurns - cycle.currentTurn + 1 : 0;
  const futureLost = remainingTurns * circle.tontineAmount;

  const handleSubmit = () => {
    Alert.alert(
      'Confirmer le départ',
      'Vous allez quitter ce cercle. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Demande envoyée', 'Votre demande de départ a été transmise au président.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quitter le cercle</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Blocked if already received payout */}
        {hasReceivedPayout ? (
          <View style={styles.blockedCard}>
            <View style={styles.blockedIcon}>
              <ShieldAlert size={28} color={colors.danger.DEFAULT} />
            </View>
            <Text style={styles.blockedTitle}>Départ impossible</Text>
            <Text style={styles.blockedText}>
              Vous avez déjà reçu la cagnotte de ce cercle. Selon les règles, un membre qui a touché son gain ne peut pas quitter le cercle avant la fin du cycle.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.back()}>
              <Text style={styles.btnPrimaryText}>Retour</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Consequences */}
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <AlertTriangle size={20} color="#92400E" />
                <Text style={styles.warningTitle}>Conséquences du départ</Text>
              </View>
              <Text style={styles.warningText}>
                En quittant ce cercle avant la fin du cycle, vous allez perdre :
              </Text>
            </View>

            {/* Loss summary */}
            <View style={styles.lossCard}>
              <View style={styles.lossRow}>
                <TrendingDown size={16} color={colors.danger.DEFAULT} />
                <Text style={styles.lossLabel}>Cotisations déjà versées</Text>
                <Text style={[styles.lossValue, { color: colors.danger.DEFAULT }]}>{formatXOF(totalContributed)}</Text>
              </View>
              <View style={styles.lossDivider} />
              <View style={styles.lossRow}>
                <Text style={styles.lossLabel}>Tours restants (vous auriez touché)</Text>
                <Text style={styles.lossValue}>{remainingTurns} tours</Text>
              </View>
              <View style={styles.lossRow}>
                <Text style={styles.lossLabel}>Potentiel perdu</Text>
                <Text style={[styles.lossValue, { color: colors.danger.DEFAULT }]}>{formatXOF(futureLost)}</Text>
              </View>
              <View style={styles.lossDivider} />
              <View style={styles.lossRow}>
                <Text style={[styles.lossLabel, { fontWeight: '700', color: colors.text }]}>Perte totale</Text>
                <Text style={[styles.lossValue, { color: colors.danger.DEFAULT, fontSize: 18 }]}>{formatXOF(totalContributed)}</Text>
              </View>
            </View>

            {/* Circle will recalculate */}
            {circle.recalculateOnLeave && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Recalcul des cotisations</Text>
                <Text style={styles.infoText}>
                  Votre départ déclenchera un recalcul des cotisations pour les membres restants. Le président sera notifié.
                </Text>
              </View>
            )}

            {!circle.recalculateOnLeave && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Impact sur le cercle</Text>
                <Text style={styles.infoText}>
                  Sans remplaçant, la cagnotte des bénéficiaires suivants sera réduite. Le président sera notifié.
                </Text>
              </View>
            )}

            {/* Confirmation */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setConfirmed(!confirmed)}
            >
              <View style={[styles.checkbox, confirmed && styles.checkboxActive]}>
                {confirmed && <Check size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>
                Je comprends que je perds {formatXOF(totalContributed)} de cotisations et que cette action est irréversible
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, !confirmed && styles.submitBtnDisabled]}
              disabled={!confirmed}
              onPress={handleSubmit}
            >
              <LogOut size={18} color="#fff" />
              <Text style={styles.submitText}>Confirmer le départ</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  scroll: { padding: spacing[5], paddingBottom: 40 },

  blockedCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 14, padding: spacing[5], alignItems: 'center' },
  blockedIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[4] },
  blockedTitle: { fontSize: 18, fontWeight: '700', color: colors.danger.DEFAULT, fontFamily: 'Sora', marginBottom: spacing[3] },
  blockedText: { fontSize: 14, color: '#7F1D1D', fontFamily: 'WorkSans', textAlign: 'center', lineHeight: 20, marginBottom: spacing[5] },

  warningCard: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 14, padding: spacing[4], marginBottom: spacing[4] },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing[2] },
  warningTitle: { fontSize: 15, fontWeight: '700', color: '#92400E', fontFamily: 'Sora' },
  warningText: { fontSize: 14, color: '#92400E', fontFamily: 'WorkSans', lineHeight: 20 },

  lossCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[4] },
  lossRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[2] },
  lossLabel: { flex: 1, fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
  lossValue: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginLeft: spacing[3] },
  lossDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing[2] },

  infoCard: { backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 14, padding: spacing[4], marginBottom: spacing[4] },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#0369A1', fontFamily: 'WorkSans', marginBottom: spacing[2] },
  infoText: { fontSize: 13, color: '#0C4A6E', fontFamily: 'WorkSans', lineHeight: 18 },

  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[4] },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: colors.danger.DEFAULT, borderColor: colors.danger.DEFAULT },
  checkboxLabel: { flex: 1, fontSize: 13, color: colors.text, fontFamily: 'WorkSans', lineHeight: 18 },

  submitBtn: { flexDirection: 'row', backgroundColor: colors.danger.DEFAULT, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing[2] },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },

  btnPrimary: { backgroundColor: colors.primary.DEFAULT, borderRadius: 14, paddingVertical: 14, paddingHorizontal: spacing[5], alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },
});
