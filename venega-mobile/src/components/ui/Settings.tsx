import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ChevronRight, Lock } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, motion, numeric, radius, shadows, typography } from '@venega/design-tokens';

/* ── Mouvement ── */

/**
 * Entrée en cascade discrète (opacité + 8 px), désactivée si l'utilisateur
 * a demandé de réduire les animations.
 */
export function useCascade() {
  const reduced = useReducedMotion();
  return (index: number) =>
    reduced
      ? undefined
      : FadeInDown.duration(motion.slow)
          .delay(Math.min(index, 10) * motion.stagger)
          .withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] });
}

type PressableScaleProps = {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Échelle au toucher (0.98 par défaut : à peine perceptible, mais vivant). */
  scaleTo?: number;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'radio' | 'switch' | 'checkbox';
  accessibilityState?: { selected?: boolean; checked?: boolean; disabled?: boolean };
  accessibilityHint?: string;
  hitSlop?: number;
};

/** Zone pressable qui se tasse légèrement au toucher (transform seulement). */
export function PressableScale({
  onPress,
  disabled,
  children,
  style,
  scaleTo = 0.98,
  hitSlop,
  ...a11y
}: PressableScaleProps) {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - scaleTo) }],
    opacity: 1 - pressed.value * 0.06,
  }));
  const set = (v: number) => {
    pressed.value = reduced ? v : withTiming(v, { duration: v ? 90 : motion.fast });
  };
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      onPressIn={() => set(1)}
      onPressOut={() => set(0)}
      hitSlop={hitSlop}
      {...a11y}
    >
      <Animated.View style={[style, animated]}>{children}</Animated.View>
    </Pressable>
  );
}

/* ── Sections de réglages ── */

