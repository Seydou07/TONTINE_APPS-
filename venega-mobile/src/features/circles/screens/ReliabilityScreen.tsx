import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { mockUsers, mockCircles, mockMemberships, mockReliabilityEvents } from '@venega/types';
import { ReliabilityEventType } from '@venega/types';
import { IconButton } from '../../../components/ui';

const rules: { icon: LucideIcon; fg: string; bg: string; title: string; sub: string }[] = [
  {
    icon: CheckCircle2,
    fg: colors.primary.DEFAULT,
    bg: colors.primary.tint,
    title: 'Paiement à temps (+1 point)',
    sub: 'Chaque virement effectué avant l’échéance renforce votre score.',
  },
  {
    icon: Clock,
    fg: colors.accent.dark,
    bg: colors.accent.tint,
    title: 'Retard de paiement (−1 point)',
    sub: 'Cotisation effectuée après la date limite du tour.',
  },
  {
    icon: AlertTriangle,
    fg: colors.danger.DEFAULT,
    bg: colors.danger.tint,
    title: 'Cotisation manquée (−3 points)',
    sub: 'Non-paiement du tour à la clôture du cercle.',
  },
];

export default function ReliabilityScreen() {
  const router = useRouter();
  const currentUser = mockUsers.find((u) => u.id === 'u1');
  const userMemberships = mockMemberships.filter((m) => m.userId === 'u1');
  const userEvents = mockReliabilityEvents.filter((e: typeof mockReliabilityEvents[0]) => e.userId === 'u1');
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);

  const lateEvents = userEvents.filter((e: typeof userEvents[0]) => e.type === ReliabilityEventType.LATE).length;
  const missedEvents = userEvents.filter((e: typeof userEvents[0]) => e.type === ReliabilityEventType.MISSED).length;
  const onTimeEvents = userEvents.filter((e: typeof userEvents[0]) => e.type === ReliabilityEventType.ON_TIME).length;

  const avgScore = userMemberships.length > 0
    ? Math.round(userMemberships.reduce((sum, m) => sum + (m.reliabilityScore || 0), 0) / userMemberships.length)
    : 98;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── En-tête ── */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Score de fiabilité</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Score global ── */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Fiabilité globale</Text>
            <View style={styles.scoreValueRow}>
              <Text style={styles.scoreValue}>{avgScore}%</Text>
              <View style={styles.scoreTag}>
                <Text style={styles.scoreTagText}>Excellent</Text>
              </View>
            </View>
            <Text style={styles.scoreSub}>Basée sur l’ensemble de vos cotisations passées</Text>
            <View style={styles.scoreStats}>
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatValue}>{onTimeEvents || 12}</Text>
                <Text style={styles.scoreStatLabel}>À temps</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatValue}>{lateEvents || 1}</Text>
                <Text style={styles.scoreStatLabel}>En retard</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatValue}>{missedEvents || 0}</Text>
                <Text style={styles.scoreStatLabel}>Manquées</Text>
              </View>
            </View>
          </View>

          {/* ── Calcul du score ── */}
          <Text style={styles.sectionTitle}>Comment est calculé votre score ?</Text>
          <View style={styles.card}>
            {rules.map(({ icon: Icon, fg, bg, title, sub }, i) => (
              <View key={title} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: bg }]}>
                  <Icon size={20} color={fg} strokeWidth={1.8} />
                </View>
                <View style={[styles.rowBody, i < rules.length - 1 && styles.rowBorder]}>
                  <Text style={styles.rowTitle}>{title}</Text>
                  <Text style={styles.rowSub}>{sub}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Détail par cercle ── */}
          <Text style={styles.sectionTitle}>Détails par cercle</Text>
          <View style={styles.circleList}>
            {userMemberships.map((membership) => {
              const circle = mockCircles.find((c) => c.id === membership.circleId);
              const circleEvents = userEvents.filter((e: typeof userEvents[0]) => e.circleId === membership.circleId);
              const isExpanded = expandedCircle === membership.circleId;
              if (!circle) return null;

              return (
                <View key={membership.circleId} style={styles.card}>
                  <TouchableOpacity
                    style={styles.circleHeader}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                    onPress={() => setExpandedCircle(isExpanded ? null : membership.circleId)}
                  >
                    <View style={styles.circleBadge}>
                      <Text style={styles.circleBadgeText}>{membership.reliabilityScore || 98}%</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {circle.name}
                      </Text>
                      <Text style={styles.rowSub}>
                        Tour {membership.turnOrder || 1} · {circleEvents.length || 4} transactions
                      </Text>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={18} color={colors.muted} />
                    ) : (
                      <ChevronDown size={18} color={colors.subtle} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.events}>
                      {(circleEvents.length > 0 ? circleEvents : [
                        { id: 'ev1', description: 'Paiement du Tour 1 à temps', scoreImpact: 1, createdAt: '2026-08-01' },
                        { id: 'ev2', description: 'Paiement du Tour 2 à temps', scoreImpact: 1, createdAt: '2026-08-10' },
                      ]).map((event: any) => (
                        <View key={event.id} style={styles.eventRow}>
                          <CheckCircle2 size={16} color={colors.primary.DEFAULT} />
                          <Text style={styles.eventText}>{event.description}</Text>
                          <Text style={styles.eventImpact}>+{event.scoreImpact}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fill },
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  headerTitle: { flex: 1, ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSpacer: { width: 40 },

  scroll: { padding: 16, paddingBottom: 40, backgroundColor: colors.fill, flexGrow: 1 },

  scoreCard: {
    backgroundColor: colors.primary.dark,
    borderRadius: 24,
    padding: 20,
  },
  scoreLabel: { ...typography.footnote, color: 'rgba(255,255,255,0.72)' },
  scoreValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  scoreValue: { ...typography.display, color: '#FFFFFF' },
  scoreTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  scoreTagText: { ...typography.caption, color: '#FFFFFF' },
  scoreSub: { ...typography.footnote, color: 'rgba(255,255,255,0.72)', marginTop: 4 },
  scoreStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  scoreStat: { flex: 1 },
  scoreStatValue: { ...typography.bodyStrong, color: '#FFFFFF' },
  scoreStatLabel: { ...typography.caption, fontWeight: '400', color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  scoreDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 12 },

  sectionTitle: { ...typography.headline, color: colors.ink, marginTop: 28, marginBottom: 10, marginHorizontal: 4 },

  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  circleList: { gap: 10 },

  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, gap: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowBody: { flex: 1, paddingVertical: 14, paddingRight: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  rowSub: { ...typography.footnote, color: colors.muted, marginTop: 2 },

  circleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  circleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBadgeText: { ...typography.footnote, fontWeight: '700', color: colors.primary.dark },

  events: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eventText: { ...typography.footnote, color: colors.inkSoft, flex: 1 },
  eventImpact: { ...typography.footnote, fontWeight: '700', color: colors.primary.DEFAULT },
});
