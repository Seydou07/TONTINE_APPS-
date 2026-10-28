import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, typography } from '@venega/design-tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, Ban, Clock } from 'lucide-react-native';
import { mockCircles, mockMemberships, mockReliabilityEvents } from '@venega/types';
import { ReliabilityEventType } from '@venega/types';
import { Avatar, Button } from '../../../components/ui';
import {
  ScreenHeader,
  ScreenFooter,
  SectionTitle,
  Notice,
  CenteredState,
  actionStyles,
} from '../components/ActionScreenParts';

export default function ExclusionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = mockCircles.find((c) => c.id === circleId) ?? mockCircles[0];
  const memberships = mockMemberships.filter((m) => m.circleId === circleId && m.userId !== 'u1');
  const circleEvents = mockReliabilityEvents.filter((e) => e.circleId === circleId);

  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  if (!circle) return null;

  const exclusionThreshold = circle.exclusionThreshold;

  const getLateCount = (userId: string) =>
    circleEvents.filter((e) => e.userId === userId && (e.type === ReliabilityEventType.LATE || e.type === ReliabilityEventType.MISSED)).length;

  const canExclude = (userId: string) => getLateCount(userId) >= exclusionThreshold;

  const handleSubmit = () => {
    if (!selectedMember) return;
    const member = memberships.find((m) => m.userId === selectedMember);
    Alert.alert(
      'Exclure ce membre ?',
      `${member?.user.firstName} ${member?.user.lastName} sera marqué(e) comme exclu(e). Cette information sera visible par tous les autres cercles de la plateforme.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Exclure',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Exclusion confirmée', 'Le membre a été exclu du cercle et bloqué sur la plateforme.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const anyEligible = memberships.some((m) => canExclude(m.userId));

  return (
    <SafeAreaView style={actionStyles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Exclure un membre" subtitle={circle.name} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={actionStyles.scroll} showsVerticalScrollIndicator={false}>
        <Notice icon={AlertTriangle} tone="warning" title="Règle du cercle">
          Un membre peut être exclu à partir de {exclusionThreshold} retards.
        </Notice>

        <SectionTitle style={styles.sectionGap}>Membres avec retards</SectionTitle>
        <View style={styles.list}>
          {memberships.map((m) => {
            const lateCount = getLateCount(m.userId);
            const isEligible = canExclude(m.userId);
            const isSelected = selectedMember === m.userId;

            return (
              <TouchableOpacity
                key={m.userId}
                style={[styles.memberCard, isSelected && styles.memberCardActive]}
                onPress={() => isEligible && setSelectedMember(m.userId)}
                disabled={!isEligible}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected, disabled: !isEligible }}
              >
                <View style={styles.memberHeader}>
                  <Avatar name={`${m.user.firstName} ${m.user.lastName}`} uri={m.user.avatarUrl} size={40} />
                  <View style={styles.memberText}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {m.user.firstName} {m.user.lastName}
                    </Text>
                    <Text style={styles.memberMeta}>Fiabilité {m.reliabilityScore}/100</Text>
                  </View>
                  {isEligible ? (
                    <View style={[styles.radio, isSelected && styles.radioOn]}>
                      {isSelected ? <View style={styles.radioDot} /> : null}
                    </View>
                  ) : null}
                </View>

                <View style={styles.delayRow}>
                  <View style={styles.delayDots}>
                    {Array.from({ length: exclusionThreshold }).map((_, i) => (
                      <View key={i} style={[styles.delayDot, i < lateCount && styles.delayDotFilled]} />
                    ))}
                  </View>
                  <Text style={[styles.delayCount, isEligible ? styles.delayDanger : styles.delayWarn]}>
                    {lateCount}/{exclusionThreshold} retards
                  </Text>
                </View>

                {!isEligible ? (
                  <Text style={styles.notEligible}>
                    Encore {exclusionThreshold - lateCount} retard(s) avant qu'une exclusion soit possible
                  </Text>
                ) : (
                  <View style={styles.consequences}>
                    <Text style={styles.consequencesTitle}>Conséquences de l'exclusion</Text>
                    <Text style={styles.consequenceItem}>• Bloqué sur tous les cercles Venega</Text>
                    <Text style={styles.consequenceItem}>• Ne peut plus rejoindre de nouveau cercle</Text>
                    <Text style={styles.consequenceItem}>• Risque de poursuites judiciaires pour impayés</Text>
                    <Text style={styles.consequenceItem}>• Dépôt de garantie non remboursé</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {!anyEligible && (
          <CenteredState
            icon={Clock}
            tone="neutral"
            title="Aucun membre éligible"
            text={`Aucun membre n'a atteint le seuil de ${exclusionThreshold} retards. Vous ne pouvez exclure personne pour le moment.`}
          />
        )}
      </ScrollView>

      {anyEligible && (
        <ScreenFooter>
          <Button
            title="Exclure le membre"
            icon={Ban}
            variant="danger"
            onPress={handleSubmit}
            disabled={!selectedMember}
          />
        </ScreenFooter>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionGap: { marginTop: 24 },
  list: { gap: 12 },

  memberCard: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 16,
  },
  memberCardActive: { borderColor: colors.danger.DEFAULT, borderWidth: 1.5 },
  memberHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  memberText: { flex: 1 },
  memberName: { ...typography.callout, fontWeight: '600', color: colors.ink },
  memberMeta: { ...typography.footnote, color: colors.muted, marginTop: 1 },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOn: { borderColor: colors.danger.DEFAULT },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.danger.DEFAULT },

  delayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  delayDots: { flexDirection: 'row', gap: 4, flexShrink: 1, flexWrap: 'wrap' },
  delayDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.line },
  delayDotFilled: { backgroundColor: colors.danger.DEFAULT },
  delayCount: { ...typography.footnote, fontWeight: '600', marginLeft: 12 },
  delayDanger: { color: colors.danger.DEFAULT },
  delayWarn: { color: colors.accent.deep },

  notEligible: { ...typography.footnote, color: colors.muted },

  consequences: { backgroundColor: colors.danger.tint, borderRadius: radius.sm, padding: 12 },
  consequencesTitle: { ...typography.footnote, fontWeight: '600', color: colors.danger.dark, marginBottom: 4 },
  consequenceItem: { ...typography.footnote, color: colors.inkSoft },
});
