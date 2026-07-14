import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Coins } from 'lucide-react-native';
import { colors, spacing, radius } from '../../../../packages/design-tokens/src';
import { CircleType } from '../../../../packages/types/src';
import type { Circle } from '../../../../packages/types/src';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};

interface CircleCardProps {
  circle: Circle;
}

export default function CircleCard({ circle }: CircleCardProps) {
  const router = useRouter();

  const getCircleTypeStyle = () => {
    switch (circle.type) {
      case CircleType.TONTINE_ONLY:
        return { bg: colors.primary.tint, color: colors.primary.DEFAULT, label: 'Tontine' };
      case CircleType.SOLIDARITY_ONLY:
        return { bg: colors.purple.tint, color: colors.purple.DEFAULT, label: 'Solidarité' };
      default:
        return { bg: colors.accent.tint, color: colors.accent.DEFAULT, label: 'Hybride' };
    }
  };

  const style = getCircleTypeStyle();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/circle/${circle.id}`)}
    >
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: style.bg }]}>
          {circle.type === CircleType.TONTINE_ONLY ? (
            <Coins size={24} color={style.color} />
          ) : (
            <Users size={24} color={style.color} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{circle.name}</Text>
          <View style={[styles.badge, { backgroundColor: style.bg }]}>
            <Text style={[styles.badgeText, { color: style.color }]}>{style.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        {circle.type !== CircleType.SOLIDARITY_ONLY && (
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Cotisation</Text>
            <Text style={styles.detailValue}>{formatXOF(circle.tontineAmount)}</Text>
          </View>
        )}
        {circle.type !== CircleType.TONTINE_ONLY && (
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Solidarité</Text>
            <Text style={styles.detailValue}>{formatXOF(circle.solidarityAmount)}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Users size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{circle.memberCount} membres</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {circle.frequency === 'MONTHLY' ? 'Mensuel' : 'Hebdomadaire'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing[5],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  info: { flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Sora',
    marginBottom: spacing[2],
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 12, fontWeight: '600', fontFamily: 'WorkSans' },
  details: { flexDirection: 'row', gap: spacing[6], marginBottom: spacing[4] },
  detail: { flex: 1 },
  detailLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'WorkSans',
    marginBottom: spacing[1],
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Sora',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  metaText: { fontSize: 13, color: colors.textMuted, fontFamily: 'WorkSans' },
});
