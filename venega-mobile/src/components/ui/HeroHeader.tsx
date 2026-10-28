import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '@venega/design-tokens';

/**
 * Bandeau fixe derrière la barre d'état : reste vert quand le contenu défile dessous.
 * À placer une fois, hors du ScrollView, en haut des écrans qui utilisent `HeroHeader`.
 */
export function HeroStatusBar() {
  const insets = useSafeAreaInsets();
  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={[styles.statusStrip, { height: insets.top }]} />
    </>
  );
}

type HeroHeaderProps = {
  children: React.ReactNode;
  /** Hauteur (px) dont la carte suivante chevauche le bandeau — elle prend `marginTop: -overlap`. */
  overlap?: number;
  style?: StyleProp<ViewStyle>;
};

/** Première section des écrans principaux : aplat vert, coins bas arrondis. */
export default function HeroHeader({ children, overlap = 0, style }: HeroHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.hero, { paddingTop: insets.top + 16, paddingBottom: 24 + overlap }, style]}>
      {children}
    </View>
  );
}

type HeroTitleProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

/** Titre d'écran blanc + sous-titre, avec une action éventuelle à droite. */
export function HeroTitle({ title, subtitle, right }: HeroTitleProps) {
  return (
    <View style={styles.titleRow}>
      <View style={styles.flex}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export const heroColors = {
  text: '#FFFFFF',
  textSoft: 'rgba(255,255,255,0.72)',
  accent: colors.accent.DEFAULT,
  /** Fond des boutons ronds posés sur le vert. */
  button: 'rgba(255,255,255,0.12)',
};

const styles = StyleSheet.create({
  statusStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.primary.dark,
  },
  hero: {
    backgroundColor: colors.primary.dark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
  },
  flex: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { ...typography.title, color: heroColors.text },
  subtitle: { ...typography.footnote, color: heroColors.textSoft, marginTop: 2 },
});
