import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Calendar, SlidersHorizontal } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Avatar, Button } from '../../../components/ui';

/*
 * Briques communes de l'onglet « Aperçu » et de la navigation des écrans de cercle
 * (Tontine et Caisse de solidarité). Les deux écrans les assemblent dans le même
 * ordre : carte de synthèse verte → carte « Prochain versement » → carte d'action
 * du fondateur → historique.
 */

/* ── Onglets ── */

export function CircleTabBar({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {children}
      </ScrollView>
    </View>
  );
}

export function CircleTab({
  label,
  active,
  badge,
  onPress,
}: {
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
    >
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
      {!!badge && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ── Carte de synthèse (verte) ── */

export type SummaryStat = {
  label: string;
  value: string;
  /** Affiche un petit avatar avant la valeur (ex. bénéficiaire du tour). */
  person?: { name: string; uri?: string | null };
};

export function OverviewSummaryCard({
  label,
  amount,
  negative,
  stats,
  progress,
}: {
  label: string;
  amount: string;
  negative?: boolean;
  stats: SummaryStat[];
  /** Entre 0 et 1 — fine barre de progression sous les statistiques. */
  progress?: number;
}) {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryAmount, negative && styles.summaryAmountNegative]}>{amount}</Text>
      <View style={styles.summaryStats}>
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <View style={styles.summaryDivider} />}
            <StatRow stat={s} />
          </React.Fragment>
        ))}
      </View>
      {progress !== undefined && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
        </View>
      )}
    </View>
  );
}

export function StatRow({ stat }: { stat: SummaryStat }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <View style={styles.statValueRow}>
        {stat.person && <Avatar name={stat.person.name} uri={stat.person.uri} size={24} highlighted />}
        <Text style={styles.statValue} numberOfLines={1}>
          {stat.value}
        </Text>
      </View>
    </View>
  );
}

/* ── Carte « Prochain versement » ── */

export function DueCard({ amount, daysLeft, onPay }: { amount: string; daysLeft?: number | null; onPay: () => void }) {
  const when = daysLeft != null ? ` · dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : '';
  return (
    <View style={styles.card}>
      <View style={styles.iconTile}>
        <Calendar size={20} color={colors.primary.DEFAULT} strokeWidth={1.8} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardSub}>Prochain versement{when}</Text>
        <Text style={styles.dueAmount}>{amount}</Text>
      </View>
      <Button title="Payer" size="sm" onPress={onPay} />
    </View>
  );
}

/* ── Carte d'action du fondateur ── */

export function ActionCard({
  icon: Icon,
  title,
  sub,
  actionLabel,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconTile}>
        <Icon size={20} color={colors.primary.DEFAULT} strokeWidth={1.8} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      <Button title={actionLabel} size="sm" onPress={onPress} />
    </View>
  );
}

/* ── En-tête de section (Historique) ── */

export function OverviewSectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}

/** Bouton « Filtrer » de l'historique, identique dans les deux écrans. */
export function HistoryFilterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterBtn, active && styles.filterBtnActive]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Filtrer par mois"
      onPress={onPress}
    >
      <SlidersHorizontal size={14} color={active ? colors.primary.DEFAULT : colors.muted} />
      <Text style={[styles.filterBtnText, active && styles.filterBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Conteneur des cartes du haut de l'aperçu (espacement identique dans les deux écrans). */
export function OverviewStack({ children }: { children: React.ReactNode }) {
  return <View style={styles.stack}>{children}</View>;
}

const styles = StyleSheet.create({
  /* Onglets */
  tabBar: {
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  tabRow: { paddingHorizontal: 12, gap: 4 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.primary.DEFAULT },
  tabBtnText: { ...typography.callout, fontWeight: '500', color: colors.muted },
  tabBtnTextActive: { color: colors.primary.DEFAULT, fontWeight: '600' },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: colors.danger.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: { fontSize: 11, lineHeight: 14, fontWeight: '700', color: '#FFFFFF' },

  stack: { gap: 12 },

  /* Synthèse */
  summary: {
    backgroundColor: colors.primary.dark,
    borderRadius: 24,
    padding: 20,
  },
  summaryLabel: { ...typography.footnote, color: 'rgba(255,255,255,0.72)' },
  summaryAmount: { ...typography.display, color: '#FFFFFF', marginTop: 4 },
  summaryAmountNegative: { color: colors.danger.tint },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  stat: { flex: 1, minWidth: 0 },
  statLabel: { ...typography.caption, fontWeight: '400', color: 'rgba(255,255,255,0.72)' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, minHeight: 24 },
  statValue: { ...typography.bodyStrong, color: '#FFFFFF', flexShrink: 1 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.accent.DEFAULT },

  /* Cartes blanches */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1, flexShrink: 1 },
  cardTitle: { ...typography.callout, fontWeight: '600', color: colors.ink },
  cardSub: { ...typography.footnote, color: colors.muted, marginTop: 1 },
  dueAmount: { ...typography.headline, color: colors.ink, marginTop: 2 },

  /* Sections */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: { ...typography.headline, color: colors.ink },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  filterBtnActive: { borderColor: colors.primary.soft, backgroundColor: colors.primary.tint },
  filterBtnText: { ...typography.footnote, fontWeight: '600', color: colors.muted },
  filterBtnTextActive: { color: colors.primary.DEFAULT },
});
