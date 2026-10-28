import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, typography } from '@venega/design-tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Calculator, Info, TrendingUp } from 'lucide-react-native';
import { mockCircles, mockMemberships, mockCycles } from '@venega/types';
import { Button, Chip } from '../../../components/ui';
import {
  ScreenHeader,
  ScreenFooter,
  Card,
  SectionTitle,
  Notice,
  KeyValue,
  actionStyles,
} from '../components/ActionScreenParts';

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
    <SafeAreaView style={actionStyles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Recalcul des cotisations" subtitle={circle.name} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={actionStyles.scroll} showsVerticalScrollIndicator={false}>
        <Notice icon={Info} tone="info">
          Un membre est parti sans remplaçant. Les cotisations restantes sont recalculées pour {membersAfterDeparture}{' '}
          membres.
        </Notice>

        {/* Avant / après */}
        <View style={styles.compareRow}>
          <View style={styles.compareCard}>
            <Text style={styles.compareLabel}>Avant</Text>
            <Text style={styles.compareValue}>{formatXOF(currentTotal)}</Text>
            <Text style={styles.compareMeta}>{totalMembers} membres</Text>
          </View>
          <View style={styles.compareArrow}>
            <ArrowRight size={16} color={colors.muted} strokeWidth={2} />
          </View>
          <View style={[styles.compareCard, styles.compareCardNew]}>
            <Text style={[styles.compareLabel, styles.compareLabelNew]}>Après</Text>
            <Text style={[styles.compareValue, styles.compareValueNew]}>{formatXOF(newTotal)}</Text>
            <Text style={styles.compareMeta}>{membersAfterDeparture} membres</Text>
          </View>
        </View>

        {/* Hausse facultative */}
        <SectionTitle style={styles.sectionGap}>Augmenter les cotisations (facultatif)</SectionTitle>
        <Text style={styles.hint}>
          Une hausse compense le départ du membre et maintient les gains des bénéficiaires.
        </Text>
        <View style={styles.chips}>
          {['0', '5', '10', '15', '20'].map((opt) => (
            <Chip
              key={opt}
              label={opt === '0' ? 'Aucune' : `+${opt} %`}
              selected={increasePercent === opt}
              onPress={() => setIncreasePercent(opt)}
            />
          ))}
        </View>

        {increase > 0 && (
          <Notice icon={TrendingUp} tone="primary" style={styles.increaseNotice}>
            Hausse de {increase} % : chaque membre paiera {formatXOF(diff)} de plus par tour.
          </Notice>
        )}

        {/* Impact */}
        <SectionTitle style={styles.sectionGap}>Impact sur le cycle</SectionTitle>
        <Card style={styles.impactCard}>
          <KeyValue label="Tours restants" value={String(remainingTurns)} />
          <KeyValue
            label="Gain bénéficiaire par tour"
            value={formatXOF(newTontine * membersAfterDeparture)}
            valueColor={colors.primary.DEFAULT}
          />
          <KeyValue
            label="Impact total sur le cycle"
            value={`${increase > 0 ? '+' : ''}${formatXOF(poolImpact)}`}
            valueColor={increase > 0 ? colors.primary.DEFAULT : colors.danger.DEFAULT}
            last
          />
        </Card>
      </ScrollView>

      <ScreenFooter>
        <Button title="Appliquer le recalcul" icon={Calculator} onPress={handleSubmit} />
      </ScreenFooter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionGap: { marginTop: 24 },
  hint: { ...typography.footnote, color: colors.muted, marginBottom: 12, marginLeft: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  increaseNotice: { marginTop: 12 },

  compareRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  compareCard: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  compareCardNew: { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.tint },
  compareLabel: { ...typography.footnote, color: colors.muted },
  compareLabelNew: { color: colors.primary.dark, fontWeight: '600' },
  compareValue: { ...typography.headline, color: colors.ink, marginTop: 4, textAlign: 'center' },
  compareValueNew: { color: colors.primary.dark },
  compareMeta: { ...typography.caption, fontWeight: '400', color: colors.muted, marginTop: 2 },
  compareArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
  },

  impactCard: { paddingVertical: 4 },
});
