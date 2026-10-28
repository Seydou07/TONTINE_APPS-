import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, sizes } from '@venega/design-tokens';

type Props = {
  icon: LucideIcon;
  onPress?: () => void;
  accessibilityLabel: string;
  /** `plain` : sans fond, pour les barres d'en-tête. */
  variant?: 'filled' | 'plain';
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export default function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  variant = 'filled',
  color = colors.ink,
  style,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, variant === 'filled' && styles.filled, style]}
    >
      <Icon size={22} color={color} strokeWidth={2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: sizes.iconButton / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filled: {
    backgroundColor: colors.fill,
  },
});