type SectionProps = {
  title?: string;
  /** Texte d'aide sous la carte. */
  footer?: string;
  /** Rang d'apparition (entrée en cascade). */
  index?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Groupe de lignes de réglages : titre, carte blanche aux ombres très douces, note facultative. */
export function SettingsSection({ title, footer, index = 0, children, style }: SectionProps) {
  const cascade = useCascade();
  return (
    <Animated.View entering={cascade(index)} style={[styles.section, style]}>
      {title ? (
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View style={styles.card}>{children}</View>
      {footer ? <Text style={styles.sectionFooter}>{footer}</Text> : null}
    </Animated.View>
  );
}

export type Tone = 'primary' | 'accent' | 'neutral' | 'danger';

const tones: Record<Tone, { fg: string; bg: string }> = {
  primary: { fg: colors.primary.DEFAULT, bg: colors.primary.tint },
  accent: { fg: colors.accent.dark, bg: colors.accent.tint },
  neutral: { fg: colors.inkSoft, bg: colors.fill },
  danger: { fg: colors.danger.DEFAULT, bg: colors.danger.tint },
};

type RowProps = {
  icon?: LucideIcon;
  tone?: Tone;
  title: string;
  subtitle?: string;
  /** Valeur courte à droite (« 10 000 F », « Chaque samedi »). */
  value?: string;
  /** Pastille à droite (« 2 en attente »). */
  badge?: string;
  /** Élément à droite à la place de la valeur (interrupteur…). */
  accessory?: React.ReactNode;
  /** Réglage verrouillé : cadenas, valeur grisée ; le toucher explique pourquoi. */
  locked?: boolean;
  onPress?: () => void;
  last?: boolean;
  accessibilityHint?: string;
};

/**
 * Ligne de réglage : icône dans une pastille teintée, titre, sous-titre explicatif court,
 * valeur à droite, chevron ou cadenas.
 */
export function SettingsRow({
  icon: Icon,
  tone = 'primary',
  title,
  subtitle,
  value,
  badge,
  accessory,
  locked,
  onPress,
  last,
  accessibilityHint,
}: RowProps) {
  const t = tones[locked ? 'neutral' : tone];
  const danger = tone === 'danger';
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={[title, value, locked ? 'verrouillé' : undefined].filter(Boolean).join(', ')}
      accessibilityHint={accessibilityHint}
      style={styles.row}
    >
      {Icon ? (
        <View style={[styles.icon, { backgroundColor: t.bg }]}>
          <Icon size={18} color={t.fg} strokeWidth={2} />
        </View>
      ) : null}
      <View style={[styles.rowBody, !last && styles.rowBorder]}>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, danger && { color: colors.danger.DEFAULT }]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.rowSubtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        {value ? (
          <Text style={[styles.value, locked && styles.valueLocked]} numberOfLines={2}>
            {value}
          </Text>
        ) : null}
        {accessory}
        {locked ? (
          <Lock size={15} color={colors.subtle} strokeWidth={2.2} />
        ) : onPress && !accessory ? (
          <ChevronRight size={18} color={colors.subtle} />
        ) : null}
      </View>
    </PressableScale>
  );
}

/* ── Carte verte des chiffres clés ── */

export type KeyFigure = { label: string; value: string };

/**
 * Récapitulatif visuel posé sur le bandeau vert : nom, étiquette, 2 à 4 chiffres clés
 * alignés (chiffres tabulaires), ligne d'état facultative.
 */
export function KeyFiguresCard({
  eyebrow,
  title,
  figures,
  status,
  statusIcon: StatusIcon,
}: {
  eyebrow?: string;
  title: string;
  figures: KeyFigure[];
  status?: string;
  statusIcon?: LucideIcon;
}) {
  return (
    <View style={styles.keyCard}>
      {eyebrow ? <Text style={styles.keyEyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.keyTitle} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.keyGrid}>
        {figures.map((f, i) => (
          <View key={f.label} style={[styles.keyCell, i % 2 === 1 && styles.keyCellRight]}>
            <Text style={styles.keyValue} numberOfLines={1} adjustsFontSizeToFit>
              {f.value}
            </Text>
            <Text style={styles.keyLabel} numberOfLines={1}>
              {f.label}
            </Text>
          </View>
        ))}
      </View>
      {status ? (
        <View style={styles.keyStatus}>
          {StatusIcon ? <StatusIcon size={14} color={colors.accent.DEFAULT} strokeWidth={2.2} /> : null}
          <Text style={styles.keyStatusText}>{status}</Text>
        </View>
      ) : null}
    </View>
  );
}

/* ── État vide ── */

export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text?: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon size={22} color={colors.primary.DEFAULT} strokeWidth={1.8} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  sectionTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionFooter: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.muted,
    marginTop: 8,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    ...shadows.soft,
  },

  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, gap: 12, minHeight: 56 },
  icon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    paddingVertical: 12,
    paddingRight: 16,
    minHeight: 56,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowText: { flex: 1 },
  rowTitle: { ...typography.body, fontWeight: '500', color: colors.ink },
  rowSubtitle: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  value: { ...typography.callout, ...numeric, color: colors.inkSoft, maxWidth: 150, textAlign: 'right' },
  valueLocked: { color: colors.subtle },
  badge: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.tint,
    justifyContent: 'center',
  },
  badgeText: { ...typography.caption, ...numeric, color: colors.accent.dark },

  keyCard: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  keyEyebrow: {
    ...typography.caption,
    color: colors.accent.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  keyTitle: { ...typography.title, color: '#FFFFFF' },
  keyGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, rowGap: 16 },
  keyCell: { width: '50%', paddingRight: 8 },
  keyCellRight: { paddingRight: 0, paddingLeft: 8 },
  keyValue: { ...typography.headline, ...numeric, color: '#FFFFFF' },
  keyLabel: { ...typography.caption, fontWeight: '400', color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  keyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  keyStatusText: { flex: 1, ...typography.footnote, color: 'rgba(255,255,255,0.88)' },

  empty: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: { ...typography.bodyStrong, color: colors.ink, textAlign: 'center' },
  emptyText: { ...typography.footnote, color: colors.muted, textAlign: 'center', marginTop: 4 },
});
