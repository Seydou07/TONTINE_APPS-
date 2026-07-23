import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calculator, TrendingDown, TrendingUp, Check, AlertTriangle, Info } from 'lucide-react-native';
import { mockCircles, mockMemberships, mockCycles } from '@venega/types';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

export default function RecalculateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = mockCircles.find((c) => c.id === circleId) ?? mockCircles[0];
  const cycle = mockCycles.find((c) => c.circleId === circleId && c.isActive);
  const memberships = mockMemberships.filter((m) => m.circleId === circleId);

  const [increasePercent, setIncreasePercent] = useState<string>('0');

  if (!circle) return null;

  const totalMembers = memberships.length;
  const membersAfterDeparture = totalMembers - 1;
  const currentTontine = circle.tontineAmount;
  const currentSolidarity = circle.solidarityAmount;
  const currentTotal = currentTontine + currentSolidarity;

  const remainingTurns = cycle ? cycle.totalTurns - cycle.currentTurn + 1 : 0;
  const increase = parseFloat(increasePercent) || 0;
  const increaseFactor = 1 + increase / 100;

  const newTontine = Math.round((currentTontine * totalMembers * increaseFactor) / membersAfterDeparture);
  const newSolidarity = circle.solidarityAmount > 0
    ? Math.round((currentSolidarity * totalMembers * increaseFactor) / membersAfterDeparture)
    : 0;
  const newTotal = newTontine + newSolidarity;

  const diff = newTotal - currentTotal;
  const poolImpact = diff * membersAfterDeparture * remainingTurns;

  const handleSubmit = () => {
    Alert.alert(
      'Confirmer le recalcul',
      `Les cotisations passeront de ${formatXOF(currentTotal)} à ${formatXOF(newTotal)} par tour pour ${membersAfterDeparture} membres restants.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            Alert.alert('Recalcul appliqué', 'Les nouvelles cotisations seront appliquées au prochain tour.', [
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
        <Text style={styles.headerTitle}>Recalcul des cotisations</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Info size={16} color="#0369A1" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={styles.infoText}>
            Un membre est parti sans remplaçant. Les cotisations restantes sont recalculées pour {membersAfterDeparture} membres.
          </Text>
        </View>

        {/* Current vs New */}
        <View style={styles.compareRow}>
          <View style={styles.compareCard}>
            <Text style={styles.compareLabel}>Avant</Text>
            <Text style={styles.compareValue}>{formatXOF(currentTotal)}</Text>
            <Text style={styles.compareMeta}>{totalMembers} membres</Text>
          </View>
          <View style={styles.compareArrow}>
            <TrendingUp size={20} color={colors.primary.DEFAULT} />
          </View>
          <View style={[styles.compareCard, styles.compareCardNew]}>
            <Text style={[styles.compareLabel, { color: colors.primary.DEFAULT }]}>Après</Text>
            <Text style={[styles.compareValue, { color: colors.primary.DEFAULT }]}>{formatXOF(newTotal)}</Text>
            <Text style={styles.compareMeta}>{membersAfterDeparture} membres</Text>
          </View>
        </View>

        {/* Increase option */}
        <Text style={styles.sectionTitle}>Optionnel : augmenter les cotisations</Text>
        <Text style={styles.hint}>
          Vous pouvez augmenter les cotisations pour compenser le départ du membre et maintenir les gains des bénéficiaires.
        </Text>

        <View style={styles.optionsRow}>
          {['0', '5', '10', '15', '20'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionBtn, increasePercent === opt && styles.optionBtnActive]}
              onPress={() => setIncreasePercent(opt)}
            >
              <Text style={[styles.optionText, increasePercent === opt && styles.optionTextActive]}>
                {opt === '0' ? 'Aucune' : `+${opt}%`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {increase > 0 && (
          <View style={styles.increaseInfo}>
            <TrendingUp size={14} color={colors.primary.DEFAULT} />
            <Text style={styles.increaseText}>
              Augmentation de {increase}% : chaque membre paiera {formatXOF(diff)} de plus par tour
            </Text>
          </View>
        )}

        {/* Impact summary */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>Impact sur le cycle</Text>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Tours restants</Text>
            <Text style={styles.impactValue}>{remainingTurns}</Text>
          </View>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Gain bénéficiaire par tour</Text>
            <Text style={[styles.impactValue, { color: colors.success }]}>{formatXOF(newTontine * membersAfterDeparture)}</Text>
          </View>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Impact total sur le cycle</Text>
            <Text style={[styles.impactValue, increase > 0 ? { color: colors.primary.DEFAULT } : { color: colors.danger.DEFAULT }]}>
              {increase > 0 ? '+' : ''}{formatXOF(poolImpact)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Calculator size={18} color="#fff" />
          <Text style={styles.submitText}>Appliquer le recalcul</Text>
        </TouchableOpacity>
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

  infoCard: { flexDirection: 'row', backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 14, padding: spacing[4], marginBottom: spacing[5] },
  infoText: { flex: 1, fontSize: 13, color: '#0C4A6E', fontFamily: 'WorkSans', lineHeight: 18 },

  compareRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[5] },
  compareCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], alignItems: 'center' },
  compareCardNew: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  compareLabel: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  compareValue: { fontSize: 20, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  compareMeta: { fontSize: 11, color: colors.textMuted, fontFamily: 'WorkSans', marginTop: spacing[1] },
  compareArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary.tint, justifyContent: 'center', alignItems: 'center' },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[2] },
  hint: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans', lineHeight: 18, marginBottom: spacing[4] },

  optionsRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  optionBtn: { flex: 1, backgroundColor: '#F8F9FA', borderWidth: 1.5, borderColor: '#E9ECEF', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  optionBtnActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  optionText: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  optionTextActive: { color: '#059669' },

  increaseInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary.tint, borderRadius: 10, padding: spacing[3], marginBottom: spacing[4] },
  increaseText: { flex: 1, fontSize: 12, color: colors.primary.DEFAULT, fontFamily: 'WorkSans', fontWeight: '600' },

  impactCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[4], marginBottom: spacing[4] },
  impactTitle: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[3] },
  impactRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2] },
  impactLabel: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
  impactValue: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },

  submitBtn: { flexDirection: 'row', backgroundColor: colors.primary.DEFAULT, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing[2] },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },
});
