import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, typography } from '@venega/design-tokens';
import { Avatar } from '../../../components/ui';

/*
 * Roue de rotation d'une tontine : les profils des membres sont disposés en
 * cercle autour d'une pastille centrale (bénéficiaire du tour). Le bénéficiaire
 * a un liseré vert et un halo animé, les membres déjà servis un liseré ambre.
 */

const WHEEL_SIZE = 240;
const CENTER_SIZE = 116;
const AVATAR_SIZE = 42;
const MIN_AVATAR_SIZE = 26;
const AVATAR_RADIUS = 98;
const AVATAR_GAP = 4;
const CIRCUMFERENCE = 2 * Math.PI * AVATAR_RADIUS;
/** Places disponibles sur la roue à la taille minimale ; au-delà, « +N » pour le reste. */
const MAX_SLOTS = Math.floor(CIRCUMFERENCE / (MIN_AVATAR_SIZE + AVATAR_GAP));

/** Les photos rétrécissent avec le nombre de membres pour ne jamais se chevaucher. */
const avatarSizeFor = (slots: number) =>
  Math.max(MIN_AVATAR_SIZE, Math.min(AVATAR_SIZE, Math.floor(CIRCUMFERENCE / Math.max(slots, 1)) - AVATAR_GAP));

export type WheelMember = {
  userId: string;
  name: string;
  avatarUrl?: string;
  hasReceived: boolean;
};

export default function RotationWheel({
  title = 'Tour actuel de rotation',
  members,
  beneficiaryUserId,
  centerLabel = 'Bénéficiaire',
  centerName,
  centerCaption,
  onPressMember,
  children,
}: {
  title?: string;
  /** Membres dans l'ordre de passage. */
  members: WheelMember[];
  beneficiaryUserId?: string;
  centerLabel?: string;
  centerName: string;
  centerCaption?: string;
  onPressMember?: (userId: string) => void;
  /** Contenu affiché sous la légende, dans la même carte (ex. boutons d'action). */
  children?: React.ReactNode;
}) {
  // Grand cercle : on montre les prochains passages à partir du bénéficiaire, puis « +N ».
  const overflow = members.length > MAX_SLOTS ? members.length - (MAX_SLOTS - 1) : 0;
  const start = Math.max(members.findIndex((m) => m.userId === beneficiaryUserId), 0);
  const visible: WheelMember[] = overflow
    ? Array.from({ length: MAX_SLOTS - 1 }, (_, i) => members[(start + i) % members.length]!)
    : members;
  const slots = visible.length + (overflow ? 1 : 0);
  const stepAngle = 360 / Math.max(slots, 1);
  const size = avatarSizeFor(slots);
  const position = (index: number) => {
    const angle = (index * stepAngle - 90) * (Math.PI / 180);
    return { cx: WHEEL_SIZE / 2 + AVATAR_RADIUS * Math.cos(angle), cy: WHEEL_SIZE / 2 + AVATAR_RADIUS * Math.sin(angle) };
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.wheel}>
        <View style={styles.wheelCenter}>
          <Text style={styles.centerLabel}>{centerLabel}</Text>
          <Text style={styles.centerName} numberOfLines={1}>
            {centerName}
          </Text>
          {!!centerCaption && <Text style={styles.centerCycle}>{centerCaption}</Text>}
        </View>

        {visible.map((member, index) => {
          const { cx, cy } = position(index);
          return (
            <WheelAvatar
              key={member.userId}
              name={member.name}
              avatarUrl={member.avatarUrl}
              size={size}
              cx={cx}
              cy={cy}
              isBeneficiary={member.userId === beneficiaryUserId}
              hasReceived={member.hasReceived}
              onPress={onPressMember ? () => onPressMember(member.userId) : undefined}
            />
          );
        })}
        {overflow > 0 && <OverflowBubble count={overflow} size={size} {...position(visible.length)} />}
      </View>

      {/* Légende */}
      <View style={styles.legendRow}>
        <LegendItem color={colors.primary.DEFAULT} label="Bénéficiaire du tour" />
        <LegendItem color={colors.accent.DEFAULT} label="Déjà servi" />
        <LegendItem color={colors.lineStrong} label="En attente" />
      </View>

      {children ? <View style={styles.footer}>{children}</View> : null}
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function OverflowBubble({ count, size, cx, cy }: { count: number; size: number; cx: number; cy: number }) {
  return (
    <View
      accessibilityLabel={`Et ${count} autres membres`}
      style={[
        styles.avatarWrap,
        styles.overflow,
        { width: size, height: size, borderRadius: size / 2, transform: [{ translateX: cx - size / 2 }, { translateY: cy - size / 2 }] },
      ]}
    >
      <Text style={styles.overflowText}>+{count}</Text>
    </View>
  );
}

function WheelAvatar({
  name,
  avatarUrl,
  size,
  cx,
  cy,
  isBeneficiary,
  hasReceived,
  onPress,
}: {
  name: string;
  avatarUrl?: string;
  size: number;
  cx: number;
  cy: number;
  isBeneficiary: boolean;
  hasReceived: boolean;
  onPress?: () => void;
}) {
  const progress = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    if (isBeneficiary) {
      halo.value = withRepeat(
        withSequence(withTiming(1, { duration: 1100 }), withTiming(0, { duration: 1100 })),
        -1,
        false
      );
    } else {
      halo.value = 0;
    }
  }, [isBeneficiary]);

  const avatarStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: cx - size / 2 }, { translateY: cy - size / 2 }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: (1 - halo.value) * 0.5,
    transform: [
      { translateX: cx - size / 2 },
      { translateY: cy - size / 2 },
      { scale: 1 + halo.value * 0.35 },
    ],
  }));

  const borderColor = isBeneficiary ? colors.primary.DEFAULT : hasReceived ? colors.accent.DEFAULT : colors.lineStrong;
  const dims = { width: size, height: size, borderRadius: size / 2 };
  const avatar = <Avatar name={name} uri={avatarUrl} size={size - 6} />;

  return (
    <>
      {isBeneficiary && <Animated.View pointerEvents="none" style={[styles.haloRing, dims, haloStyle]} />}
      <Animated.View style={[styles.avatarWrap, dims, { borderColor }, avatarStyle]}>
        {onPress ? (
          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Voir le profil de ${name}`}
            onPress={onPress}
            style={styles.avatarTouch}
          >
            {avatar}
          </TouchableOpacity>
        ) : (
          avatar
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  cardTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
  },

  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    marginTop: 16,
    marginBottom: 6,
  },
  wheelCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -CENTER_SIZE / 2,
    marginTop: -CENTER_SIZE / 2,
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  centerLabel: { ...typography.caption, color: colors.muted },
  centerName: { ...typography.headline, color: colors.primary.dark, marginTop: 2 },
  centerCycle: { ...typography.caption, color: colors.primary.DEFAULT, marginTop: 2 },
  avatarWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  overflow: { borderColor: colors.lineStrong, backgroundColor: colors.fill },
  overflowText: { ...typography.caption, fontWeight: '700', color: colors.inkSoft },
  avatarTouch: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  haloRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary.soft,
  },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
    alignSelf: 'stretch',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...typography.caption, fontWeight: '400', color: colors.muted },

  footer: {
    alignSelf: 'stretch',
    marginTop: 16,
    paddingTop: 16,
    paddingHorizontal: 4,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
