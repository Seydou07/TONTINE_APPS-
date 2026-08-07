import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Coins } from 'lucide-react-native';
import { colors, spacing, radius } from '@venega/design-tokens';
import { CircleType } from '@venega/types';
import type { Circle } from '@venega/types';

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
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  info: { flex: 1 },
  name: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: { fontFamily: 'WorkSansSemiBold', fontSize: 12 },
  details: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detail: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailLabel: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: 'WorkSans', fontSize: 13, color: colors.textMuted },
});
