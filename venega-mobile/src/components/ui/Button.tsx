import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, sizes, typography } from '@venega/design-tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary.DEFAULT, fg: '#FFFFFF' },
  secondary: { bg: colors.bg, fg: colors.ink, border: colors.lineStrong },
  ghost: { bg: 'transparent', fg: colors.primary.DEFAULT },
  danger: { bg: colors.danger.DEFAULT, fg: '#FFFFFF' },
};

/** Bouton standard de l'application — une seule forme, quatre variantes. */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  style,
}: Props) {
  const p = palette[variant];
  const inactive = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        styles.base,
        { height: size === 'sm' ? sizes.buttonSmall : sizes.button, backgroundColor: p.bg },
        p.border ? { borderWidth: 1, borderColor: p.border } : null,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={size === 'sm' ? 16 : 18} color={p.fg} strokeWidth={2} /> : null}
          <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: p.fg }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...typography.bodyStrong,
    fontSize: 16,
  },
  labelSm: {
    fontSize: 14,
  },
  disabled: {
    opacity: 0.4,
  },
});
