import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import { Role } from '@venega/types';
import { IconButton } from '../../../components/ui';

/* Éléments de présentation partagés par les écrans de la caisse de solidarité. */

const avatarPalette: string[] = [
  colors.accent.DEFAULT,
  colors.primary.DEFAULT,
  colors.purple.DEFAULT,
  colors.info.DEFAULT,
  colors.accent.dark,
  colors.danger.DEFAULT,
];

export const avatarColor = (userId: string) => {
  const sum = userId.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length] ?? colors.primary.DEFAULT;
};

export const nameInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

/** En-tête blanc de 56 px : retour, titre centré (et sous-titre), action facultative. */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title?: string;
  subtitle?: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={onBack} />
      <View style={styles.headerText}>
        {title ? (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

/** Avatar rond : photo, ou initiales sur fond de couleur stable. */
export function Avatar({
  name,
  userId,
  photoUrl,
  size = 40,
  tone = 'solid',
}: {
  name?: string;
  userId?: string;
  photoUrl?: string;
  size?: number;
  tone?: 'solid' | 'soft';
}) {
  const dims = { width: size, height: size, borderRadius: size / 2 };
  if (photoUrl) return <Image source={{ uri: photoUrl }} style={[styles.avatar, dims]} />;
  const soft = tone === 'soft';
  return (
    <View
      style={[
        styles.avatar,
        dims,
        { backgroundColor: soft ? colors.primary.tint : avatarColor(userId ?? name ?? '') },
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          { fontSize: Math.round(size * 0.34), color: soft ? colors.primary.DEFAULT : '#FFFFFF' },
        ]}
      >
        {nameInitials(name)}
      </Text>
    </View>
  );
}

const roleTone: Partial<Record<Role, { bg: string; fg: string }>> = {
  [Role.PRESIDENT]: { bg: colors.accent.tint, fg: colors.accent.deep },
  [Role.TREASURER]: { bg: colors.primary.tint, fg: colors.primary.DEFAULT },
  [Role.SECRETARY]: { bg: colors.info.tint, fg: colors.info.DEFAULT },
};

/** Petite étiquette de statut ou de rôle. */
export function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

/** Étiquette de rôle — n'affiche rien pour un simple membre, sauf si `always`. */
export function RoleBadge({ role, label, always }: { role: Role; label: string; always?: boolean }) {
  const tone = roleTone[role] ?? (always ? { bg: colors.fill, fg: colors.inkSoft } : undefined);
  if (!tone) return null;
  return <Badge label={label} bg={tone.bg} fg={tone.fg} />;
}

/** État vide : pastille 56 px, titre et texte centrés. */
export function EmptyState({
  icon: Icon,
  title,
  text,
  style,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.empty, style]}>
      <View style={styles.emptyIcon}>
        <Icon size={24} color={colors.muted} strokeWidth={1.8} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
    </View>
  );
}

export const cardStyle = {
  backgroundColor: colors.bg,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.line,
} as const;

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.bg,
  },
  headerText: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  headerTitle: { ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSub: { ...typography.caption, fontWeight: '400', color: colors.muted, textAlign: 'center' },
  headerRight: { width: 40, alignItems: 'center' },

  avatar: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarText: { fontWeight: '600' },

  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { ...typography.caption, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: { ...typography.headline, color: colors.ink, textAlign: 'center' },
  emptyText: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
