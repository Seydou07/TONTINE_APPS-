import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Coins, Users, HeartHandshake } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { colors, radius } from '@venega/design-tokens';
import { CircleType, Frequency } from '@venega/types';
import type { Circle } from '@venega/types';
import { mockUsers } from '@venega/types';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' F';
};

const CYCLE_PROGRESS: Record<string, number> = {
  c1: 0.5,
  c2: 0.4,
  c3: 0.55,
};

const CYCLE_TURN: Record<string, string> = {
  c1: 'Tour 3/6',
  c2: 'Tour 4/10',
  c3: 'Solidarité',
};

interface CircleCardProps {
  circle: Circle;
}

export default function CircleCard({ circle }: CircleCardProps) {
  const router = useRouter();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(CYCLE_PROGRESS[circle.id] ?? 0.5, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as `${number}%`,
  }));

  const getStyle = () => {
    switch (circle.type) {
      case CircleType.TONTINE_ONLY:
        return { gradient: ['#0B6E4F', '#0F8563'] as [string, string], icon: Coins };
      case CircleType.SOLIDARITY_ONLY:
        return { gradient: ['#7A4E9C', '#9A6FB8'] as [string, string], icon: HeartHandshake };
      default:
        return { gradient: ['#0F8563', '#D9A441'] as [string, string], icon: Users };
    }
  };

  const style = getStyle();
  const StyleIcon = style.icon;
  const avatars = mockUsers.slice(0, Math.min(circle.memberCount, 4)).map((u) => u.avatarUrl);

  const frequencyLabel = circle.frequency === Frequency.WEEKLY ? 'Hebdo' : 'Mensuel';
  const amount =
    circle.type === CircleType.SOLIDARITY_ONLY
      ? circle.solidarityAmount
      : circle.tontineAmount;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/circle/${circle.id}`)}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={style.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.icon}
        >
          <StyleIcon size={22} color="#FFFFFF" strokeWidth={1.9} />
        </LinearGradient>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{circle.name}</Text>
          <Text style={styles.subtext}>
            {frequencyLabel} · {formatXOF(amount)} · {circle.memberCount} membres
          </Text>
        </View>
        <View style={styles.turnChip}>
          <Text style={styles.turnText}>{CYCLE_TURN[circle.id] ?? 'Tour 1/1'}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, barStyle]} />
      </View>

      <View style={styles.footer}>
        <View style={styles.avatarStack}>
          {avatars.map((avatar, index) => (
            <Image
              key={index}
              source={{ uri: avatar }}
              style={[styles.avatar, { marginLeft: index === 0 ? 0 : -10 }]}
              contentFit="cover"
              transition={200}
            />
          ))}
        </View>
        <Text style={styles.footerText}>
          {circle.memberCount - 3 > 0 ? `+${circle.memberCount - 3}` : ''}
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.progressPercent}>
          {Math.round((CYCLE_PROGRESS[circle.id] ?? 0.5) * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 14,
    marginHorizontal: 24,
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
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  info: { flex: 1 },
  name: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  subtext: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: colors.textMuted,
  },
  turnChip: {
    backgroundColor: colors.primary.tint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  turnText: { fontFamily: 'WorkSansSemiBold', fontSize: 11, color: colors.primary.DEFAULT },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.DEFAULT,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: colors.bg,
  },
  footerText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 6,
  },
  progressPercent: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: colors.primary.DEFAULT,
  },
});
