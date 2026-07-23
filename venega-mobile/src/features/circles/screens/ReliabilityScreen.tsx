import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@venega/design-tokens';
import { useRouter } from 'expo-router';
import { Shield, Check, Clock, AlertCircle, ChevronDown, ChevronUp, AlertTriangle, Ban } from 'lucide-react-native';
import { mockUsers, mockCircles, mockMemberships, mockReliabilityEvents } from '@venega/types';
import { ReliabilityEventType } from '@venega/types';

export default function ReliabilityScreen() {
  const router = useRouter();
  const currentUser = mockUsers.find((u) => u.id === 'u1');
  const userMemberships = mockMemberships.filter((m) => m.userId === 'u1');
  const userEvents = mockReliabilityEvents.filter((e: typeof mockReliabilityEvents[0]) => e.userId === 'u1');
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);

  if (!currentUser) return null;

  const lateEvents = userEvents.filter((e: typeof userEvents[0]) => e.type === ReliabilityEventType.LATE).length;
  const missedEvents = userEvents.filter((e: typeof userEvents[0]) => e.type === ReliabilityEventType.MISSED).length;
  const onTimeEvents = userEvents.filter((e: typeof userEvents[0]) => e.type === ReliabilityEventType.ON_TIME).length;
  const avgScore = userMemberships.length > 0
    ? Math.round(userMemberships.reduce((sum, m) => sum + (m.reliabilityScore || 0), 0) / userMemberships.length)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Shield size={22} color={colors.primary.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Score de fiabilité</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Global Score */}
        <View style={styles.globalCard}>
          <View style={[styles.scoreCircle, avgScore >= 80 ? styles.scoreGood : avgScore >= 50 ? styles.scoreMid : styles.scoreBad]}>
            <Text style={[styles.scoreText, avgScore >= 80 ? styles.scoreTextGood : avgScore >= 50 ? styles.scoreTextMid : styles.scoreTextBad]}>{avgScore}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.globalTitle}>Score global</Text>
            <Text style={styles.globalSub}>Moyenne de fiabilité dans tous vos cercles</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.success }]} /><Text style={styles.legendText}>{onTimeEvents} à temps</Text></View>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.warning.DEFAULT }]} /><Text style={styles.legendText}>{lateEvents} retard{lateEvents > 1 ? 's' : ''}</Text></View>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.danger.DEFAULT }]} /><Text style={styles.legendText}>{missedEvents} manqué{missedEvents > 1 ? 's' : ''}</Text></View>
            </View>
          </View>
        </View>

        {/* Score Explanation */}
        <View style={styles.explainCard}>
          <Text style={styles.explainTitle}>Comment fonctionne le score ?</Text>
          <View style={styles.explainRow}><Check size={14} color={colors.success} /><Text style={styles.explainText}>Paiement à temps = <Text style={{ fontWeight: '700', color: colors.success }}>+1 point</Text></Text></View>
          <View style={styles.explainRow}><Clock size={14} color={colors.warning.DEFAULT} /><Text style={styles.explainText}>Retard = <Text style={{ fontWeight: '700', color: colors.warning.DEFAULT }}>-1 point</Text></Text></View>
          <View style={styles.explainRow}><AlertCircle size={14} color={colors.danger.DEFAULT} /><Text style={styles.explainText}>Manqué = <Text style={{ fontWeight: '700', color: colors.danger.DEFAULT }}>-3 points</Text></Text></View>
        </View>

        {/* Per Circle */}
        <Text style={styles.sectionTitle}>Score par cercle</Text>
        {userMemberships.map((membership) => {
          const circle = mockCircles.find((c) => c.id === membership.circleId);
          const circleEvents = userEvents.filter((e: typeof userEvents[0]) => e.circleId === membership.circleId);
          const isExpanded = expandedCircle === membership.circleId;
          if (!circle) return null;

          return (
            <View key={membership.circleId} style={styles.circleCard}>
              <TouchableOpacity
                style={styles.circleCardHeader}
                onPress={() => setExpandedCircle(isExpanded ? null : membership.circleId)}
              >
                <View style={[styles.miniScore, membership.reliabilityScore >= 80 ? styles.miniScoreGood : membership.reliabilityScore >= 50 ? styles.miniScoreMid : styles.miniScoreBad]}>
                  <Text style={[styles.miniScoreText, membership.reliabilityScore >= 80 ? styles.miniScoreTextGood : membership.reliabilityScore >= 50 ? styles.miniScoreTextMid : styles.miniScoreTextBad]}>{membership.reliabilityScore}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.circleName}>{circle.name}</Text>
                  <Text style={styles.circleMeta}>{circleEvents.length} événement{circleEvents.length > 1 ? 's' : ''} — Tour {membership.turnOrder || '—'}</Text>
                </View>
                <View style={[styles.statusBadge, membership.reliabilityScore >= 80 ? styles.badgeGood : membership.reliabilityScore >= 50 ? styles.badgeMid : styles.badgeBad]}>
                  <Text style={[styles.badgeText, membership.reliabilityScore >= 80 ? styles.badgeTextGood : membership.reliabilityScore >= 50 ? styles.badgeTextMid : styles.badgeTextBad]}>
                    {membership.reliabilityScore >= 80 ? 'Bon' : membership.reliabilityScore >= 50 ? 'Moyen' : 'Critique'}
                  </Text>
                </View>
                {isExpanded ? <ChevronUp size={16} color={colors.textMuted} /> : <ChevronDown size={16} color={colors.textMuted} />}
              </TouchableOpacity>

              {isExpanded && circleEvents.map((event: typeof circleEvents[0]) => (
                <View key={event.id} style={styles.eventRow}>
                  <View style={[styles.eventDot, event.type === ReliabilityEventType.ON_TIME ? { backgroundColor: colors.success } : event.type === ReliabilityEventType.LATE ? { backgroundColor: colors.warning.DEFAULT } : { backgroundColor: colors.danger.DEFAULT }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventDesc}>{event.description}</Text>
                    <Text style={styles.eventDate}>{new Date(event.createdAt).toLocaleDateString('fr-FR')}</Text>
                  </View>
                  <Text style={[styles.eventImpact, event.scoreImpact > 0 ? { color: colors.success } : event.scoreImpact < 0 ? { color: colors.danger.DEFAULT } : {}]}>
                    {event.scoreImpact > 0 ? '+' : ''}{event.scoreImpact}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}

        {/* Warning */}
        {userMemberships.some((m) => m.reliabilityScore < 50) && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}><Ban size={18} color="#DC2626" /><Text style={styles.warningTitle}>Avertissement</Text></View>
            <Text style={styles.warningBody}>
              Votre score de fiabilité est bas. Un score inférieur à 0 bloque la réception de la cagnotte. Après 3 retards, le président peut vous exclure, ce qui vous bloquera dans tous les cercles.
            </Text>
          </View>
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
  globalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing[5], marginBottom: spacing[4] },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginRight: spacing[4] },
  scoreGood: { backgroundColor: '#ECFDF5' },
  scoreMid: { backgroundColor: '#FEF3C7' },
  scoreBad: { backgroundColor: '#FEE2E2' },
  scoreText: { fontSize: 28, fontWeight: '700', fontFamily: 'Sora' },
  scoreTextGood: { color: colors.success },
  scoreTextMid: { color: '#D97706' },
  scoreTextBad: { color: '#DC2626' },
  globalTitle: { fontSize: 16, fontWeight: '700', color: colors.text, fontFamily: 'Sora' },
  globalSub: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans', marginBottom: spacing[2] },
  legendRow: { flexDirection: 'row', gap: spacing[4] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans' },
  explainCard: { backgroundColor: '#F8F9FA', borderRadius: 14, padding: spacing[4], marginBottom: spacing[5] },
  explainTitle: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans', marginBottom: spacing[3] },
  explainRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing[2] },
  explainText: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: 'Sora', marginBottom: spacing[4] },
  circleCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: spacing[3], overflow: 'hidden' },
  circleCardHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing[4] },
  miniScore: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  miniScoreGood: { backgroundColor: '#ECFDF5' },
  miniScoreMid: { backgroundColor: '#FEF3C7' },
  miniScoreBad: { backgroundColor: '#FEE2E2' },
  miniScoreText: { fontSize: 16, fontWeight: '700', fontFamily: 'Sora' },
  miniScoreTextGood: { color: colors.success },
  miniScoreTextMid: { color: '#D97706' },
  miniScoreTextBad: { color: '#DC2626' },
  circleName: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'WorkSans' },
  circleMeta: { fontSize: 12, color: colors.textMuted, fontFamily: 'WorkSans' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: spacing[2] },
  badgeGood: { backgroundColor: '#ECFDF5' },
  badgeMid: { backgroundColor: '#FEF3C7' },
  badgeBad: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'WorkSans' },
  badgeTextGood: { color: colors.success },
  badgeTextMid: { color: '#D97706' },
  badgeTextBad: { color: '#DC2626' },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderTopWidth: 1, borderTopColor: colors.border },
  eventDot: { width: 6, height: 6, borderRadius: 3, marginRight: spacing[3] },
  eventDesc: { fontSize: 13, color: colors.text, fontFamily: 'WorkSans' },
  eventDate: { fontSize: 11, color: colors.textMuted, fontFamily: 'WorkSans', marginTop: 2 },
  eventImpact: { fontSize: 13, fontWeight: '700', fontFamily: 'Sora' },
  warningCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 14, padding: spacing[5], marginTop: spacing[4] },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing[3] },
  warningTitle: { fontSize: 16, fontWeight: '700', color: '#DC2626', fontFamily: 'Sora' },
  warningBody: { fontSize: 13, color: '#6B7280', fontFamily: 'WorkSans', lineHeight: 19 },
});
