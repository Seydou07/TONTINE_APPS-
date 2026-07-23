import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldAlert, AlertTriangle, Check, Ban, Clock, TrendingDown } from 'lucide-react-native';
import { mockCircles, mockMemberships, mockReliabilityEvents, mockUsers } from '@venega/types';
import { ReliabilityEventType } from '@venega/types';

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exclure un membre</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.ruleCard}>
          <Text style={styles.ruleTitle}>Règle du cercle</Text>
          <Text style={styles.ruleText}>
            Seuil d'exclusion : <Text style={{ fontWeight: '700' }}>{exclusionThreshold} retards</Text> minimum avant de pouvoir exclure un membre.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Membres avec retards</Text>
        {memberships.map((m) => {
          const lateCount = getLateCount(m.userId);
          const isEligible = canExclude(m.userId);
          const isSelected = selectedMember === m.userId;

          return (
            <TouchableOpacity
              key={m.userId}
              style={[styles.memberCard, isSelected && styles.memberCardActive, !isEligible && styles.memberCardDisabled]}
              onPress={() => isEligible && setSelectedMember(m.userId)}
              disabled={!isEligible}
            >
              <View style={styles.memberHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.user.firstName} {m.user.lastName}</Text>
                  <Text style={styles.memberMeta}>Score : {m.reliabilityScore}/100</Text>
                </View>
                {isSelected && <Check size={18} color={colors.primary.DEFAULT} />}
              </View>

              <View style={styles.delayRow}>
                <View style={styles.delayIndicator}>
                  {Array.from({ length: exclusionThreshold }).map((_, i) => (
                    <View
                      key={i}
                      style={[styles.delayDot, i < lateCount ? (i < exclusionThreshold ? styles.delayDotFilled : styles.delayDotWarning) : styles.delayDotEmpty]}
                    />
                  ))}
                </View>
                <Text style={[styles.delayCount, isEligible ? { color: colors.danger.DEFAULT } : { color: colors.warning.DEFAULT }]}>
                  {lateCount}/{exclusionThreshold} retards
                </Text>
              </View>

              {!isEligible && (
                <Text style={styles.notEligible}>
                  {exclusionThreshold - lateCount} retard(s) de plus avant exclusion possible
                </Text>
              )}

              {isEligible && (
                <View style={styles.consequencesBox}>
                  <Text style={styles.consequencesTitle}>Conséquences de l'exclusion :</Text>
                  <Text style={styles.consequenceItem}>• Bloqué sur tous les cercles Venega</Text>
                  <Text style={styles.consequenceItem}>• Ne peut plus rejoindre de nouveau cercle</Text>
                  <Text style={styles.consequenceItem}>• Risque de poursuites judiciaires pour impayés</Text>
                  <Text style={styles.consequenceItem}>• Dépôt de garantie non remboursé</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {memberships.every((m) => !canExclude(m.userId)) && (
          <View style={styles.emptyCard}>
            <Clock size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucun membre éligible</Text>
            <Text style={styles.emptyText}>
              Aucun membre n'a atteint le seuil de {exclusionThreshold} retards. Vous ne pouvez exclure personne pour le moment.
            </Text>
          </View>
        )}

        {memberships.some((m) => canExclude(m.userId)) && (
          <TouchableOpacity
            style={[styles.submitBtn, !selectedMember && styles.submitBtnDisabled]}
            disabled={!selectedMember}
            onPress={handleSubmit}
          >
            <Ban size={18} color="#fff" />
            <Text style={styles.submitText}>Exclure le membre</Text>
          </TouchableOpacity>
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

  ruleCard: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 14, padding: spacing[4], marginBottom: spacing[5] },
  ruleTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', fontFamily: 'Sora', marginBottom: spacing[2] },
  ruleText: { fontSize: 13, color: '#92400E', fontFamily: 'WorkSans', lineHeight: 18 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[4] },

  memberCard: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: '#E9ECEF', borderRadius: 14, padding: spacing[4], marginBottom: spacing[3] },
  memberCardActive: { backgroundColor: '#FEF2F2', borderColor: colors.danger.DEFAULT },
  memberCardDisabled: { opacity: 0.6 },
  memberHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3] },
  memberName: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: 2 },
  memberMeta: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans' },

  delayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
  delayIndicator: { flexDirection: 'row', gap: 4 },
  delayDot: { width: 10, height: 10, borderRadius: 5 },
  delayDotEmpty: { backgroundColor: '#E5E7EB' },
  delayDotFilled: { backgroundColor: colors.danger.DEFAULT },
  delayDotWarning: { backgroundColor: colors.warning.DEFAULT },
  delayCount: { fontSize: 13, fontWeight: '700', fontFamily: 'Sora' },

  notEligible: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans', fontStyle: 'italic' },

  consequencesBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: spacing[3] },
  consequencesTitle: { fontSize: 12, fontWeight: '700', color: colors.danger.DEFAULT, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  consequenceItem: { fontSize: 12, color: '#7F1D1D', fontFamily: 'WorkSans', lineHeight: 18 },

  emptyCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[6], alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginTop: spacing[3], marginBottom: spacing[2] },
  emptyText: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans', textAlign: 'center', lineHeight: 18 },

  submitBtn: { flexDirection: 'row', backgroundColor: colors.danger.DEFAULT, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing[4] },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'WorkSans' },
});
