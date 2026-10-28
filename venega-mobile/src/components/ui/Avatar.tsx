import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@venega/design-tokens';

type Props = {
  /** Nom complet — sert aux initiales quand il n'y a pas de photo. */
  name: string;
  uri?: string | null;
  size?: number;
  /** Anneau ambre (bénéficiaire du tour, personne mise en avant). */
  highlighted?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '';
  return (first + last).toUpperCase();
}

/** Avatar unique de l'application : photo si disponible, sinon initiales sur fond vert clair. */
export default function Avatar({ name, uri, size = 40, highlighted, style }: Props) {
  const box = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  const ring = highlighted ? { borderWidth: 2, borderColor: colors.accent.DEFAULT } : null;

  if (uri) {
    return (
      <View style={[box, ring, styles.clip, style]}>
        <Image source={{ uri }} style={styles.fill} contentFit="cover" transition={150} />
      </View>
    );
  }
  return (
    <View style={[box, ring, styles.fallback, style]} accessibilityLabel={name}>
      <Text style={[styles.initials, { fontSize: Math.round(size * 0.38) }]} numberOfLines={1}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', backgroundColor: colors.fill },
  fill: { width: '100%', height: '100%' },
  fallback: { backgroundColor: colors.primary.tint, justifyContent: 'center', alignItems: 'center' },
  initials: { fontWeight: '600', color: colors.primary.dark },
});
